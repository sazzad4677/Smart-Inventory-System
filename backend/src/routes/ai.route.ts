import { Router } from 'express';
import { getDashboardAIInsights } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/ai-rate-limiter.middleware';

const router: Router = Router();

router.get('/dashboard-insights', protect, getDashboardAIInsights);

export default router;
