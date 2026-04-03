import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';

const router: Router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/categories', route: categoryRouter },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
