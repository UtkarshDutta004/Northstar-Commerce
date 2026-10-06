import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const [users, products, orders, revenue] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);
  res.json({ stats: { users, products, orders, revenue: revenue[0]?.total || 0 } });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.json({ users });
});

export const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString() && (req.body.disabled || req.body.role === 'customer')) {
    throw new AppError('You cannot disable or demote your own account.', 400);
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (typeof req.body.disabled === 'boolean') user.disabled = req.body.disabled;
  if (['admin', 'customer'].includes(req.body.role)) user.role = req.body.role;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, disabled: user.disabled } });
});

export const listAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ orders });
});
