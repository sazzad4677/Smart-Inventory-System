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

router.use(protect);

// ─── POST /api/orders (Admin, Manager, Staff) ───────────────────
router.post('/', validateRequest(createOrderSchema), createOrder);

// ─── GET /api/orders (Admin, Manager, Staff) ────────────────────
router.get('/', getOrders);

// ─── GET /api/orders/:id (Admin, Manager, Staff) ────────────────
router.get('/:id', getOrderById);

// ─── PUT /api/orders/:id/status (Admin, Manager, Staff) ────────────────
router.put(
  '/:id/status',
  restrictTo(UserRole.Admin, UserRole.Manager, UserRole.Staff),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

// ─── DELETE /api/orders/:id (Permissions: Admin) ─────────────────────────────
router.delete('/:id', restrictTo(UserRole.Admin), deleteOrder);

export default router;
