import { Router } from 'express';
import { body } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import { getProfile, login, register, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters.'),
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters.'),
], validate, register);
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 1, max: 72 }).withMessage('Enter your password.'),
], validate, login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('address.line1').optional().trim().isLength({ max: 120 }),
  body('address.city').optional().trim().isLength({ max: 80 }),
  body('address.postalCode').optional().trim().isLength({ max: 20 }),
  body('address.country').optional().trim().isLength({ max: 80 }),
], validate, updateProfile);

export default router;
