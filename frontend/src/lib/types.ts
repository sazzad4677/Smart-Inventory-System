/**
 * Standard response structure for all Server Actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export interface Product {
  _id: string;
  name: string;
  stock_quantity: number;
  min_threshold: number;
  priority?: "High" | "Medium" | "Low";
  category_id?: string | { _id: string; name: string };
  price: number;
  status?: string;
}

export interface Category {
  _id: string;
  name: string;
  productCount?: number;
}

export interface OrderItem {
  _id: string;
  product_id: Product | string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  _id: string;
  customer_name: string;
  customer_email: string;
  total_price: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Completed";
  items?: OrderItem[];
  created_at: string;
  createdAt?: string;
}
