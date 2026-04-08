import { Router } from 'express';
import { signup, login, logout, refreshToken, me } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { authRateLimiter } from './../middlewares/rateLimiter.middleware';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router: Router = Router();

// ─── POST /api/auth/signup (Public, Rate Limited) ────────────────
router.post('/signup', authRateLimiter, validateRequest(signupSchema), signup);

// ─── POST /api/auth/login (Public, Rate Limited) ────────────────
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);

// ─── POST /api/auth/refresh-token (Public) ──────────────────────
router.post('/refresh-token', refreshToken);

// ─── POST /api/auth/logout (Public) ─────────────────────────────
router.post('/logout', logout);

// ─── GET /api/auth/me (Admin, Manager, Staff) ───────────────────
router.get('/me', protect, me);

export default router;
