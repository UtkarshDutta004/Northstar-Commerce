import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, lowercase: true, unique: true, trim: true },
  description: { type: String, trim: true, maxlength: 240 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
