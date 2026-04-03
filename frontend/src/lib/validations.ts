import { z } from "zod";

export const UserRole = {
  Admin: "Admin",
  Manager: "Manager",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

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
