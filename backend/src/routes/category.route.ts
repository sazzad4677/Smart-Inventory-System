import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createCategorySchema } from '../validators/category.validator';
import { createCategory, getCategories } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = Router();

// Protect all routes
router.use(protect);

// ─── GET /api/category (Permissions: Admin, Manager) ─────────────────────────
router.get('/', getCategories);

// ─── POST /api/category (Permissions: Admin, Manager) ────────────────────────
router.post('/', validateRequest(createCategorySchema), createCategory);

export default router;
