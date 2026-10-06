import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = {};
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (!category) return res.json({ products: [], page, pages: 0, total: 0 });
    filter.category = category._id;
  }
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Math.max(0, Number(req.query.minPrice));
    if (req.query.maxPrice) filter.price.$lte = Math.max(0, Number(req.query.maxPrice));
  }
  const search = req.query.search?.trim();
  const searchFilter = search ? { $text: { $search: search.slice(0, 80) } } : {};
  const query = { ...filter, ...searchFilter };
  const sortMap = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { averageRating: -1 } };
  const [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name slug').sort(sortMap[req.query.sort] || { featured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(query),
  ]);
  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) throw new AppError('Product not found.', 404);
  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ product, reviews });
});

export const listCategories = asyncHandler(async (_req, res) => {
  res.json({ categories: await Category.find().sort({ name: 1 }) });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found.', 404);
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found.', 404);
  res.json({ message: 'Product removed.' });
});
