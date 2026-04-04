import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createCategorySchema } from '../validators/category.validator';
import { createCategory, getCategories } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = Router();

router.use(protect);

router.get('/', getCategories);

router.post('/', validateRequest(createCategorySchema), createCategory);

export default router;
