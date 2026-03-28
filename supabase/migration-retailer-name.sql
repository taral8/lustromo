-- Migration: Add retailer_name to products table for consistent cross-table joins
-- The gold_products table uses retailer_name, products uses retailer_id.
-- Adding retailer_name to products allows direct joins.

ALTER TABLE products ADD COLUMN IF NOT EXISTS retailer_name TEXT;

-- Backfill existing Armans records
UPDATE products SET retailer_name = 'Armans Fine Jewellery' WHERE retailer_id = 'armansfinejewellery_au' AND retailer_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_retailer_name ON products (retailer_name) WHERE retailer_name IS NOT NULL;
