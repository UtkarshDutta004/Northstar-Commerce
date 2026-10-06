import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  stripePaymentIntentId: { type: String, required: true, unique: true },
  paymentStatus: { type: String, enum: ['paid', 'refunded'], default: 'paid' },
  status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
