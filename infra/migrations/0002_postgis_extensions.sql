-- 0002_postgis_extensions.sql
-- CREATE EXTENSION postgis, citext, pgcrypto, uuid-ossp

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
