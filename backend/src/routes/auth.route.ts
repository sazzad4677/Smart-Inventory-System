import { Router } from 'express';
import { signup, login, logout, refreshToken, me } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { loginRateLimiter } from './../middlewares/rateLimiter.middleware';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router: Router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', loginRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
