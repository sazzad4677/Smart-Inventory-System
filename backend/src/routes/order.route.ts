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

// ─── Protected Routes (Logged In Users) ───────────────────────────────────
router.post('/', validateRequest(createOrderSchema), createOrder);

router.get('/', getOrders);
router.get('/:id', getOrderById);

// ─── Restricted Routes (Admin/Manager Only) ──────────────────────────────
router.put(
  '/:id/status',
  restrictTo(UserRole.Admin, UserRole.Manager),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

// ─── Restricted Routes (Admin Only) ──────────────────────────────
router.delete('/:id', restrictTo(UserRole.Admin), deleteOrder);

export default router;
