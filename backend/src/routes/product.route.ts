import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import {
  createProduct,
  getProducts,
  updateProduct,
  getProductById,
  deleteProduct,
  bulkDeleteProducts,
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);

// ─── GET /api/products (Admin, Manager, Staff) ──────────────────
router.get('/', getProducts);

// ─── GET /api/products/:id (Admin, Manager, Staff) ──────────────
router.get('/:id', getProductById);

// ─── POST /api/products (Admin) ─────────────────────────────────
router.post('/', restrictTo(UserRole.Admin), validateRequest(createProductSchema), createProduct);

// ─── PUT /api/products/:id (Admin, Manager) ─────────────────────
router.put(
  '/:id',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

// ─── PATCH /api/products/:id ( Admin, Manager) ───────────────────
router.patch(
  '/:id',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

// ─── DELETE /api/products/bulk (Admin) ──────────────────────────
router.delete('/bulk', restrictTo(UserRole.Admin), bulkDeleteProducts);

// ─── DELETE /api/products/:id (Admin, Manager) ──────────────────
router.delete('/:id', restrictTo(UserRole.Admin, UserRole.Manager), deleteProduct);

export default router;
