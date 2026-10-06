import { Router } from 'express';
import { body } from 'express-validator';
import { createProduct, deleteProduct, getProduct, listCategories, listProducts, updateProduct } from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const productFields = [
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('slug').trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  body('description').trim().isLength({ min: 10, max: 3000 }),
  body('price').isFloat({ min: 0 }),
  body('category').isMongoId(),
  body('stock').isInt({ min: 0 }),
  body('images').isArray({ min: 1, max: 8 }),
  body('images.*.url').isURL({ protocols: ['https'], require_protocol: true }),
  body('images.*.publicId').optional().isString().trim().isLength({ max: 160 }),
  body('featured').optional().isBoolean(),
];

router.get('/categories', listCategories);
router.get('/', listProducts);
router.get('/:slug', getProduct);
router.post('/', protect, requireAdmin, productFields, validate, createProduct);
router.patch('/:id', protect, requireAdmin, [body('price').optional().isFloat({ min: 0 }), body('stock').optional().isInt({ min: 0 }), body('name').optional().trim().isLength({ min: 2, max: 120 }), body('description').optional().trim().isLength({ min: 10, max: 3000 }), body('images').optional().isArray({ min: 1, max: 8 })], validate, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

export default router;
