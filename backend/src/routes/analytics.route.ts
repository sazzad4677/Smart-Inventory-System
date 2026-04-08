import { Router } from 'express';
import { trackClientEvents, getMetrics } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

// ─── POST /api/analytics/events (Permissions: Public) ────────────────────────
router.post('/events', trackClientEvents);

// ─── GET /api/analytics/metrics (Permissions: Admin, Manager) ────────────────
router.get('/metrics', protect, restrictTo(UserRole.Admin, UserRole.Manager), getMetrics);

export default router;
