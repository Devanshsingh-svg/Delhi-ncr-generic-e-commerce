-- 0003_spatial_columns.sql
-- delivery_polygon GEOMETRY on DarkStore, geo GEOGRAPHY on Address

ALTER TABLE IF EXISTS dark_stores
    ADD COLUMN IF NOT EXISTS delivery_polygon GEOMETRY(Polygon, 4326);

ALTER TABLE IF EXISTS addresses
    ADD COLUMN IF NOT EXISTS geo GEOGRAPHY(POINT, 4326);
