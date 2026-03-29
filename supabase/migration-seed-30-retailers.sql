-- Lustrumo — Seed 30 Additional Australian Jewellery Retailers
-- Run in Supabase SQL Editor or via the API endpoint /api/seed-retailers-directory
-- Date: 2026-03-29

-- ═══════════════════════════════════════════
-- CATEGORY 1: NATIONAL CHAINS (5)
-- ═══════════════════════════════════════════

INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped, product_count, diamond_count, gold_count, confidence_score)
VALUES
  ('Bevilles Jewellers', 'https://www.bevilles.com.au', 'au', 'National', NULL, true, true, ARRAY['diamond', 'gold', 'silver', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Pandora Australia', 'https://au.pandora.net', 'au', 'National', NULL, true, true, ARRAY['silver', 'gold', 'lab_grown'], 'manual', false, 0, 0, 0, 0),
  ('Swarovski Australia', 'https://www.swarovski.com/en_GB-AU/', 'au', 'National', NULL, true, true, ARRAY['silver', 'diamond'], 'manual', false, 0, 0, 0, 0),
  ('Tiffany & Co Australia', 'https://www.tiffany.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'gold', 'silver'], 'manual', false, 0, 0, 0, 0),
  ('Zamels Jewellers', 'https://www.zamels.com.au', 'au', 'National', NULL, true, true, ARRAY['diamond', 'gold', 'silver', 'engagement'], 'manual', false, 0, 0, 0, 0);

-- ═══════════════════════════════════════════
-- CATEGORY 2: INDEPENDENT FINE JEWELLERS (10)
-- ═══════════════════════════════════════════

INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped, product_count, diamond_count, gold_count, confidence_score)
VALUES
  ('Armans Fine Jewellery', 'https://armansfinejewellery.com', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'lab_grown', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('GS Diamonds', 'https://www.gsdiamonds.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'lab_grown', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Temple and Grace', 'https://www.templeandgrace.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Affinity Diamonds', 'https://affinitydiamonds.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'lab_grown', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Simon Curwood Jewellers', 'https://www.simoncurwood.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'gold', 'lab_grown'], 'manual', false, 0, 0, 0, 0),
  ('Dracakis Jewellers', 'https://dracakis.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Diamond Imports', 'https://www.diamondimports.com.au', 'au', 'Sydney', 'NSW', true, true, ARRAY['diamond', 'engagement', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Kush Diamonds', 'https://www.kushdiamonds.com.au', 'au', 'Melbourne', 'VIC', true, true, ARRAY['diamond', 'engagement', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Torres Jewel Co', 'https://www.torresjewelco.com.au', 'au', 'Melbourne', 'VIC', true, true, ARRAY['diamond', 'engagement', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Cullen Jewellery', 'https://cullenjewellery.com', 'au', 'Melbourne', 'VIC', true, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0);

-- ═══════════════════════════════════════════
-- CATEGORY 3: SOUTH ASIAN / DIASPORA GOLD (5)
-- ═══════════════════════════════════════════

INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped, product_count, diamond_count, gold_count, confidence_score)
VALUES
  ('Akshara Jewellers', 'https://aksharajewellers.com.au', 'au', 'Harris Park', 'NSW', true, false, ARRAY['gold', 'diamond', 'traditional'], 'manual', false, 0, 0, 0, 0),
  ('SG Jewels Australia', 'https://sgjewel.com.au', 'au', 'Dandenong', 'VIC', true, true, ARRAY['gold', 'traditional', 'silver'], 'manual', false, 0, 0, 0, 0),
  ('OM Jewellers', 'https://www.omjewellers.com.au', 'au', 'Perth', 'WA', true, true, ARRAY['gold', 'diamond', 'traditional'], 'manual', false, 0, 0, 0, 0),
  ('Sardar Jewellers', 'https://www.sardarjewellers.com.au', 'au', 'Werribee', 'VIC', true, false, ARRAY['gold', 'diamond', 'traditional'], 'manual', false, 0, 0, 0, 0),
  ('South East Fashions', 'https://southeastfashions.com.au', 'au', 'Dandenong', 'VIC', true, true, ARRAY['gold', 'traditional', 'silver'], 'manual', false, 0, 0, 0, 0);

-- ═══════════════════════════════════════════
-- CATEGORY 4: LAB-GROWN DIAMOND SPECIALISTS (5)
-- ═══════════════════════════════════════════

INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped, product_count, diamond_count, gold_count, confidence_score)
VALUES
  ('LINDELLI', 'https://www.lindelli.com', 'au', 'Sydney', 'NSW', true, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Diamond Lab', 'https://shop.diamond-lab.com.au', 'au', 'Perth', 'WA', false, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Luminesce Diamonds', 'https://luminescediamonds.com.au', 'au', 'National', NULL, true, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Eco Lab Diamonds', 'https://ecolabdiamonds.com.au', 'au', 'Melbourne', 'VIC', false, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Leil Jewellery', 'https://leil.com.au', 'au', 'Sydney', 'NSW', false, true, ARRAY['lab_grown', 'diamond', 'engagement'], 'manual', false, 0, 0, 0, 0);

-- ═══════════════════════════════════════════
-- CATEGORY 5: ONLINE-ONLY RETAILERS (5)
-- ═══════════════════════════════════════════

INSERT INTO retailers_directory (name, website_url, locale, city, state, has_physical_store, has_online_store, categories, data_source, is_scraped, product_count, diamond_count, gold_count, confidence_score)
VALUES
  ('Indie and Harper', 'https://www.indieandharper.com', 'au', 'Melbourne', 'VIC', false, true, ARRAY['silver', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Vinny and Charles', 'https://vinnyandcharles.com', 'au', 'Perth', 'WA', false, true, ARRAY['engagement', 'diamond', 'gold'], 'manual', false, 0, 0, 0, 0),
  ('Alana Maria Jewellery', 'https://alanamariajewellery.com', 'au', 'Sydney', 'NSW', false, true, ARRAY['gold', 'silver'], 'manual', false, 0, 0, 0, 0),
  ('Francesca Jewellery', 'https://www.francesca.com.au', 'au', 'Hobart', 'TAS', false, true, ARRAY['silver', 'gold', 'engagement'], 'manual', false, 0, 0, 0, 0),
  ('Sarah and Sebastian', 'https://www.sarahandsebastian.com', 'au', 'Sydney', 'NSW', false, true, ARRAY['diamond', 'gold', 'engagement'], 'manual', false, 0, 0, 0, 0);

-- Verify count
SELECT COUNT(*) AS total_directory_retailers FROM retailers_directory WHERE locale = 'au';
