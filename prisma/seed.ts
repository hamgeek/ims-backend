import { env } from '../src/config/env';
import { auth } from '../src/lib/auth';
import prisma from '../src/lib/db';

async function main() {
  await auth.api.signUpEmail({
    body: {
      name: 'admin',
      email: 'admin@gmail.com',
      password: env.DEFAULT_ADMIN_PASSWORD,
      rememberMe: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
