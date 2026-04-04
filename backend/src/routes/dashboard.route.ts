import { Router } from 'express';
import {
  getRestockQueue,
  getDashboardStats,
  getLatestActivities,
} from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

// Apply protection to all dashboard routes
router.use(protect);
router.use(restrictTo(UserRole.Admin, UserRole.Manager));

// ─── GET /api/restock-queue ───────────────────────────────────────────────
router.get('/restock-queue', getRestockQueue);

// ─── GET /api/dashboard ───────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ─── GET /api/activities ──────────────────────────────────────────────────
router.get('/activities', getLatestActivities);

export default router;
