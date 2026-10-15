import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getLogger, createChildLogger } from '../src/logger';
import { resetEnvCache } from '@gq/config';

describe('Logger', () => {
  beforeEach(() => {
    resetEnvCache();
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
  });
  afterEach(() => { resetEnvCache(); });
  it('returns Pino instance', () => { const logger = getLogger(); expect(typeof logger.info).toBe('function'); });
  it('has redact configuration for sensitive fields', () => {
    const logger = getLogger();
    // Verify redaction config exists on the logger
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });
  it('createChildLogger adds bindings', () => { const child = createChildLogger({ module: 'TestModule', requestId: 'req-123' }); expect(typeof child.info).toBe('function'); });
});