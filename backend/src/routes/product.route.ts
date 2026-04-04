import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { createProduct, getProducts, updateProduct } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);

router.get('/', getProducts);

router.post('/', restrictTo(UserRole.Admin), validateRequest(createProductSchema), createProduct);

router.put(
  '/:id',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

router.patch(
  '/:id',
  protect,
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

export default router;
