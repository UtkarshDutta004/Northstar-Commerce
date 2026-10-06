import { Readable } from 'node:stream';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'northstar/products', resource_type: 'image' }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from([buffer]).pipe(stream);
  });
}

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose an image to upload.', 400);
  const image = await uploadBuffer(req.file.buffer);
  res.status(201).json({ url: image.secure_url, publicId: image.public_id });
});
