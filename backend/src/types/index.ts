// ─── Enums ────────────────────────────────────────────────────────────────────

import { Types } from 'mongoose';

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
}

export enum ProductStatus {
  Active = 'Active',
  OutOfStock = 'Out of Stock',
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface ICategory {
  name: string;
}

export interface IProduct {
  product_id: string;
  name: string;
  category_id: import('mongoose').Types.ObjectId;
  price: number;
  stock_quantity: number;
  min_threshold: number;
  status: ProductStatus;
  is_restock_required: boolean;
  is_deleted: boolean;
}

export interface IOrder {
  order_id: string;
  customer_name: string;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
  is_deleted: boolean;
}

export interface IOrderItem {
  order_id: import('mongoose').Types.ObjectId;
  product_id: import('mongoose').Types.ObjectId;
  quantity: number;
  unit_price: number;
}

export interface IActivityLog {
  action_text: string;
  timestamp: Date;
  user_id: import('mongoose').Types.ObjectId;
}
