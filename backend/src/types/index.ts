import { Request } from 'express';
import { UserRole, ProductStatus, OrderStatus, ActivityType } from '@prisma/client';

export { UserRole, ProductStatus, OrderStatus, ActivityType };

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | undefined;
}

export interface ICategory {
  id: string;
  name: string;
}

export interface IProduct {
  id: string;
  product_id: string;
  name: string;
  category_id: string;
  price: number;
  stock_quantity: number;
  min_threshold: number;
  status: ProductStatus;
  is_restock_required: boolean;
  is_deleted: boolean;
}

export interface IOrder {
  id: string;
  order_id: string;
  customer_name: string;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
  is_deleted: boolean;
}

export interface IOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface IActivityLog {
  id: string;
  action_text: string;
  type: ActivityType;
  resource?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
  user_id: string;
  is_undone?: boolean;
}
