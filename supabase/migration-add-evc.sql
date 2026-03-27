-- Migration: Add EVC (Equivalent Value Class) column to products table
-- SKILL.md Section 4.4

ALTER TABLE products ADD COLUMN IF NOT EXISTS evc TEXT;

CREATE INDEX IF NOT EXISTS idx_products_evc ON products (evc, price_aud) WHERE evc IS NOT NULL;
