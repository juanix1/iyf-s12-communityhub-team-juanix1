import User, { SUGGESTED_ROUTES } from '../models/User.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-email');

  if (!user) {
    throw new ApiError(404, 'Commuter profile not found.');
  }

  const posts = await Post.find({ author: user._id, isRemoved: false })
    .populate('author', 'fullName username avatarUrl mainRoute role')
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      mainRoute: user.mainRoute,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      postCount: posts.length,
    },
    posts,
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, avatarUrl, mainRoute, bio } = req.body;

  const updates = {};

  if (fullName !== undefined) {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      throw new ApiError(400, 'Full name must be at least 2 characters long.');
    }
    updates.fullName = trimmedName;
  }

  if (avatarUrl !== undefined) {
    const trimmedUrl = avatarUrl.trim();
    if (trimmedUrl && !/^https?:\/\/.+/i.test(trimmedUrl)) {
      throw new ApiError(400, 'Avatar URL must start with http:// or https://');
    }
    updates.avatarUrl = trimmedUrl;
  }

  if (mainRoute !== undefined) {
    if (!SUGGESTED_ROUTES.includes(mainRoute)) {
      throw new ApiError(400, 'Please select a valid commuting route.');
    }
    updates.mainRoute = mainRoute;
  }

  if (bio !== undefined) {
    updates.bio = bio.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  const postCount = await Post.countDocuments({ author: updatedUser._id, isRemoved: false });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      ...updatedUser.toJSON(),
      postCount,
    },
  });
});
