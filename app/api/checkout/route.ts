import { NextRequest, NextResponse } from "next/server"
import { getStripe, STRIPE_PRICES, PRODUCT_META, type ProductType } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productType } = body as { productType: string }

    // Validate product type
    if (!productType || !(productType in STRIPE_PRICES)) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 })
    }

    const product = productType as ProductType
    const priceId = STRIPE_PRICES[product]
    const meta = PRODUCT_META[product]

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured. Set STRIPE_PRICE_* environment variables." },
        { status: 503 }
      )
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY environment variable." },
        { status: 503 }
      )
    }

    const origin = request.headers.get("origin") || "https://lustrumo.com"

    const session = await stripe.checkout.sessions.create({
      mode: meta.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/au/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/au/premium`,
      metadata: {
        product_type: product,
        product_name: meta.name,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
