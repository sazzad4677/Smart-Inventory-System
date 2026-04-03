import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import productRouter from './product.route';
import orderRouter from './order.route';

const router: Router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/categories', route: categoryRouter },
  { path: '/products', route: productRouter },
  { path: '/orders', route: orderRouter },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
