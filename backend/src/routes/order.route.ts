import express from 'express';
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

const router = express.Router();

// ─── Protected Routes (Logged In Users) ───────────────────────────────────
router.post('/', protect, validateRequest(createOrderSchema), createOrder);

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// ─── Restricted Routes (Admin/Manager Only) ──────────────────────────────
router.put(
  '/:id/status',
  protect,
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

// ─── Restricted Routes (Admin Only) ──────────────────────────────
router.delete('/:id', protect, restrictTo(UserRole.Admin), deleteOrder);

export default router;
