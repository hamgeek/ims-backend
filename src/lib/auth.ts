import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { env } from '../config/env';
import prisma from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  trustedOrigins: [env.FRONTEND_URL],
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: 'None',
      httpOnly: true,
      secure: true,
      partitioned: true,
    },
  },
});
