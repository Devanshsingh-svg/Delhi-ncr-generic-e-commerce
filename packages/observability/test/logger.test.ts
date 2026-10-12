import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLogger, createChildLogger } from '../src/logger';
import { resetEnvCache } from '@gq/config';

describe('Logger', () => {
  beforeEach(() => { resetEnvCache(); process.env.JWT_SECRET = 'a'.repeat(32); process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'; process.env.REDIS_URL = 'redis://localhost:6379'; process.env.MEILISEARCH_URL = 'http://localhost:7700'; process.env.MEILISEARCH_API_KEY = 'key'; process.env.S3_ENDPOINT = 'http://localhost:9000'; process.env.S3_ACCESS_KEY = 'ak'; process.env.S3_SECRET_KEY = 'sk'; process.env.S3_BUCKET_PRESCRIPTIONS = 'b1'; process.env.S3_BUCKET_CERTIFICATES = 'b2'; process.env.SESSION_SECRET = 'b'.repeat(32); });
  afterEach(() => { resetEnvCache(); });
  it('returns Pino instance', () => { const logger = getLogger(); expect(typeof logger.info).toBe('function'); });
  it('redacts sensitive fields including identifier', () => { const logger = getLogger(); const stream = { write: vi.fn() }; const loggerWithStream = logger.child({}, { stream }); loggerWithStream.info({ password: 'secret123', identifier: 'user@example.com', token: 'abc', normal: 'value' }, 'test'); const call = stream.write.mock.calls[0][0]; expect(call).toContain('[REDACTED]'); expect(call).not.toContain('secret123'); expect(call).not.toContain('user@example.com'); });
  it('createChildLogger adds bindings', () => { const child = createChildLogger({ module: 'TestModule', requestId: 'req-123' }); expect(typeof child.info).toBe('function'); });
});