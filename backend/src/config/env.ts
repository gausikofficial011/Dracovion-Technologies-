import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const trimmedString = (schema: z.ZodString) =>
  z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), schema);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  CLIENT_URL: trimmedString(z.string()).default('http://localhost:5173'),
  CORS_ORIGINS: trimmedString(z.string()).optional().default(''),
  MONGODB_URI: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.string().optional()),
  SESSION_SECRET: trimmedString(z.string()).default('dracovion_dev_session_secret_ultra_secure_change_in_production_98127391283'),
  SESSION_NAME: trimmedString(z.string()).default('dracovion.sid'),
  SESSION_MAX_AGE_MS: z.string().transform(Number).default('2592000000'), // 30 days
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  // Platform founder / initial super-admin bootstrap
  INITIAL_OWNER_EMAIL: trimmedString(z.string()).pipe(z.string().email()).default('president@dracovion.com'),
  INITIAL_OWNER_PASSWORD: trimmedString(z.string()).default('DracovionPresident2026!'),
  INITIAL_OWNER_NAME: trimmedString(z.string()).default('Platform President'),
  // Super Admin (Gausik Srinivasan) — highest privilege, manages workspace accounts
  SUPER_ADMIN_EMAIL: trimmedString(z.string()).pipe(z.string().email()).default('gausik@dracovion.com'),
  SUPER_ADMIN_PASSWORD: trimmedString(z.string()).default('DracovionSuperAdmin2026!'),
  SUPER_ADMIN_NAME: trimmedString(z.string()).default('Gausik Srinivasan'),
  // Executive & Lead Engineer bootstrap overrides
  CEO_EMAIL: trimmedString(z.string()).pipe(z.string().email()).default('ceo@dracovion.com'),
  CEO_PASSWORD: trimmedString(z.string()).default('DracovionCEO2026!'),
  INITIAL_EMPLOYEE_EMAIL: trimmedString(z.string()).pipe(z.string().email()).default('employee@dracovion.com'),
  INITIAL_EMPLOYEE_PASSWORD: trimmedString(z.string()).default('DracovionEmployee2026!'),
  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: trimmedString(z.string()).default('./uploads'),
  STORAGE_MAX_FILE_SIZE_BYTES: z.string().transform(Number).default('15728640'), // 15MB
  // Business metadata
  BUSINESS_NAME: trimmedString(z.string()).default('Dracovion Technologies'),
  BUSINESS_TAGLINE: trimmedString(z.string()).default('Technology Without Limits.'),
  BUSINESS_EMAIL: trimmedString(z.string()).default('dracoviontechnology@gmail.com'),
  BUSINESS_PHONE: trimmedString(z.string()).default('+91 9489832249'),
  BUSINESS_ADDRESS_STATE: trimmedString(z.string()).default('Tamil Nadu'),
  BUSINESS_ADDRESS_COUNTRY: trimmedString(z.string()).default('India'),
  BUSINESS_GST_REGISTERED: z.string().transform(val => val === 'true').default('false'),
  BUSINESS_GSTIN: trimmedString(z.string()).optional().default(''),
  BUSINESS_PAN: trimmedString(z.string()).optional().default(''),
  DEFAULT_CURRENCY: trimmedString(z.string()).default('INR'),
  // Google OAuth2 (for client portal)
  GOOGLE_CLIENT_ID: trimmedString(z.string()).default(''),
  GOOGLE_CLIENT_SECRET: trimmedString(z.string()).default(''),
  GOOGLE_CALLBACK_URL: trimmedString(z.string()).default('http://localhost:5000/api/v1/auth/client/google/callback'),
  // GitHub OAuth (for client portal)
  GITHUB_CLIENT_ID: trimmedString(z.string()).default(''),
  GITHUB_CLIENT_SECRET: trimmedString(z.string()).default(''),
  GITHUB_CALLBACK_URL: trimmedString(z.string()).default('http://localhost:5000/api/v1/auth/client/github/callback'),
  // Gmail SMTP & OAuth2 (Nodemailer, via App Password or OAuth2)
  GMAIL_USER: trimmedString(z.string()).default(''),
  GMAIL_APP_PASSWORD: trimmedString(z.string()).default(''),
  GMAIL_REFRESH_TOKEN: trimmedString(z.string()).default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment variable configuration error:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
