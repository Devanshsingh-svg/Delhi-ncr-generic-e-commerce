-- 0001_audit_append_only.sql
-- Trigger + REVOKE on audit_events to make it append-only

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity TEXT NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    actor_id UUID,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Append-only trigger: reject UPDATE and DELETE on audit_events
CREATE OR REPLACE FUNCTION reject_audit_mutation()
RETURNS EVENT TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_events is append-only: UPDATE and DELETE are not permitted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events_no_update ON audit_events;
DROP TRIGGER IF EXISTS audit_events_no_delete ON audit_events;

CREATE TRIGGER audit_events_no_update
    BEFORE UPDATE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION reject_audit_mutation();

CREATE TRIGGER audit_events_no_delete
    BEFORE DELETE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION reject_audit_mutation();

-- Revoke direct write privileges on audit_events from application roles
REVOKE UPDATE, DELETE ON audit_events FROM PUBLIC;
