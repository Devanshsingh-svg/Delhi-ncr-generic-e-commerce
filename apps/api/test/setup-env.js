"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test environment setup — runs before all tests
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/genericquick';
process.env['JWT_SECRET'] = 'test-secret-min-32-chars-long-!!';
process.env['SESSION_SECRET'] = 'test-session-secret-min-32-chars-!!';
process.env['PORT'] = '0';
//# sourceMappingURL=setup-env.js.map