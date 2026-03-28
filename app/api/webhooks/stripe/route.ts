import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 })
  }

  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature"
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const productType = session.metadata?.product_type || "unknown"
    const customerEmail = session.customer_details?.email || null

    const supabase = createServiceClient()

    if (supabase) {
      if (productType === "annual_membership") {
        // Update user profile membership tier
        if (customerEmail) {
          await supabase
            .from("profiles")
            .update({ membership_tier: "annual" })
            .eq("email", customerEmail)
        }

        // Also log in report_orders for record
        await supabase.from("report_orders").insert({
          email: customerEmail,
          report_type: productType,
          stripe_session_id: session.id,
          amount: session.amount_total ? session.amount_total / 100 : null,
          currency: session.currency?.toUpperCase() || "AUD",
          status: "completed",
        })
      } else {
        // One-time report purchase
        await supabase.from("report_orders").insert({
          email: customerEmail,
          report_type: productType,
          stripe_session_id: session.id,
          amount: session.amount_total ? session.amount_total / 100 : null,
          currency: session.currency?.toUpperCase() || "AUD",
          status: "pending_delivery",
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
