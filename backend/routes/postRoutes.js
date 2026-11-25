import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleHelpful,
} from '../controllers/postController.js';
import { getCommentsByPost, addComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, createPost);

router.get('/:id', validateObjectId('id'), getPostById);
router.put('/:id', protect, validateObjectId('id'), updatePost);
router.delete('/:id', protect, validateObjectId('id'), deletePost);
router.post('/:id/helpful', protect, validateObjectId('id'), toggleHelpful);

router.get('/:id/comments', validateObjectId('id'), getCommentsByPost);
router.post('/:id/comments', protect, validateObjectId('id'), addComment);

export default router;
