# ADR 0002: SHA-256 Formulation Fingerprint in Service Layer
**Date:** 2026-10-12 **Status:** Accepted
## Context
Directive §5 requires deterministic formulation fingerprint for brand-generic matching. DB trigger fails because ingredients don't exist at formulation INSERT time.
## Decision
Compute fingerprint in FormulationFingerprintService.createWithIngredients() inside the same transaction that writes formulation + ingredients. Enforce uniqueness via partial unique index on formulation.fingerprint WHERE schema_version = 1.
## Consequences
- No DB trigger race conditions
- Fingerprint computed after all ingredients persisted
- Application-level collision check before insert
- Partial index allows historical schema versions during migration