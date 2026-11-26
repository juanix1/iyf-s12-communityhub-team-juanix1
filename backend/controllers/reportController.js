import Report, { REPORT_REASONS } from '../models/Report.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createReport = asyncHandler(async (req, res) => {
  const { postId, reason, details } = req.body;

  if (!postId) {
    throw new ApiError(400, 'Post ID is required to submit a report.');
  }

  if (!reason || !REPORT_REASONS.includes(reason)) {
    throw new ApiError(400, 'Please select a valid report reason.');
  }

  const post = await Post.findOne({ _id: postId, isRemoved: false });
  if (!post) {
    throw new ApiError(404, 'The post you are trying to report does not exist or was already removed.');
  }

  if (post.author.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot report your own post. You can edit or delete it instead.');
  }

  const existingReport = await Report.findOne({
    post: post._id,
    reportedBy: req.user._id,
  });

  if (existingReport) {
    throw new ApiError(409, 'You have already reported this post. Our moderators will review it.');
  }

  const report = await Report.create({
    post: post._id,
    reportedBy: req.user._id,
    reason,
    details: details ? details.trim() : '',
  });

  res.status(201).json({
    success: true,
    message: 'Thank you. Your report has been submitted for community safety review.',
    report,
  });
});

export const getAdminReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};

  if (status && ['pending', 'reviewed_removed', 'dismissed'].includes(status)) {
    query.status = status;
  }

  const reports = await Report.find(query)
    .populate({
      path: 'post',
      populate: {
        path: 'author',
        select: 'fullName username email mainRoute isSuspended suspensionReason',
      },
    })
    .populate('reportedBy', 'fullName username')
    .populate('reviewedBy', 'fullName username')
    .sort({ createdAt: -1 });

  const [pendingCount, totalUsers, activePosts] = await Promise.all([
    Report.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Post.countDocuments({ isRemoved: false }),
  ]);

  res.status(200).json({
    success: true,
    reports,
    stats: {
      pendingReports: pendingCount,
      totalUsers,
      activePosts,
    },
  });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const { action, adminNote } = req.body;
  const report = await Report.findById(req.params.id).populate('post');

  if (!report) {
    throw new ApiError(404, 'Report record not found.');
  }

  if (!['remove_post', 'dismiss'].includes(action)) {
    throw new ApiError(400, 'Invalid moderation action. Use "remove_post" or "dismiss".');
  }

  if (action === 'remove_post' && report.post) {
    await Post.findByIdAndUpdate(report.post._id, {
      isRemoved: true,
      removedReason: adminNote || report.reason,
    });
    report.status = 'reviewed_removed';
  } else {
    report.status = 'dismissed';
  }

  report.reviewedBy = req.user._id;
  report.adminNote = adminNote ? adminNote.trim() : '';
  await report.save();

  res.status(200).json({
    success: true,
    message:
      action === 'remove_post'
        ? 'Post removed from public feed and report closed.'
        : 'Report dismissed.',
    report,
  });
});

export const toggleUserSuspension = asyncHandler(async (req, res) => {
  const { isSuspended, suspensionReason } = req.body;
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, 'User not found.');
  }

  if (targetUser.role === 'admin') {
    throw new ApiError(403, 'Administrator accounts cannot be suspended.');
  }

  targetUser.isSuspended = Boolean(isSuspended);
  targetUser.suspensionReason = targetUser.isSuspended
    ? (suspensionReason || 'Violation of Njia CommunityHub commuter safety guidelines').trim()
    : '';

  await targetUser.save();

  res.status(200).json({
    success: true,
    message: targetUser.isSuspended
      ? `Account @${targetUser.username} has been suspended.`
      : `Account @${targetUser.username} has been reinstated.`,
    user: targetUser.toJSON(),
  });
});
