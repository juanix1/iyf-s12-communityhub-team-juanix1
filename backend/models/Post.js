import mongoose from 'mongoose';
import { SUGGESTED_ROUTES } from './User.js';

export const TRAFFIC_STATUSES = ['Smooth', 'Slow', 'Gridlock'];

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    route: {
      type: String,
      required: [true, 'Route is required'],
      enum: {
        values: SUGGESTED_ROUTES,
        message: '{VALUE} is not a supported route option',
      },
      index: true,
    },
    customRouteName: {
      type: String,
      trim: true,
      maxlength: [80, 'Custom route name cannot exceed 80 characters'],
      default: '',
    },
    fareKsh: {
      type: Number,
      required: [true, 'Current fare in KSh is required'],
      min: [0, 'Fare cannot be negative'],
      max: [10000, 'Fare seems unusually high; please verify'],
    },
    trafficStatus: {
      type: String,
      required: [true, 'Traffic status is required'],
      enum: {
        values: TRAFFIC_STATUSES,
        message: 'Traffic status must be Smooth, Slow, or Gridlock',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Update description is required'],
      trim: true,
      minlength: [10, 'Please provide at least 10 characters of useful detail'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isRemoved: {
      type: Boolean,
      default: false,
      index: true,
    },
    removedReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ route: 1, trafficStatus: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
