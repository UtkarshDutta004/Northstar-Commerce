import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('_id');
  if (!product) throw new AppError('Product not found.', 404);
  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
  res.json({ reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new AppError('Product not found.', 404);
  const purchased = await Order.exists({ user: req.user._id, 'items.product': product._id, status: { $ne: 'cancelled' } });
  if (!purchased) throw new AppError('Only verified customers can review this item.', 403);
  const review = await Review.create({ ...req.body, product: product._id, user: req.user._id, name: req.user.name });
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: product._id }, { averageRating: stats[0].averageRating, reviewCount: stats[0].reviewCount });
  res.status(201).json({ review });
});
