-- 0005_formulation_fingerprint.sql
-- Partial unique index on formulation.fingerprint (WHERE schema_version = 1)

CREATE UNIQUE INDEX IF NOT EXISTS idx_formulations_fingerprint_v1
    ON formulations (fingerprint)
    WHERE schema_version = 1;
