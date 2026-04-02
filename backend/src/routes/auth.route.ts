import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router: Router = Router();

router.get('/', (req, res) => {
  res.send('Auth routes');
});
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);

export default router;
