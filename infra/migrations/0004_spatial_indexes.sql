-- 0004_spatial_indexes.sql
-- GiST indexes on DarkStore.delivery_polygon and Address.geo

CREATE INDEX IF NOT EXISTS idx_dark_stores_delivery_polygon
    ON dark_stores USING GIST (delivery_polygon);

CREATE INDEX IF NOT EXISTS idx_addresses_geo
    ON addresses USING GIST (geo);
