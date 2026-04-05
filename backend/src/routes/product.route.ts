import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import {
  createProduct,
  getProducts,
  updateProduct,
  getProductById,
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

// Apply auth protection to all product routes
router.use(protect);

// ─── GET /api/product (Permissions: Admin, Manager) ──────────────────────────
router.get('/', getProducts);

// ─── GET /api/product/:id (Permissions: Admin, Manager) ──────────────────────
router.get('/:id', getProductById);

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
router.post('/', restrictTo(UserRole.Admin), validateRequest(createProductSchema), createProduct);

// ─── PUT /api/product/:id (Permissions: Admin, Manager) ──────────────────────
router.put(
  '/:id',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

// ─── PATCH /api/product/:id (Permissions: Admin, Manager) ────────────────────
router.patch(
  '/:id',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateProductSchema),
  updateProduct,
);

export default router;
