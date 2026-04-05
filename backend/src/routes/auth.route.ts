import { Router } from 'express';
import { signup, login, logout } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router: Router = Router();

// ─── GET /api/auth (Permissions: Public) ─────────────────────────────────────
router.get('/', (req, res) => {
  res.send('Auth routes');
});

// ─── POST /api/auth/signup (Permissions: Public) ────────────────────────────────
router.post('/signup', validateRequest(signupSchema), signup);

// ─── POST /api/auth/login (Permissions: Public) ─────────────────────────────────
router.post('/login', validateRequest(loginSchema), login);

// ─── POST /api/auth/logout (Permissions: Private) ────────────────────────────────
router.post('/logout', protect, logout);

export default router;
