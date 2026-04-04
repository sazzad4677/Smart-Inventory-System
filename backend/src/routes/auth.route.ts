import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
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

export default router;
