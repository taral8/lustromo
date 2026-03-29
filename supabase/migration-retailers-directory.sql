-- Lustrumo — Retailers Directory Table
-- Run in Supabase SQL Editor
--
-- Stores both scraped and manually-added retailers.
-- Manual entries appear in the "Directory" section of the Retailer Scorecard.

CREATE TABLE IF NOT EXISTS retailers_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website_url TEXT,
  locale TEXT DEFAULT 'au',
  city TEXT,
  state TEXT,
  has_physical_store BOOLEAN DEFAULT false,
  has_online_store BOOLEAN DEFAULT true,
  categories TEXT[],
  data_source TEXT DEFAULT 'manual',
  is_scraped BOOLEAN DEFAULT false,
  product_count INTEGER DEFAULT 0,
  diamond_count INTEGER DEFAULT 0,
  gold_count INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rd_locale ON retailers_directory (locale);
CREATE INDEX IF NOT EXISTS idx_rd_is_scraped ON retailers_directory (is_scraped);

-- Seed with major Australian jewellers (manual entries)
INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped)
VALUES
  ('Michael Hill', 'https://www.michaelhill.com.au', 'au', 'National', NULL, true, true, ARRAY['Diamond', 'Gold', 'Lab Grown'], 'manual', false),
  ('Hardy Brothers', 'https://www.hardybrothers.com.au', 'au', 'Sydney, Melbourne, Brisbane, Perth', NULL, true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Cerrone', 'https://www.cerrone.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Novita Diamonds', 'https://novitadiamonds.com', 'au', 'Sydney, Melbourne, Brisbane, Perth, Adelaide, Gold Coast', NULL, true, true, ARRAY['Lab Grown'], 'manual', false),
  ('Jan Logan', 'https://www.janlogan.com', 'au', 'Sydney, Melbourne', NULL, true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Kadera', 'https://www.kadera.com.au', 'au', 'Melbourne', 'VIC', false, true, ARRAY['Lab Grown', 'Diamond'], 'manual', false),
  ('Prouds', 'https://www.prouds.com.au', 'au', 'National', NULL, true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Angus & Coote', 'https://www.anguscoote.com.au', 'au', 'National', NULL, true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Wallace Bishop', 'https://www.wallacebishop.com.au', 'au', 'Queensland', 'QLD', true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Gregory Jewellers', 'https://www.gregoryjewellers.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['Diamond', 'Gold'], 'manual', false),
  ('Lardera', 'https://www.lardera.com.au', 'au', 'Melbourne', 'VIC', false, true, ARRAY['Lab Grown'], 'manual', false),
  ('Malabar Gold', 'https://www.malabargoldanddiamonds.com', 'au', 'Sydney (Harris Park)', 'NSW', true, false, ARRAY['Gold', 'Diamond', 'Traditional'], 'manual', false);
