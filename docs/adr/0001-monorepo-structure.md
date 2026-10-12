# ADR 0001: Monorepo Structure with pnpm + Turborepo
**Date:** 2026-10-12 **Status:** Accepted
## Context
Need to manage 3 applications and 5 shared packages with shared TypeScript config, coordinated builds, and independent deployment.
## Decision
Use pnpm workspaces with Turborepo for build orchestration.
## Consequences
- Shared types via package exports (not tsconfig paths)
- Atomic commits across apps/packages
- Turborepo caching speeds CI
- Independent deployments via Docker per app