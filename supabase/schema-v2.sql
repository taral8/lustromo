-- ============================================
-- LUSTRUMO SCHEMA V2 — SKILL.MD COMPLIANT
-- Normalised product schema per Section 3
-- Data quality flags per Section 4
-- Ingestion pipeline rules per Section 9
-- ============================================

-- Drop v1 tables that are being replaced
DROP TABLE IF EXISTS scrape_runs CASCADE;
DROP TABLE IF EXISTS diamonds CASCADE;

-- ============================================
-- 1. NORMALISED PRODUCTS (Section 3)
-- ============================================

CREATE TABLE products (
  -- 2.1 Product Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lustrumo_id TEXT UNIQUE NOT NULL,              -- lus_xxxxx format
  retailer_id TEXT NOT NULL,                      -- e.g. rbdiamond_au
  retailer_product_id TEXT NOT NULL,              -- original Shopify/WC product ID
  retailer_sku TEXT,
  product_url TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'unknown',   -- Section 2.2 enum
  platform TEXT NOT NULL DEFAULT 'shopify',       -- shopify / woocommerce / custom
  image_url TEXT,
  date_ingested TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_available BOOLEAN NOT NULL DEFAULT true,

  -- 2.3 Pricing
  price_aud DECIMAL(10,2),
  price_aud_raw TEXT,
  compare_at_price_aud DECIMAL(10,2),
  is_gst_inclusive BOOLEAN DEFAULT true,
  price_valid_date DATE DEFAULT CURRENT_DATE,
  price_status TEXT NOT NULL DEFAULT 'valid',     -- valid/zero/suspicious/missing/needs_review

  -- 2.4 Diamond Fields (nullable — only for diamond product_types)
  diamond_centre_carat DECIMAL(5,3),
  diamond_centre_shape TEXT,
  diamond_centre_color TEXT,
  diamond_centre_clarity TEXT,
  diamond_centre_cut TEXT,
  diamond_centre_type TEXT,                       -- natural / lab_grown
  diamond_centre_cert_number TEXT,
  diamond_centre_cert_body TEXT,                  -- GIA / IGI / HRD / none
  diamond_centre_fluorescence TEXT,
  diamond_centre_polish TEXT,
  diamond_centre_symmetry TEXT,
  diamond_side_stone_type TEXT,                   -- natural / lab_grown / none
  diamond_side_stone_total_carat DECIMAL(5,3),
  diamond_side_stone_count INTEGER,
  diamond_side_stone_quality TEXT,

  -- 2.5 Setting Fields
  setting_style TEXT,                             -- Solitaire / Halo / Pavé / Tension etc
  setting_tier TEXT,                              -- basic / standard / premium / custom
  setting_metal_type TEXT,                        -- 18K Yellow Gold / Platinum etc
  setting_metal_karat TEXT,                       -- 9K / 14K / 18K / 22K / 24K / Plat
  setting_metal_weight_grams DECIMAL(6,2),
  setting_ring_size_au TEXT,
  setting_is_au_made BOOLEAN,

  -- 2.6 Gold Fields (nullable — only for gold_* product_types)
  gold_karat TEXT,
  gold_weight_grams DECIMAL(6,2),
  gold_purity DECIMAL(4,3),
  gold_spot_price_date DATE,
  gold_spot_price_aud_per_gram DECIMAL(10,4),
  gold_intrinsic_value_aud DECIMAL(10,2),

  -- Section 4.4 — Equivalent Value Class
  evc TEXT,                                      -- e.g. LAB-1.00-FG-VS-OVAL-IGI

  -- Data Quality (Section 4)
  data_quality_score INTEGER NOT NULL DEFAULT 100,
  data_quality_flags TEXT[] DEFAULT '{}',

  -- Metadata
  locale TEXT NOT NULL DEFAULT 'au',
  raw_body_html TEXT,                             -- stored for re-parsing

  UNIQUE(retailer_id, retailer_product_id)
);

CREATE INDEX idx_products_type ON products (product_type, locale);
CREATE INDEX idx_products_diamond ON products (diamond_centre_type, diamond_centre_shape, diamond_centre_carat);
CREATE INDEX idx_products_price ON products (price_aud, product_type);
CREATE INDEX idx_products_retailer ON products (retailer_id, is_available);
CREATE INDEX idx_products_cert ON products (diamond_centre_cert_number) WHERE diamond_centre_cert_number IS NOT NULL;
CREATE INDEX idx_products_available ON products (is_available, locale, product_type);
CREATE INDEX idx_products_url ON products (product_url);
CREATE INDEX idx_products_evc ON products (evc, price_aud) WHERE evc IS NOT NULL;

-- ============================================
-- 2. INGESTION LOGS (Section 4 + Section 9)
-- ============================================

CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lustrumo_id TEXT NOT NULL,
  retailer_id TEXT NOT NULL,
  retailer_product_id TEXT,
  product_url TEXT,
  flag_type TEXT NOT NULL,                        -- from Section 3.1 flag types
  flag_severity TEXT NOT NULL,                    -- HIGH / MEDIUM / LOW
  flag_message TEXT,
  raw_value TEXT,                                 -- the value that triggered the flag
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingestion_logs_product ON ingestion_logs (lustrumo_id, created_at DESC);
CREATE INDEX idx_ingestion_logs_retailer ON ingestion_logs (retailer_id, created_at DESC);
CREATE INDEX idx_ingestion_logs_flag ON ingestion_logs (flag_type, flag_severity);

-- ============================================
-- 3. SCRAPE RUNS (enhanced)
-- ============================================

CREATE TABLE scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  products_found INTEGER DEFAULT 0,
  products_ingested INTEGER DEFAULT 0,
  products_skipped INTEGER DEFAULT 0,
  products_flagged INTEGER DEFAULT 0,
  flags_summary JSONB DEFAULT '{}',               -- { "price_zero": 3, "missing_cert_number": 12 }
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scrape_runs_retailer ON scrape_runs (retailer_id, started_at DESC);

-- ============================================
-- 4. Update diamond_price_history to reference products table
-- ============================================

-- (diamond_price_history, gold_prices, retailers, profiles, deal_checks,
--  email_subscribers, report_orders remain from v1 schema — no changes needed)

-- ============================================
-- 5. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_timestamp();

-- ============================================
-- 6. RLS POLICIES
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Service write products" ON products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read ingestion logs" ON ingestion_logs FOR SELECT USING (true);
CREATE POLICY "Service write ingestion logs" ON ingestion_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read scrape runs" ON scrape_runs FOR SELECT USING (true);
CREATE POLICY "Service write scrape runs" ON scrape_runs FOR ALL USING (true) WITH CHECK (true);
