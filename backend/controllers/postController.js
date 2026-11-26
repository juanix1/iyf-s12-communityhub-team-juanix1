
import Post, { TRAFFIC_STATUSES } from '../models/Post.js';
import { SUGGESTED_ROUTES } from '../models/User.js';
import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getPosts = asyncHandler(async (req, res) => {
  const {
    route,
    trafficStatus,
    author,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { isRemoved: false };

  if (route && route !== 'All') {
    query.route = route;
  }

  if (trafficStatus && trafficStatus !== 'All') {
    query.trafficStatus = trafficStatus;
  }

  if (author) {
    query.author = author;
  }

  if (search && search.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeRegex = new RegExp(escapedSearch, 'i');

    query.$or = [
      { description: safeRegex },
      { route: safeRegex },
      { customRouteName: safeRegex },
    ];
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * pageSize;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'fullName username avatarUrl mainRoute role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      hasMore: skip + posts.length < total,
    },
  });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    isRemoved: false,
  }).populate(
    'author',
    'fullName username avatarUrl mainRoute role createdAt'
  );

  if (!post) {
    throw new ApiError(404, 'Route update not found or has been removed.');
  }

  res.status(200).json({
    success: true,
    post,
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const {
    route,
    customRouteName,
    fareKsh,
    trafficStatus,
    description,
  } = req.body;

  if (!route || !SUGGESTED_ROUTES.includes(route)) {
    throw new ApiError(400, 'Please select a valid route.');
  }

  if (route === 'Other' && (!customRouteName || !customRouteName.trim())) {
    throw new ApiError(400, 'Please specify the route name when selecting "Other".');
  }

  const numericFare = Number(fareKsh);

  if (
    fareKsh === undefined ||
    fareKsh === '' ||
    Number.isNaN(numericFare) ||
    numericFare < 0
  ) {
    throw new ApiError(400, 'Please enter a valid fare amount in Kenyan Shillings (KSh).');
  }

  if (!trafficStatus || !TRAFFIC_STATUSES.includes(trafficStatus)) {
    throw new ApiError(400, 'Traffic status must be Smooth, Slow, or Gridlock.');
  }

  if (!description || description.trim().length < 10) {
    throw new ApiError(400, 'Please enter at least 10 characters describing current road/fare conditions.');
  }

  const post = await Post.create({
    author: req.user._id,
    route,
    customRouteName: route === 'Other' ? customRouteName.trim() : '',
    fareKsh: Math.round(numericFare),
    trafficStatus,
    description: description.trim(),
  });

  const populatedPost = await Post.findById(post._id).populate(
    'author',
    'fullName username avatarUrl mainRoute role'
  );

  res.status(201).json({
    success: true,
    message: 'Route update shared with the community!',
    post: populatedPost,
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, 'Route update not found.');
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own route updates.');
  }

  const {
    route,
    customRouteName,
    fareKsh,
    trafficStatus,
    description,
  } = req.body;

  if (route !== undefined) {
    if (!SUGGESTED_ROUTES.includes(route)) {
      throw new ApiError(400, 'Please select a valid route.');
    }

    if (route === 'Other' && (!customRouteName || !customRouteName.trim())) {
      throw new ApiError(400, 'Please specify the route name.');
    }

    post.route = route;
    post.customRouteName = route === 'Other'
      ? customRouteName.trim()
      : '';
  }

  if (fareKsh !== undefined) {
    const numericFare = Number(fareKsh);

    if (Number.isNaN(numericFare) || numericFare < 0) {
      throw new ApiError(400, 'Please enter a valid fare amount in KSh.');
    }

    post.fareKsh = Math.round(numericFare);
  }

  if (trafficStatus !== undefined) {
    if (!TRAFFIC_STATUSES.includes(trafficStatus)) {
      throw new ApiError(400, 'Traffic status must be Smooth, Slow, or Gridlock.');
    }

    post.trafficStatus = trafficStatus;
  }

  if (description !== undefined) {
    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters long.');
    }

    post.description = description.trim();
  }

  await post.save();

  const updatedPost = await Post.findById(post._id).populate(
    'author',
    'fullName username avatarUrl mainRoute role'
  );

  res.status(200).json({
    success: true,
    message: 'Route update edited successfully.',
    post: updatedPost,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, 'Route update not found.');
  }

  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this update.');
  }

  await Comment.deleteMany({ post: post._id });
  await Post.findByIdAndDelete(post._id);

  res.status(200).json({
    success: true,
    message: 'Route update deleted successfully.',
  });
});

export const toggleHelpful = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, 'Route update not found.');
  }

  const userIdStr = req.user._id.toString();

  const existingIndex = post.helpfulVotes.findIndex(
    (id) => id.toString() === userIdStr
  );

  let markedHelpful;

  if (existingIndex >= 0) {
    post.helpfulVotes.splice(existingIndex, 1);
    markedHelpful = false;
  } else {
    post.helpfulVotes.push(req.user._id);
    markedHelpful = true;
  }

  await post.save();

  res.status(200).json({
    success: true,
    markedHelpful,
    helpfulCount: post.helpfulVotes.length,
    helpfulVotes: post.helpfulVotes,
  });
});
