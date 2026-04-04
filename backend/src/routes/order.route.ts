import express, { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = express.Router();

// Apply auth protection to all order routes
router.use(protect);

// ─── POST /api/order (Permissions: Private) ──────────────────────────────────
router.post('/', validateRequest(createOrderSchema), createOrder);

// ─── GET /api/order (Permissions: Private) ───────────────────────────────────
router.get('/', getOrders);

// ─── GET /api/order/:id (Permissions: Private) ───────────────────────────────
router.get('/:id', getOrderById);

// ─── PUT /api/order/:id/status (Permissions: Admin, Manager) ─────────────────
router.put(
  '/:id/status',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

// ─── DELETE /api/order/:id (Permissions: Admin Only) ──────────────────────────
router.delete('/:id', restrictTo(UserRole.Admin), deleteOrder);

export default router;
