import { Router } from 'express';
import {
  getAllActivityLogs,
  undoActivity,
  redoActivity,
} from '../controllers/activity-log.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);

// ─── GET /api/activity-logs (Permissions: Admin) ─────────────────────────────
router.get('/', getAllActivityLogs);

// ─── POST /api/activity-logs/:id/undo (Permissions: Admin, Manager) ──────────
router.post('/:id/undo', restrictTo(UserRole.Admin, UserRole.Manager), undoActivity);

// ─── POST /api/activity-logs/:id/redo (Permissions: Admin, Manager) ──────────
router.post('/:id/redo', restrictTo(UserRole.Admin, UserRole.Manager), redoActivity);

export default router;
