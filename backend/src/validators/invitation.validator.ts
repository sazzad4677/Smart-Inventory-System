import { z } from 'zod';
import { UserRole } from '../types';

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address').min(1, 'Email is required'),
    role: z.enum(UserRole),
  }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>['body'];
