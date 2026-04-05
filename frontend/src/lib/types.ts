/**
 * Standard response structure for all Server Actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

/**
 * Common Product Interface
 */
export interface Product {
  _id: string;
  name: string;
  stock_quantity: number;
  min_threshold: number;
  priority: "High" | "Medium" | "Low";
  category_id?: string;
  price?: number;
}
