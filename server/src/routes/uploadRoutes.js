import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();
router.post('/image', protect, requireAdmin, imageUpload.single('image'), uploadImage);

export default router;
