import { z } from 'zod';
import { UserRole } from '../types';

export const signupSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Please provide a valid email address' }).min(1, 'Email is required'),
    password: z
      .string({ message: 'Please provide a password' })
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    role: z.enum(UserRole).optional(),
    token: z.string().min(1, 'Invitation token is required'),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Please provide a valid email address' }).min(1, 'Email is required'),
    password: z.string({ message: 'Please provide a password' }).min(1, 'Password is required'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
