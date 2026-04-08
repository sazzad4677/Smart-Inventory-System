import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createCategorySchema } from '../validators/category.validator';
import { createCategory, getCategories } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = Router();

router.use(protect);

// ─── GET /api/categories (Permissions: Admin, Manager, Staff) ────────────────
router.get('/', getCategories);

// ─── POST /api/categories (Permissions: Admin, Manager, Staff) ───────────────
router.post('/', validateRequest(createCategorySchema), createCategory);

export default router;
