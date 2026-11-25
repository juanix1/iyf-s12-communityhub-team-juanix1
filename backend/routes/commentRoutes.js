import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.delete('/:id', protect, validateObjectId('id'), deleteComment);

export default router;
