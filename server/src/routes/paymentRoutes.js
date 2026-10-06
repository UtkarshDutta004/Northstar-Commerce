import { Router } from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/intent', protect, createPaymentIntent);

export default router;
