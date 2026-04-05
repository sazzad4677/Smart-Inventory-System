/**
 * Standard response structure for all Server Actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export interface Product {
  _id: string;
  product_id: string;
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
  createdAt?: string;
  created_at?: string;
}

export interface Activity {
  _id: string;
  action_text: string;
  user_id: {
    _id: string;
    email: string;
    role: string;
  } | null;
  timestamp: string;
}

export interface DashboardData {
  totalOrdersToday: number;
  pendingVsCompleted: {
    Pending: number;
    Completed: number;
  };
  lowStockCount: number;
  revenueToday: number;
  totalProducts: number;
  productSummary: {
    name: string;
    stock_quantity: number;
    status: string;
  }[];
}

export interface OrderItem {
  _id: string;
  product_id: Product | string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  _id: string;
  order_id: string;
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

export interface OrderDetailResponse {
  order: Order;
  items: (OrderItem & {
    product_id: { _id: string; product_id: string; name: string };
  })[];
}
