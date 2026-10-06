import '../config/env.js';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const categories = [
  { name: 'Everyday Carry', slug: 'everyday-carry', description: 'Thoughtful essentials for the daily commute.' },
  { name: 'Desk & Home', slug: 'desk-home', description: 'Useful objects for more considered spaces.' },
  { name: 'Field Notes', slug: 'field-notes', description: 'Reliable tools for time spent outside.' },
];

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

const catalog = [
  { name: 'Arc Utility Tote', slug: 'arc-utility-tote', category: 'everyday-carry', price: 68, compareAtPrice: 82, stock: 24, featured: true, description: 'A daily carryall cut from hard-wearing recycled canvas, with a padded sleeve and a generous interior pocket.' , image: 'photo-1553062407-98eeb64c6a62' },
  { name: 'Field Bottle 750', slug: 'field-bottle-750', category: 'field-notes', price: 42, stock: 38, featured: true, description: 'Double-wall stainless steel keeps drinks cold for 24 hours or hot for 12. A quiet, dependable companion.' , image: 'photo-1602143407151-7111542de6e8' },
  { name: 'Taper Desk Lamp', slug: 'taper-desk-lamp', category: 'desk-home', price: 118, compareAtPrice: 140, stock: 12, featured: true, description: 'A compact, dimmable LED lamp with warm light, an aluminum shade and a weighted, non-slip base.' , image: 'photo-1507473885765-e6ed057f782c' },
  { name: 'Grid Notebook Set', slug: 'grid-notebook-set', category: 'desk-home', price: 24, stock: 65, description: 'Three thread-bound notebooks with smooth recycled paper, a subtle dot grid and a lay-flat spine.' , image: 'photo-1531346878377-a5be20888e57' },
  { name: 'Trail Cap', slug: 'trail-cap', category: 'field-notes', price: 36, stock: 29, featured: true, description: 'Lightweight six-panel cap in quick-drying ripstop, finished with an adjustable webbing strap.' , image: 'photo-1588850561407-ed78c282e89b' },
  { name: 'Transit Sling', slug: 'transit-sling', category: 'everyday-carry', price: 84, stock: 17, description: 'A weather-resistant crossbody with modular internal storage sized for the things you reach for most.' , image: 'photo-1548036328-c9fa89d128fa' },
  { name: 'Camp Cup Pair', slug: 'camp-cup-pair', category: 'field-notes', price: 32, stock: 41, description: 'Two enamel-coated steel cups made for slow mornings and long evenings, at home or out there.' , image: 'photo-1514228742587-6b1558fcca3d' },
  { name: 'Cable Keeper', slug: 'cable-keeper', category: 'desk-home', price: 18, stock: 80, description: 'A small, magnetic desk organizer that keeps charging cables in reach and off the floor.' , image: 'photo-1498050108023-c5249f4df085' },
];

try {
  await connectDatabase();
  for (const category of categories) await Category.updateOne({ slug: category.slug }, { $set: category }, { upsert: true });
  const categoryMap = new Map((await Category.find()).map((category) => [category.slug, category._id]));
  for (const item of catalog) {
    const { image: imageId, category, ...fields } = item;
    await Product.updateOne({ slug: fields.slug }, {
      $set: { ...fields, category: categoryMap.get(category), images: [{ url: image(imageId), publicId: '' }] },
    }, { upsert: true, runValidators: true });
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const admin = await User.findOne({ email }).select('+password');
  if (!admin) await User.create({ name: process.env.SEED_ADMIN_NAME || 'Store Admin', email, password, role: 'admin' });
  else if (admin.role !== 'admin') { admin.role = 'admin'; await admin.save(); }
  console.log(`Seed complete. Admin: ${email}`);
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
