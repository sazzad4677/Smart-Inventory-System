import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import productRouter from './product.route';
import orderRouter from './order.route';
import dashboardRouter from './dashboard.route';
import restockRouter from './restock.route';
import activityLogRouter from './activity-log.route';
import analyticsRouter from './analytics.route';
import aiRouter from './ai.route';
import invitationRouter from './invitation.route';
import userRouter from './user.route';

const router: Router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/categories', route: categoryRouter },
  { path: '/products', route: productRouter },
  { path: '/orders', route: orderRouter },
  { path: '/restock-queue', route: restockRouter },
  { path: '/activity-logs', route: activityLogRouter },
  { path: '/analytics', route: analyticsRouter },
  { path: '/', route: dashboardRouter },
  { path: '/ai', route: aiRouter },
  { path: '/invitations', route: invitationRouter },
  { path: '/users', route: userRouter },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
