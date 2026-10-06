import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) throw new AppError('Sign in to continue.', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Your session is invalid or expired. Please sign in again.', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.disabled) throw new AppError('This account is unavailable.', 401);
  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new AppError('Administrator access required.', 403));
  next();
};
