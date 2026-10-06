import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

try {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Set MONGODB_URI, JWT_SECRET, and STRIPE_SECRET_KEY before starting the API.');
  }
  await connectDatabase();
  app.listen(port, () => console.log(`API listening on port ${port}`));
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}
