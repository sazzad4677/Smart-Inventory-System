import { Router } from 'express';
import { getDashboardMetrics, getLatestActivities } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { checkCache } from '../middlewares/cache.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);

// ─── GET /api/dashboard (Admin, Manager) ────────────────────────
router.get(
  '/dashboard',
  restrictTo(UserRole.Admin, UserRole.Manager),
  checkCache('dashboard_metrics'),
  getDashboardMetrics,
);

// ─── GET /api/activities (All Logged In Users) ───────────────────────
router.get('/activities', getLatestActivities);

export default router;
