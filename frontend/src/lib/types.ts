/**
 * Standard response structure for all Server Actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "Admin" | "Manager" | "Staff" | "User";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  product_id: string;
  name: string;
  stock_quantity: number;
  min_threshold: number;
  priority?: "High" | "Medium" | "Low";
  category?: Category;
  category_id?: string;
  price: number;
  status?: string;
  created_by?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  action_text: string;
  type: string;
  resource?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  user_id: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  timestamp: string;
  is_undone?: boolean;
  createdAt: string;
  updatedAt: string;
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
  categoryDistribution?: {
    name: string;
    value: number;
  }[];
  orderTrends?: {
    date: string;
    count: number;
    revenue: number;
  }[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email?: string;
  total_price: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Completed";
  orderItems?: OrderItem[];
  createdAt: string;
}

export interface OrderDetailResponse {
  order: Order;
  items: OrderItem[];
}
