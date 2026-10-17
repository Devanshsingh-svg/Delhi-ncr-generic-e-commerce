# ADR 0004: PrismaUserRepository as Class Adapter over UserRepository Port

**Date:** 2026-10-17 **Status:** Accepted

## Context
Phase 1 wires `USER_REPOSITORY_TOKEN` (a `Symbol`) to `NotConfiguredUserRepository`, which throws `AuthPersistenceNotConfiguredError` (503) on every call. Phase 2 (Layout) must replace it with a real Prisma-backed implementation so auth persistence works. The domain layer defines `UserRepository` as an abstract class (port) in `@gq/domain` and `@gq/db` owns the `PrismaClient` singleton. `@gq/domain` must remain framework-agnostic (no `@prisma/client`, guard #5) and DI must use the Symbol token, never an interface-as-token (guard #4).

## Decision
`PrismaUserRepository` is a **class adapter** extending `UserRepository` (the port), implemented in `@gq/db` (data/access layer, co-located with `PrismaClient`). `@gq/db` adds `@gq/domain` as a dependency to import the `UserRepository` abstract class and `USER_REPOSITORY_TOKEN`. The API composition layer (`@gq/api`) swaps `useClass: NotConfiguredUserRepository` for `useClass: PrismaUserRepository` against the same `USER_REPOSITORY_TOKEN`. No interface is ever used as a NestJS DI token.

## Rationale
- Keeps `@gq/domain` free of Prisma/ORM concerns (framework-agnostic domain, guard #5).
- Preserves the Symbol-token DI pattern (guard #4); no `useClass` with an interface token.
- Adapter co-located with `PrismaClient` in `@gq/db`; the client's singleton/lifecycle (client.ts) is reused unchanged.
- Clean dependency direction: `@gq/contracts` → `@gq/domain` → `@gq/db` → `@gq/api` (no cycles).

## Consequences
- `@gq/db` gains a runtime dependency on `@gq/domain` (must be added to `packages/db/package.json`).
- Phase 2 must provide `packages/db/src/repositories/prisma-user-repository.ts` implementing all `UserRepository` abstract methods against the Prisma schema (27 entities incl. `User`).
- `apps/api/src/modules/auth/auth.module.ts` provider registration changes from `NotConfiguredUserRepository` to `PrismaUserRepository`.
- Until Phase 2, `NotConfiguredUserRepository` remains in place and auth endpoints return 503 (intentional, guard #6 boundary).
