import dotenv from 'dotenv';

// Load environment variables from .env.local (if exists) or .env
dotenv.config({ path: ['.env.local', '.env'] });

const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'OPENROUTER_API_KEY'] as const;

// Ensure all critical secrets are defined before bootstrapping the app
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && process.env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  },
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true',
  },
  invitation: {
    expiresIn: process.env.INVITE_TOKEN_EXPIRES_IN || '1h',
  },
  ai: {
    openrouterKey: process.env.OPENROUTER_API_KEY as string,
    model: (process.env.AI_MODEL || 'openai/gpt-oss-120b:free') as string,
    baseURL: (process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1') as string,
  },
} as const;
