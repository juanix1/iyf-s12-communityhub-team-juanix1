import express from 'express';
import { getUserProfile, updateMyProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.put('/me', protect, updateMyProfile);
router.get('/:id', validateObjectId('id'), getUserProfile);

export default router;
