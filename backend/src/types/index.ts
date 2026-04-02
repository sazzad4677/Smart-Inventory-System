// ─── Enums ────────────────────────────────────────────────────────────────────

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
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface ICategory {
  name: string;
}

export interface IProduct {
  name: string;
  category_id: import('mongoose').Types.ObjectId;
  price: number;
  stock_quantity: number;
  min_threshold: number;
  status: ProductStatus;
}

export interface IOrder {
  customer_name: string;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
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
