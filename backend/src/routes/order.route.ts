import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/order.controller';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = express.Router();

// ─── Protected Routes (Logged In Users) ───────────────────────────────────
router.post('/', protect, validateRequest(createOrderSchema), createOrder);

router.get('/', protect, getOrders);

// ─── Restricted Routes (Admin/Manager Only) ──────────────────────────────
router.put(
  '/:id/status',
  protect,
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
