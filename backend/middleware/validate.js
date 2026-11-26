import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export const validateObjectId = (paramName = 'id') => (req, _res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, `Invalid identifier format for parameter '${paramName}'`));
  }
  next();
};
