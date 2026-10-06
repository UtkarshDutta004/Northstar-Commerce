import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateTotalCents } from '../utils/pricing.js';
import { stripe } from './paymentController.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { paymentIntentId, shippingAddress, items } = req.body;
  if (!Array.isArray(items) || !items.length) throw new AppError('Your cart is empty.', 400);
  const existing = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (existing) {
    if (existing.user.toString() !== req.user._id.toString()) throw new AppError('Order not found.', 404);
    return res.status(200).json({ order: existing });
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== 'succeeded' || intent.metadata.userId !== req.user._id.toString()) {
    throw new AppError('Payment could not be verified.', 400);
  }

  const quantities = new Map();
  for (const item of items) {
    const id = String(item.productId || '');
    const quantity = Number(item.quantity);
    if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new AppError('One or more cart items are invalid.', 400);
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  if (products.length !== quantities.size) throw new AppError('A product in your order is no longer available.', 409);
  const subtotalCents = products.reduce((sum, product) => sum + Math.round(product.price * 100) * quantities.get(product._id.toString()), 0);
  const totalCents = calculateTotalCents(subtotalCents);
  if (intent.amount !== totalCents || intent.currency !== 'usd') {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    throw new AppError('The paid amount did not match the current order and has been refunded.', 400);
  }

  const decremented = [];
  try {
    for (const product of products) {
      const quantity = quantities.get(product._id.toString());
      const result = await Product.updateOne({ _id: product._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
      if (!result.modifiedCount) throw new AppError(`${product.name} has just sold out.`, 409);
      decremented.push({ id: product._id, quantity });
    }
  } catch (error) {
    await Promise.all(decremented.map(({ id, quantity }) => Product.updateOne({ _id: id }, { $inc: { stock: quantity } })));
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    throw error;
  }

  const subtotal = subtotalCents / 100;
  const total = totalCents / 100;
  try {
    const order = await Order.create({
      user: req.user._id,
      items: products.map((product) => ({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        price: product.price,
        quantity: quantities.get(product._id.toString()),
      })),
      shippingAddress,
      subtotal,
      shipping: total - subtotal,
      total,
      stripePaymentIntentId: paymentIntentId,
    });
    res.status(201).json({ order });
  } catch (error) {
    await Promise.all(decremented.map(({ id, quantity }) => Product.updateOne({ _id: id }, { $inc: { stock: quantity } })));
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    throw error;
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new AppError('Order not found.', 404);
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) throw new AppError('Order not found.', 404);
  res.json({ order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.status === 'cancelled' && req.body.status !== 'cancelled') {
    throw new AppError('Cancelled orders cannot be reopened.', 400);
  }
  if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
    if (order.status === 'delivered') throw new AppError('Delivered orders cannot be cancelled.', 400);
    if (order.paymentStatus === 'paid') {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
      order.paymentStatus = 'refunded';
    }
    await Promise.all(order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })));
  }
  order.status = req.body.status;
  await order.save();
  res.json({ order });
});
