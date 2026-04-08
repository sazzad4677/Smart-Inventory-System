import { Router } from 'express';
import { getRestockQueue } from '../controllers/restock.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.Admin, UserRole.Manager));

// ─── GET /api/restock-queue (Admin, Manager) ────────────────────
router.get('/', getRestockQueue);

export default router;
