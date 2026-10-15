import { z } from 'zod';

// R8-1: Shared empty-string → undefined preprocessor for ALL optional fields
const emptyToUndefined = z.preprocess((val) => {
  if (val === '' || val === undefined) return undefined;
  return val;
}, z.unknown()).optional();

const OptionalString = z.string().optional().transform((val) => (val === '' ? undefined : val));
const OptionalUrl = z.string().url().optional().transform((val) => (val === '' ? undefined : val));
const OptionalEmail = z.string().email().optional().transform((val) => (val === '' ? undefined : val));

const BooleanFromEnv = emptyToUndefined.pipe(
  z.preprocess((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    return val;
  }, z.boolean())
);

// Positive variants - apply .positive() before piping
const PositiveNumberFromEnv = emptyToUndefined.pipe(z.coerce.number().positive());
const PositiveIntFromEnv = emptyToUndefined.pipe(z.coerce.number().int().positive());

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('genericquick-ncr'),
  APP_VERSION: z.string().default('0.1.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  LOG_PRETTY: BooleanFromEnv.default(true),

  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: PositiveIntFromEnv.default(20),
  DATABASE_SSL: BooleanFromEnv.default(false),
  DATABASE_MIGRATION_TABLE: z.string().default('_prisma_migrations'),

  REDIS_URL: z.string().url(),
  REDIS_TLS: BooleanFromEnv.default(false),
  REDIS_MAX_RETRIES: PositiveIntFromEnv.default(3),
  REDIS_RETRY_DELAY_MS: PositiveIntFromEnv.default(100),

  MEILISEARCH_URL: z.string().url(),
  MEILISEARCH_API_KEY: z.string().min(1),
  MEILISEARCH_INDEX_PREFIX: z.string().default('gq_'),

  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET_PRESCRIPTIONS: z.string().min(1),
  S3_BUCKET_CERTIFICATES: z.string().min(1),
  S3_BUCKET_REGION: z.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: BooleanFromEnv.default(true),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  JWT_ISSUER: z.string().default('genericquick-ncr'),
  JWT_AUDIENCE: z.string().default('genericquick-ncr-api'),
  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default('gq_session'),
  SESSION_COOKIE_SECURE: BooleanFromEnv.default(false),
  SESSION_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  OCR_PROVIDER: z.enum(['google-vision', 'aws-textract', 'azure-form-recognizer', 'not-configured']).default('not-configured'),
  GOOGLE_VISION_API_KEY: OptionalString,
  AWS_TEXTRACT_REGION: OptionalString,
  AWS_TEXTRACT_ACCESS_KEY: OptionalString,
  AWS_TEXTRACT_SECRET_KEY: OptionalString,
  AZURE_FORM_RECOGNIZER_ENDPOINT: OptionalUrl,
  AZURE_FORM_RECOGNIZER_KEY: OptionalString,

  PAYMENT_PROVIDER: z.enum(['razorpay', 'cashfree', 'stripe', 'not-configured']).default('not-configured'),
  RAZORPAY_KEY_ID: OptionalString,
  RAZORPAY_KEY_SECRET: OptionalString,
  RAZORPAY_WEBHOOK_SECRET: OptionalString,
  CASHFREE_APP_ID: OptionalString,
  CASHFREE_SECRET_KEY: OptionalString,
  CASHFREE_WEBHOOK_SECRET: OptionalString,
  STRIPE_SECRET_KEY: OptionalString,
  STRIPE_WEBHOOK_SECRET: OptionalString,
  UPI_COLLECT_MERCHANT_ID: OptionalString,

  SMS_PROVIDER: z.enum(['twilio', 'gupshup', 'not-configured']).default('not-configured'),
  TWILIO_ACCOUNT_SID: OptionalString,
  TWILIO_AUTH_TOKEN: OptionalString,
  TWILIO_FROM_NUMBER: OptionalString,
  GUPSHUP_API_KEY: OptionalString,
  GUPSHUP_SOURCE_NUMBER: OptionalString,
  EMAIL_PROVIDER: z.enum(['sendgrid', 'ses', 'not-configured']).default('not-configured'),
  SENDGRID_API_KEY: OptionalString,
  SENDGRID_FROM_EMAIL: OptionalEmail,
  AWS_SES_REGION: OptionalString,
  AWS_SES_ACCESS_KEY: OptionalString,
  AWS_SES_SECRET_KEY: OptionalString,
  WHATSAPP_PROVIDER: z.enum(['twilio', 'gupshup', 'not-configured']).default('not-configured'),

  MAPS_PROVIDER: z.enum(['google-maps', 'mapbox', 'not-configured']).default('not-configured'),
  GOOGLE_MAPS_API_KEY: OptionalString,
  MAPBOX_ACCESS_TOKEN: OptionalString,
  GEOCODING_PROVIDER: z.enum(['google-maps', 'nominatim', 'not-configured']).default('not-configured'),

  TELEMEDICINE_PROVIDER: z.enum(['custom-webrtc', 'practo', 'mfine', 'not-configured']).default('not-configured'),
  TELEMEDICINE_API_KEY: OptionalString,
  TELEMEDICINE_WEBHOOK_SECRET: OptionalString,

  CDSCO_API_URL: OptionalUrl,
  CDSCO_API_KEY: OptionalString,
  PHARMACY_COUNCIL_DELHI_API: OptionalUrl,
  PHARMACY_COUNCIL_HARYANA_API: OptionalUrl,
  PHARMACY_COUNCIL_UP_API: OptionalUrl,

  FEATURE_PRESCRIPTION_OCR: BooleanFromEnv.default(true),
  FEATURE_TELEMEDICINE: BooleanFromEnv.default(false),
  FEATURE_COLD_CHAIN: BooleanFromEnv.default(true),
  FEATURE_SCHEDULE_X: BooleanFromEnv.default(true),
  FEATURE_NTI_BLOCK: BooleanFromEnv.default(true),
  FEATURE_DEMAND_FORECASTING: BooleanFromEnv.default(false),

  DEFAULT_DELIVERY_RADIUS_KM: PositiveNumberFromEnv.default(5),
  DEFAULT_MIN_SHELF_LIFE_DAYS: PositiveIntFromEnv.default(180),
  DEFAULT_PICKING_SLA_MINUTES: PositiveIntFromEnv.default(2),
  DEFAULT_PHARMACIST_REVIEW_SLA_SECONDS: PositiveIntFromEnv.default(60),
  DEFAULT_ORDER_EXPIRY_MINUTES: PositiveIntFromEnv.default(15),
  DEFAULT_RESERVATION_EXPIRY_MINUTES: PositiveIntFromEnv.default(30),
  MAX_CART_ITEMS: PositiveIntFromEnv.default(50),
  MAX_ORDER_ITEMS: PositiveIntFromEnv.default(100),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const msg = Object.entries(errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${msg}`);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

export function resetEnvCache(): void { cachedEnv = null; }

export function parseTtlToSeconds(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = parseInt(match[1] ?? '15', 10);
  const unit = match[2] ?? 'm';
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] ?? 60);
}