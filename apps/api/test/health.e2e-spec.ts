import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

class PrismaServiceStub {
  async onModuleInit() {}
  async onModuleDestroy() {}
  async cleanDatabase() {}
  async $queryRaw() {
    throw new Error('stub: no database');
  }
}

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceStub)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) returns status object', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('status');
    expect(['ok', 'degraded', 'down']).toContain(res.body.data.status);
    expect(res.body.data).toHaveProperty('checks');
  });

  it.skip('postgres check reports ok when SELECT 1 succeeds — requires live DB', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    const pgCheck = res.body.data.checks.find((c: any) => c.name === 'postgres');
    expect(pgCheck).toBeDefined();
    expect(pgCheck.status).toBe('ok');
  });

  it.skip('GET /auth/me does not leak passwordHash or mfaSecret — Phase 2', async () => {});
});