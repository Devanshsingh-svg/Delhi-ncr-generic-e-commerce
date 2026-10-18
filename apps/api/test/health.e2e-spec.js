"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
class PrismaServiceStub {
    async onModuleInit() { }
    async onModuleDestroy() { }
    async cleanDatabase() { }
    async $queryRaw() {
        throw new Error('stub: no database');
    }
}
describe('HealthController (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider(prisma_service_1.PrismaService)
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
        const res = await (0, supertest_1.default)(app.getHttpServer()).get('/api/v1/health').expect(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('status');
        expect(['ok', 'degraded', 'down']).toContain(res.body.data.status);
        expect(res.body.data).toHaveProperty('checks');
    });
    it.skip('postgres check reports ok when SELECT 1 succeeds — requires live DB', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer()).get('/api/v1/health').expect(200);
        const pgCheck = res.body.data.checks.find((c) => c.name === 'postgres');
        expect(pgCheck).toBeDefined();
        expect(pgCheck.status).toBe('ok');
    });
    it.skip('GET /auth/me does not leak passwordHash or mfaSecret — Phase 2', async () => { });
});
//# sourceMappingURL=health.e2e-spec.js.map