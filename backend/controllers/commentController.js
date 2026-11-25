import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCommentsByPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
  if (!post) {
    throw new ApiError(404, 'Route update not found.');
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'fullName username avatarUrl mainRoute role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    comments,
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Comment text cannot be empty.');
  }

  const post = await Post.findOne({ _id: req.params.id, isRemoved: false });
  if (!post) {
    throw new ApiError(404, 'Route update not found.');
  }

  let validParentId = null;
  if (parentComment) {
    const parent = await Comment.findOne({ _id: parentComment, post: post._id });
    if (!parent) {
      throw new ApiError(404, 'Parent comment not found on this post.');
    }
    if (parent.parentComment) {
      throw new ApiError(400, 'Replies to replies are not supported.');
    }
    validParentId = parent._id;
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    parentComment: validParentId,
    content: content.trim(),
  });

  const totalComments = await Comment.countDocuments({ post: post._id });
  post.commentCount = totalComments;
  await post.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    'author',
    'fullName username avatarUrl mainRoute role'
  );

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    comment: populatedComment,
    commentCount: totalComments,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  const postId = comment.post;

  // Delete child replies as well so no orphaned replies remain
  await Comment.deleteMany({
    $or: [{ _id: comment._id }, { parentComment: comment._id }],
  });

  const remainingCount = await Comment.countDocuments({ post: postId });
  await Post.findByIdAndUpdate(postId, { commentCount: remainingCount });

  res.status(200).json({
    success: true,
    message: 'Comment deleted.',
    commentCount: remainingCount,
  });
});
