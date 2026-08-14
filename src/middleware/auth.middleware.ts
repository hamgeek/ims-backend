import { Context, Next } from 'hono';

import { AppError } from '../exceptions/app-error';
import { auth } from '../lib/auth';
import type { AuthVariables } from '../types/hono';

export const authMiddleware = async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new AppError(401, 'UNAUTHORIZED', 'Autentikasi Diperlukan.');
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
};
