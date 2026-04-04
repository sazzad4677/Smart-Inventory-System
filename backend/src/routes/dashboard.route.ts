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

// ─── GET /api/dashboard/restock-queue (Permissions: Admin, Manager) ──────────
router.get('/restock-queue', getRestockQueue);

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
router.get('/dashboard', getDashboardStats);

// ─── GET /api/dashboard/activities (Permissions: Admin, Manager) ─────────────
router.get('/activities', getLatestActivities);

export default router;
