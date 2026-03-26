-- ============================================
-- RESET: Drop all Lustrumo tables and recreate
-- Run this in Supabase SQL Editor if you need a fresh start
-- ============================================

DROP TABLE IF EXISTS scrape_runs CASCADE;
DROP TABLE IF EXISTS report_orders CASCADE;
DROP TABLE IF EXISTS deal_checks CASCADE;
DROP TABLE IF EXISTS email_subscribers CASCADE;
DROP TABLE IF EXISTS diamond_price_history CASCADE;
DROP TABLE IF EXISTS diamonds CASCADE;
DROP TABLE IF EXISTS gold_prices CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
