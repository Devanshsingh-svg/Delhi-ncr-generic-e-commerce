import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv, resetEnvCache, parseTtlToSeconds } from '../src/env';

describe('Env validation', () => {
  const originalEnv = process.env;
  beforeEach(() => { resetEnvCache(); process.env = { ...originalEnv }; });
  afterEach(() => { resetEnvCache(); process.env = originalEnv; });

  it('throws on missing JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    expect(() => getEnv()).toThrow('Invalid environment configuration');
    expect(() => getEnv()).toThrow('JWT_SECRET');
  });

  it('parses all types correctly', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.MEILISEARCH_URL = 'http://localhost:7700';
    process.env.MEILISEARCH_API_KEY = 'key';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_ACCESS_KEY = 'ak';
    process.env.S3_SECRET_KEY = 'sk';
    process.env.S3_BUCKET_PRESCRIPTIONS = 'b1';
    process.env.S3_BUCKET_CERTIFICATES = 'b2';
    process.env.SESSION_SECRET = 'b'.repeat(32);
    const env = getEnv();
    expect(env.NODE_ENV).toBe('development');
    expect(env.DATABASE_POOL_SIZE).toBe(20);
    expect(env.REDIS_MAX_RETRIES).toBe(3);
    expect(env.LOG_PRETTY).toBe(true);
    expect(env.FEATURE_NTI_BLOCK).toBe(true);
    expect(env.DEFAULT_MIN_SHELF_LIFE_DAYS).toBe(180);
  });

  it('coerces string numbers to int', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.MEILISEARCH_URL = 'http://localhost:7700';
    process.env.MEILISEARCH_API_KEY = 'key';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_ACCESS_KEY = 'ak';
    process.env.S3_SECRET_KEY = 'sk';
    process.env.S3_BUCKET_PRESCRIPTIONS = 'b1';
    process.env.S3_BUCKET_CERTIFICATES = 'b2';
    process.env.SESSION_SECRET = 'b'.repeat(32);
    process.env.DATABASE_POOL_SIZE = '15';
    const env = getEnv();
    expect(env.DATABASE_POOL_SIZE).toBe(15);
    expect(typeof env.DATABASE_POOL_SIZE).toBe('number');
  });

  it('BooleanFromEnv parses enum correctly', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.MEILISEARCH_URL = 'http://localhost:7700';
    process.env.MEILISEARCH_API_KEY = 'key';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_ACCESS_KEY = 'ak';
    process.env.S3_SECRET_KEY = 'sk';
    process.env.S3_BUCKET_PRESCRIPTIONS = 'b1';
    process.env.S3_BUCKET_CERTIFICATES = 'b2';
    process.env.SESSION_SECRET = 'b'.repeat(32);
    process.env.LOG_PRETTY = 'false';
    const env = getEnv();
    expect(env.LOG_PRETTY).toBe(false);
  });

  it('empty string becomes undefined for optional fields', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.MEILISEARCH_URL = 'http://localhost:7700';
    process.env.MEILISEARCH_API_KEY = 'key';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_ACCESS_KEY = 'ak';
    process.env.S3_SECRET_KEY = 'sk';
    process.env.S3_BUCKET_PRESCRIPTIONS = 'b1';
    process.env.S3_BUCKET_CERTIFICATES = 'b2';
    process.env.SESSION_SECRET = 'b'.repeat(32);
    process.env.GOOGLE_VISION_API_KEY = '';
    const env = getEnv();
    expect(env.GOOGLE_VISION_API_KEY).toBeUndefined();
  });

  it('parseTtlToSeconds converts correctly', () => {
    expect(parseTtlToSeconds('15m')).toBe(900);
    expect(parseTtlToSeconds('7d')).toBe(604800);
    expect(parseTtlToSeconds('1h')).toBe(3600);
  });
});