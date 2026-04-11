import { Router } from 'express';
import { getUsers, revokeSessions } from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.Admin));

router.get('/', getUsers);
router.delete('/:userId/sessions', revokeSessions);

export default router;
