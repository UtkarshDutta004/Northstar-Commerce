import { Router } from 'express';
import { body } from 'express-validator';
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);
router.post('/', [
  body('paymentIntentId').matches(/^pi_[a-zA-Z0-9]+$/),
  body('shippingAddress.line1').trim().isLength({ min: 3, max: 120 }),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 80 }),
  body('shippingAddress.postalCode').trim().isLength({ min: 2, max: 20 }),
  body('shippingAddress.country').trim().isLength({ min: 2, max: 80 }),
  body('items').isArray({ min: 1, max: 50 }),
], validate, createOrder);
router.get('/mine', getMyOrders);
router.patch('/:id/status', requireAdmin, body('status').isIn(['processing', 'shipped', 'delivered', 'cancelled']), validate, updateOrderStatus);
router.get('/:id', getOrder);

export default router;
