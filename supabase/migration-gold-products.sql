-- Migration: Add gold_products table (Phase 2C)

CREATE TABLE IF NOT EXISTS gold_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'au',
  retailer_name TEXT NOT NULL,
  retailer_url TEXT,
  product_url TEXT NOT NULL UNIQUE,
  product_handle TEXT,
  title TEXT NOT NULL,
  price_local DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  karat INTEGER,
  gold_color TEXT,
  weight_grams DECIMAL,
  weight_source TEXT DEFAULT 'estimated',
  product_type TEXT,
  has_diamonds BOOLEAN DEFAULT false,
  has_gemstones BOOLEAN DEFAULT false,
  image_url TEXT,
  description TEXT,
  tags TEXT[],
  intrinsic_value DECIMAL,
  making_charge_pct DECIMAL,
  making_charge_rating TEXT,
  fair_price_low DECIMAL,
  fair_price_high DECIMAL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gold_products_lookup
  ON gold_products (locale, karat, product_type, scraped_at);
CREATE INDEX IF NOT EXISTS idx_gold_products_retailer
  ON gold_products (retailer_name, scraped_at);

-- RLS
ALTER TABLE gold_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gold products" ON gold_products FOR SELECT USING (true);
CREATE POLICY "Service write gold products" ON gold_products FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_gold_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gold_products_updated_at
  BEFORE UPDATE ON gold_products
  FOR EACH ROW EXECUTE FUNCTION update_gold_product_timestamp();
