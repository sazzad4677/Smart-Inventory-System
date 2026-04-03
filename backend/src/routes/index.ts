import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import productRouter from './product.route';

const router: Router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/categories', route: categoryRouter },
  { path: '/products', route: productRouter },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
