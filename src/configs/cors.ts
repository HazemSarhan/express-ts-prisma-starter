import cors from 'cors';
import { env } from './env';

const allowedOrigins = [
  env.FRONTEND_URL,
  env.BACKEND_URL,
  env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  env.NODE_ENV === 'development' ? 'http://localhost:3001' : '',
].filter(Boolean);

export const corsConfig = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'x-csrf-token',
  ],
});
