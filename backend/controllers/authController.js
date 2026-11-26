import User, { SUGGESTED_ROUTES } from '../models/User.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, mainRoute, bio } = req.body;

  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, 'Full name, username, email, and password are required.');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }
    throw new ApiError(409, 'This username is already taken. Please choose another.');
  }

  const selectedRoute = SUGGESTED_ROUTES.includes(mainRoute) ? mainRoute : 'Thika Road';

  const user = await User.create({
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    mainRoute: selectedRoute,
    bio: bio ? bio.trim() : '',
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Welcome to Njia CommunityHub! Your account has been created.',
    token,
    user: {
      ...user.toJSON(),
      postCount: 0,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, email, password } = req.body;
  const identifier = (emailOrUsername || email || '').trim().toLowerCase();

  if (!identifier || !password) {
    throw new ApiError(400, 'Please enter your email/username and password.');
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid login credentials.');
  }

  if (user.isSuspended) {
    throw new ApiError(
      403,
      `Your account has been suspended${user.suspensionReason ? `: ${user.suspensionReason}` : '.'}`
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid login credentials.');
  }

  const postCount = await Post.countDocuments({ author: user._id, isRemoved: false });
  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      ...user.toJSON(),
      postCount,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const postCount = await Post.countDocuments({ author: req.user._id, isRemoved: false });

  res.status(200).json({
    success: true,
    user: {
      ...req.user.toJSON(),
      postCount,
    },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});
