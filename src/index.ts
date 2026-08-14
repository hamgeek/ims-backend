import { Hono } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

import { env } from './config/env';
import { AppError } from './exceptions/app-error';
import { handlePrismaError } from './exceptions/prisma-error';
import routes from './modules';

const app = new Hono();

app.route('/api', routes);

app.onError((error, c) => {
  if (error instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      error.statusCode as ContentfulStatusCode,
    );
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data yang diberikan tidak valid',
          details: error.issues,
        },
      },
      422,
    );
  }

  const prismaError = handlePrismaError(error);

  if (prismaError) {
    return c.json(
      {
        success: false,
        error: prismaError,
      },
      prismaError.statusCode,
    );
  }

  // Internal
  console.error(error);

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Terjadi kesalahan pada server',
      },
    },
    500,
  );
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
