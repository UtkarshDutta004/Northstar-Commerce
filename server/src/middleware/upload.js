import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new AppError('Upload a JPG, PNG, WebP, or AVIF image.', 400));
    callback(null, true);
  },
});
