import { Router } from 'express';
import { body } from 'express-validator';
import { createReview, listProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router({ mergeParams: true });
router.get('/', listProductReviews);
router.post('/', protect, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').trim().isLength({ min: 2, max: 100 }),
  body('comment').trim().isLength({ min: 5, max: 1000 }),
], validate, createReview);

export default router;
