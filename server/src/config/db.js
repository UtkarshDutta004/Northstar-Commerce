import mongoose from 'mongoose';

export async function connectDatabase() {
  const connection = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${connection.connection.host}`);
}
