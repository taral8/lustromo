/**
 * Generate PWA icons from the SVG source.
 *
 * Requires: npm install sharp (dev dependency)
 * Usage: npx tsx scripts/generate-icons.ts
 */

import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

async function generateIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sharp: any
  try {
    sharp = (await import("sharp" as string)).default
  } catch {
    console.error("sharp is not installed. Run: npm install -D sharp")
    console.log("\nAlternatively, create these PNG files manually:")
    console.log("  public/icons/icon-192.png (192x192)")
    console.log("  public/icons/icon-192-maskable.png (192x192 with padding)")
    console.log("  public/icons/icon-512.png (512x512)")
    console.log("  public/icons/icon-512-maskable.png (512x512 with padding)")
    process.exit(1)
  }

  const svgPath = join(process.cwd(), "public/icons/icon.svg")
  const svg = readFileSync(svgPath)
  const outDir = join(process.cwd(), "public/icons")

  const sizes = [192, 512]

  for (const size of sizes) {
    // Standard icon
    await sharp(svg).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`))
    console.log(`  ✓ icon-${size}.png`)

    // Maskable icon (10% padding for safe zone)
    const padding = Math.round(size * 0.1)
    const inner = size - padding * 2
    const innerBuf = await sharp(svg).resize(inner, inner).png().toBuffer()
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 13, g: 148, b: 136, alpha: 1 } },
    })
      .composite([{ input: innerBuf, left: padding, top: padding }])
      .png()
      .toFile(join(outDir, `icon-${size}-maskable.png`))
    console.log(`  ✓ icon-${size}-maskable.png`)
  }

  // Apple touch icon (180x180)
  await sharp(svg).resize(180, 180).png().toFile(join(outDir, `apple-touch-icon.png`))
  console.log(`  ✓ apple-touch-icon.png`)

  // Favicon 32x32
  await sharp(svg).resize(32, 32).png().toFile(join(outDir, `favicon-32.png`))
  console.log(`  ✓ favicon-32.png`)

  console.log("\nDone. Icons generated in public/icons/")
}

generateIcons()
