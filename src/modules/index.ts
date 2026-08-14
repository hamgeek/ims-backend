import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { env } from '../config/env';
import { auth } from '../lib/auth';
import categories from './categories/categories.route';
import products from './products/products.route';
import stockMovements from './stock-movements/stock-movements.route';
import users from './users/users.route';

const routes = new Hono();

routes.use(
  '/*',
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

routes.on(['GET', 'POST'], '/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

routes.route('/users', users);
routes.route('/categories', categories);
routes.route('/products', products);
routes.route('/stock-movements', stockMovements);

export default routes;
