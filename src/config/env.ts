import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  DEFAULT_ADMIN_PASSWORD: z.string().min(1),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
