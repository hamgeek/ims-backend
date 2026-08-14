import type { auth } from '../lib/auth';

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export type AuthVariables = {
  user: AuthSession['user'];
  session: AuthSession['session'];
};
