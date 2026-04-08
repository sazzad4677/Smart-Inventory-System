import { Router } from 'express';
import { getDashboardMetrics, getLatestActivities } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { checkCache } from '../middlewares/cache.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.Admin, UserRole.Manager));

// ─── GET /api/dashboard (Admin, Manager) ────────────────────────
router.get('/dashboard', checkCache('dashboard_metrics'), getDashboardMetrics);

// ─── GET /api/activities (Admin, Manager) ───────────────────────
router.get('/activities', getLatestActivities);

export default router;
