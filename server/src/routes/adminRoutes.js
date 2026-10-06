import { Router } from 'express';
import { body } from 'express-validator';
import { getDashboard, listAllOrders, listUsers, updateUser } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect, requireAdmin);
router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.patch('/users/:id', [body('role').optional().isIn(['customer', 'admin']), body('disabled').optional().isBoolean()], validate, updateUser);
router.get('/orders', listAllOrders);

export default router;
