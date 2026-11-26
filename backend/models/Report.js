import mongoose from 'mongoose';

export const REPORT_REASONS = [
  'False or misleading fare/traffic info',
  'Spam or advertising',
  'Harassment or abusive language',
  'Unsafe or dangerous advice',
  'Other',
];

const reportSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: REPORT_REASONS,
    },
    details: {
      type: String,
      trim: true,
      maxlength: [400, 'Details cannot exceed 400 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed_removed', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [300, 'Admin note cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ post: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
