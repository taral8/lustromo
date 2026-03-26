-- ============================================
-- LUSTRUMO DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Diamond inventory (scraped from retailers)
CREATE TABLE diamonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source
  retailer_name TEXT NOT NULL,
  retailer_url TEXT,
  product_url TEXT NOT NULL UNIQUE,
  product_name TEXT,
  image_url TEXT,

  -- Diamond specs
  shape TEXT NOT NULL,
  carat DECIMAL(5,2) NOT NULL,
  color TEXT,          -- D through K
  clarity TEXT,        -- FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2
  cut TEXT,            -- Excellent, Very Good, Good, Fair, Poor
  polish TEXT,
  symmetry TEXT,
  fluorescence TEXT,

  -- Origin & certification
  origin TEXT NOT NULL CHECK (origin IN ('natural', 'lab_grown')),
  cert_lab TEXT,       -- GIA, IGI, GCAL
  cert_number TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  price_per_carat DECIMAL(10,2),

  -- Setting info (if ring/jewellery piece, not loose stone)
  metal TEXT,          -- 18K Gold, Platinum, etc.
  setting_type TEXT,   -- Solitaire, Halo, etc.
  has_side_stones BOOLEAN DEFAULT false,

  -- Metadata
  locale TEXT NOT NULL DEFAULT 'au',
  is_available BOOLEAN DEFAULT true,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_price DECIMAL(10,2),  -- previous price for tracking changes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_diamonds_lookup ON diamonds (origin, shape, carat, locale);
CREATE INDEX idx_diamonds_price ON diamonds (origin, shape, carat, price);
CREATE INDEX idx_diamonds_retailer ON diamonds (retailer_name, locale);
CREATE INDEX idx_diamonds_available ON diamonds (is_available, locale);
CREATE INDEX idx_diamonds_product_url ON diamonds (product_url);

-- 2. Diamond price history (daily aggregates for charts)
CREATE TABLE diamond_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shape TEXT NOT NULL,
  carat_bucket DECIMAL(3,1) NOT NULL, -- 0.5, 1.0, 1.5, 2.0, 3.0
  origin TEXT NOT NULL CHECK (origin IN ('natural', 'lab_grown')),
  locale TEXT NOT NULL DEFAULT 'au',

  avg_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  median_price DECIMAL(10,2),
  inventory_count INTEGER NOT NULL DEFAULT 0,

  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(shape, carat_bucket, origin, locale, recorded_date)
);

CREATE INDEX idx_price_history_lookup ON diamond_price_history (origin, shape, carat_bucket, locale, recorded_date);

-- 3. Gold spot prices (fetched hourly)
CREATE TABLE gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'au',
  currency TEXT NOT NULL DEFAULT 'AUD',
  price_per_gram DECIMAL(10,4) NOT NULL,
  price_per_ounce DECIMAL(10,4) NOT NULL,
  source TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gold_prices_lookup ON gold_prices (locale, recorded_at DESC);

-- 4. Retailers
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  locale TEXT NOT NULL DEFAULT 'au',

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'AU',
  is_online BOOLEAN DEFAULT true,
  is_physical BOOLEAN DEFAULT false,

  -- Classification
  specialities TEXT[],  -- {'lab_grown', 'natural', 'gold', 'engagement'}
  scraper_id TEXT,      -- Apify actor ID for this retailer
  scrape_url TEXT,      -- Base URL for scraping
  is_active BOOLEAN DEFAULT true,

  -- Stats (updated by aggregation job)
  total_diamonds INTEGER DEFAULT 0,
  avg_price_1ct_lab DECIMAL(10,2),
  avg_price_1ct_natural DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium', 'annual')),
  deal_checks_used INTEGER DEFAULT 0,
  deal_checks_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + interval '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Deal checks (history + rate limiting)
CREATE TABLE deal_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,  -- for anonymous users

  product_url TEXT,
  retailer_name TEXT,
  product_name TEXT,
  asking_price DECIMAL(10,2),

  -- Extracted specs
  shape TEXT,
  carat DECIMAL(5,2),
  color TEXT,
  clarity TEXT,
  origin TEXT,
  metal TEXT,
  cert_lab TEXT,

  -- Our estimate
  fair_price DECIMAL(10,2),
  verdict TEXT,  -- 'great_deal', 'fair', 'above_average', 'overpriced'
  diff_percent DECIMAL(5,1),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deal_checks_user ON deal_checks (user_id, created_at DESC);
CREATE INDEX idx_deal_checks_session ON deal_checks (session_id, created_at DESC);

-- 7. Email subscribers
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,  -- 'homepage', 'deal_checker', 'gold_calculator', 'learn', 'footer'
  locale TEXT DEFAULT 'au',
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_subscribers_email ON email_subscribers (email);

-- 8. Premium report orders
CREATE TABLE report_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  report_type TEXT CHECK (report_type IN ('diamond_intelligence', 'gold_valuation', 'retailer_dd')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered')),
  input_data JSONB,
  report_url TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'AUD',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Scrape runs (tracking scraper health)
CREATE TABLE scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES retailers(id),
  retailer_name TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_delisted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scrape_runs_retailer ON scrape_runs (retailer_id, started_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diamonds_updated_at BEFORE UPDATE ON diamonds FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER retailers_updated_at BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED: Initial retailers to scrape
-- ============================================

INSERT INTO retailers (name, slug, website_url, locale, is_online, specialities, scrape_url) VALUES
  ('Novita Diamonds', 'novita-diamonds', 'https://www.novitadiamonds.com.au', 'au', true, ARRAY['lab_grown', 'engagement'], 'https://www.novitadiamonds.com.au/collections/all'),
  ('RB Diamond', 'rb-diamond', 'https://rbdiamond.com.au', 'au', true, ARRAY['natural', 'lab_grown', 'engagement'], 'https://rbdiamond.com.au/collections'),
  ('Mdera', 'mdera', 'https://mdera.com.au', 'au', true, ARRAY['lab_grown', 'engagement'], 'https://mdera.com.au/collections/all'),
  ('Diamond Story', 'diamond-story', 'https://www.diamondstory.com.au', 'au', true, ARRAY['natural', 'lab_grown', 'engagement'], 'https://www.diamondstory.com.au/collections'),
  ('Nina''s Jewellery', 'ninas-jewellery', 'https://ninasjewellery.com.au', 'au', true, ARRAY['natural', 'engagement', 'gold'], 'https://ninasjewellery.com.au/collections');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_orders ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deal checks: users can view their own
CREATE POLICY "Users can view own deal checks" ON deal_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert deal checks" ON deal_checks FOR INSERT WITH CHECK (true);

-- Public read access for diamonds and price history
ALTER TABLE diamonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read diamonds" ON diamonds FOR SELECT USING (true);
CREATE POLICY "Public read price history" ON diamond_price_history FOR SELECT USING (true);
CREATE POLICY "Public read retailers" ON retailers FOR SELECT USING (true);
CREATE POLICY "Public read gold prices" ON gold_prices FOR SELECT USING (true);

-- Service role can write to all tables (used by scrapers/APIs)
CREATE POLICY "Service write diamonds" ON diamonds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write price history" ON diamond_price_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write gold prices" ON gold_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write retailers" ON retailers FOR ALL USING (true) WITH CHECK (true);
