import dotenv from 'dotenv';
dotenv.config();
import * as z from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRATION: z.string().min(1),
  BACKEND_URL: z.url(),
  FRONTEND_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.url(),
  GITHUB_CALLBACK_URL: z.url(),
  RESEND_API_KEY: z.string(),
  EMAIL: z.email(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables', z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
