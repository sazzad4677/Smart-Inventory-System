import { Router } from 'express';
import { inviteUser, getInvitations, revokeInvitation } from '../controllers/invitation.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { inviteUserSchema } from '../validators/invitation.validator';
import { UserRole } from '../types';

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.Admin));

router.post('/', validateRequest(inviteUserSchema), inviteUser);
router.get('/', getInvitations);
router.delete('/:id', revokeInvitation);

export default router;
