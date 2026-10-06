import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw new AppError('An account with this email already exists.', 409);
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Email or password is incorrect.', 401);
  }
  if (user.disabled) throw new AppError('This account is unavailable.', 403);
  res.json({ token: issueToken(user), user: publicUser(user) });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  if (name) req.user.name = name;
  if (address) req.user.address = address;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
