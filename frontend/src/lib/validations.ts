import { z } from "zod";

export const UserRole = {
  Admin: "Admin",
  Manager: "Manager",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User Validation
export const UserLoginSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const UserSignupSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum([UserRole.Admin, UserRole.Manager], {
    message: "Role must be Admin or Manager",
  }),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;
export type UserSignupInput = z.infer<typeof UserSignupSchema>;

// Category Validation
export const CategorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name must be less than 50 characters"),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// Product Validation
export const ProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name must be less than 100 characters"),
  category_id: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  stock_quantity: z.coerce.number().min(0, "Stock cannot be negative"),
  min_threshold: z.coerce.number().min(0, "Threshold cannot be negative"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
