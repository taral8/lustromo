#!/bin/bash
echo "Starting Lustrumo retailer scrape..."
echo "=================================="

echo ""
echo "[1/7] Scraping Bevilles..."
npx tsx scripts/scrape-all-retailers.ts --retailer "bevilles.com.au"

echo ""
echo "[2/7] Scraping My Jewellery Story..."
npx tsx scripts/scrape-all-retailers.ts --retailer "myjewellerystory.com.au"

echo ""
echo "[3/7] Scraping Armans Fine Jewellery..."
npx tsx scripts/scrape-all-retailers.ts --retailer "armansfinejewellery.com"

echo ""
echo "[4/7] Scraping Shiels..."
npx tsx scripts/scrape-all-retailers.ts --retailer "shiels.com.au"

echo ""
echo "[5/7] Scraping Novita Diamonds..."
npx tsx scripts/scrape-all-retailers.ts --retailer "novitadiamonds.com"

echo ""
echo "[6/7] Scraping Luke Rose Jewellery..."
npx tsx scripts/scrape-all-retailers.ts --retailer "lukerosejewellery.com"

echo ""
echo "[7/7] Scraping Lindelli..."
npx tsx scripts/scrape-all-retailers.ts --retailer "lindelli.com"

echo ""
echo "=================================="
echo "All retailers complete."
