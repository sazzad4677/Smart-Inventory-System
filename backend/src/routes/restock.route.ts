import { Router } from 'express';
import { getRestockQueue } from '../controllers/restock.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

// Apply protection to all restock queue routes
router.use(protect);
router.use(restrictTo(UserRole.Admin, UserRole.Manager));

// ─── GET /api/restock-queue (Permissions: Admin, Manager) ──────────
router.get('/', getRestockQueue);

export default router;
