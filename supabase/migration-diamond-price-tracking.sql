-- Lustrumo — Diamond Price Tracking Tables
-- Run in Supabase SQL Editor
--
-- 1. diamond_price_history: per-product price change log
-- 2. diamond_price_index: daily aggregate price index by origin/carat/shape

-- ═══ Price History (per-product changes detected during scrape) ═══

CREATE TABLE IF NOT EXISTS diamond_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_url TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  price_old DECIMAL,
  price_new DECIMAL,
  change_pct DECIMAL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dph_product_url ON diamond_price_history (product_url);
CREATE INDEX IF NOT EXISTS idx_dph_recorded_at ON diamond_price_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dph_retailer ON diamond_price_history (retailer_name);

-- ═══ Price Index (daily aggregates for sparklines + trend cards) ═══

CREATE TABLE IF NOT EXISTS diamond_price_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,         -- 'natural' or 'lab_grown'
  carat_bucket TEXT NOT NULL,   -- '0.50', '1.00', '1.50', '2.00', '3.00'
  shape TEXT NOT NULL,           -- 'round', 'oval', etc.
  avg_price DECIMAL NOT NULL,
  median_price DECIMAL,
  min_price DECIMAL,
  max_price DECIMAL,
  sample_size INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpi_lookup ON diamond_price_index (origin, carat_bucket, shape, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dpi_recorded_at ON diamond_price_index (recorded_at DESC);
