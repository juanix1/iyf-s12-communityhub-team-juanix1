import express from 'express';
import {
  getAdminReports,
  resolveReport,
  toggleUserSuspension,
} from '../controllers/reportController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/reports', getAdminReports);
router.patch('/reports/:id', validateObjectId('id'), resolveReport);
router.patch('/users/:id/suspend', validateObjectId('id'), toggleUserSuspension);

export default router;
