import { createHash } from 'node:crypto';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateTotalCents } from '../utils/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const requested = Array.isArray(req.body.items) ? req.body.items : [];
  if (!requested.length || requested.length > 50) throw new AppError('Your cart is empty or too large.', 400);
  const quantities = new Map();
  for (const item of requested) {
    const id = String(item.productId || '');
    const quantity = Number(item.quantity);
    if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new AppError('One or more cart items are invalid.', 400);
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  if (products.length !== quantities.size) throw new AppError('A product in your cart is no longer available.', 409);

  const subtotalCents = products.reduce((sum, product) => {
    const quantity = quantities.get(product._id.toString());
    if (quantity > product.stock) throw new AppError(`${product.name} does not have enough stock.`, 409);
    return sum + Math.round(product.price * 100) * quantity;
  }, 0);
  const amount = calculateTotalCents(subtotalCents);
  const cartFingerprint = createHash('sha256').update(JSON.stringify([...quantities.entries()].sort())).digest('hex');
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  }, { idempotencyKey: `${req.user._id}:${cartFingerprint}:${amount}` });
  res.json({ clientSecret: intent.client_secret, amount });
});

export { stripe };
