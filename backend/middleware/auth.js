import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.njia_token) {
    token = req.cookies.njia_token;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in to continue.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired session token. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The account associated with this token no longer exists.');
  }

  if (user.isSuspended) {
    throw new ApiError(
      403,
      `Your account has been suspended${user.suspensionReason ? `: ${user.suspensionReason}` : '.'}`
    );
  }

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    } catch {
      // Ignore invalid optional tokens
    }
  }

  next();
});

export const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Access denied. Administrator privileges required.'));
  }
  next();
};
