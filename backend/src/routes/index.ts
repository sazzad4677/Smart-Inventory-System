import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import productRouter from './product.route';
import orderRouter from './order.route';
import dashboardRouter from './dashboard.route';
import restockRouter from './restock.route';
import activityLogRouter from './activity-log.route';
import analyticsRouter from './analytics.route';
import invitationRouter from './invitation.route';

const router: Router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/categories', route: categoryRouter },
  { path: '/products', route: productRouter },
  { path: '/orders', route: orderRouter },
  { path: '/restock-queue', route: restockRouter },
  { path: '/activity-logs', route: activityLogRouter },
  { path: '/analytics', route: analyticsRouter },
  { path: '/invitations', route: invitationRouter },
  { path: '/', route: dashboardRouter },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
