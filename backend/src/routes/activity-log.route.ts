import { Router } from 'express';
import { getAllActivityLogs } from '../controllers/activity-log.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.Admin));

// ─── GET /api/activity-logs (Permissions: Admin) ─────────────────────────────
router.get('/', getAllActivityLogs);

export default router;
