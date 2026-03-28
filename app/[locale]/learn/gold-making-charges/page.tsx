import type { Metadata } from "next"
import { ArticleLayout, Section, P, Callout, ToolCTA, DataTable } from "@/components/articles/article-layout"

export const metadata: Metadata = {
  title: "Gold Making Charges Explained — What's Fair in 2026",
  description: "Making charges on gold jewellery range from 8% to over 50%. Learn what's normal for rings, chains, bangles and necklaces using data from 6,600+ Australian products.",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Gold Making Charges Explained: What's Fair in Australia?",
  author: { "@type": "Organization", name: "Lustrumo", url: "https://lustrumo.com" },
  publisher: { "@type": "Organization", name: "Lustrumo", url: "https://lustrumo.com" },
  datePublished: "2026-03-28",
  dateModified: "2026-03-28",
  description: "Making charges on gold jewellery range from 8% to over 50%. Learn what's normal for rings, chains, bangles and necklaces using data from 6,600+ Australian products.",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://lustrumo.com/au/learn/gold-making-charges" },
}

export default function GoldMakingChargesPage({ params }: { params: { locale: string } }) {
  const prefix = `/${params.locale}`

  return (
    <ArticleLayout
      title="Gold Making Charges Explained: What's Fair in Australia?"
      category="Gold Buying"
      readTime="8 min"
      publishedDate="March 2026"
      jsonLd={jsonLd}
    >
      <Section id="what-are-making-charges" title="What are making charges?">
        <P>
          When you buy a gold chain, ring, or bangle, you are paying for two things: the gold itself and the work that went
          into turning raw gold into jewellery. The second part — the labour, design, overhead, and profit margin — is called
          the making charge.
        </P>
        <P>
          The making charge is the difference between the gold&apos;s melt value (what the raw gold is worth at today&apos;s
          spot price) and the retail price you pay. It is usually expressed as a percentage above the melt value.
        </P>
        <P>
          For example, if a 22K gold chain weighs 10 grams and 24K gold is trading at $135 per gram, the gold content is
          worth 10 × 0.9167 × $135 = $1,237. If the retailer charges $1,600, the making charge is ($1,600 ÷ $1,237 − 1)
          × 100 = 29%.
        </P>
        <Callout>
          Making charges are not inherently bad — jewellers need to cover their costs and make a profit. The question is whether
          the making charge is reasonable for the type of piece you are buying. A machine-made chain should cost less to make
          than a hand-crafted necklace with gemstone settings.
        </Callout>
      </Section>

      <Section id="calculate-gold-value" title="How to calculate the gold value of any piece">
        <P>
          You can calculate the intrinsic gold value of any piece if you know three things: the weight in grams, the karat
          (purity), and the current gold spot price.
        </P>
        <P>
          <strong>Gold Value = Weight (grams) × Purity × Spot Price per gram</strong>
        </P>
        <DataTable
          headers={["Karat", "Purity", "Gold Content per 10g"]}
          rows={[
            ["9K", "37.5%", "3.75g pure gold"],
            ["14K", "58.5%", "5.85g pure gold"],
            ["18K", "75.0%", "7.50g pure gold"],
            ["22K", "91.7%", "9.17g pure gold"],
            ["24K", "99.9%", "9.99g pure gold"],
          ]}
        />
        <P>
          As of March 2026, the 24K gold spot price is approximately $135–$210 AUD per gram (it fluctuates daily). That means
          10 grams of 22K gold contains about $1,237–$1,925 worth of gold, depending on the day.
        </P>
        <ToolCTA
          title="Calculate your gold's value instantly"
          description="Enter karat and weight to see the intrinsic gold value at today's live spot price."
          href={`${prefix}/gold-calculator`}
          cta="Gold Calculator"
        />
      </Section>

      <Section id="whats-fair" title="What's a fair making charge?">
        <P>
          We analysed over 6,600 gold jewellery products from Australian retailers to answer this question. Here are the
          typical making charge ranges by jewellery type for plain gold pieces (no diamonds or gemstones):
        </P>
        <DataTable
          headers={["Jewellery Type", "Typical Range", "What's Reasonable"]}
          rows={[
            ["Machine-made chain", "15–30%", "Under 25% is good value"],
            ["Cast ring", "25–50%", "Under 40% is fair for a simple band"],
            ["Bangle / kada", "20–45%", "Under 35% for plain bangles"],
            ["Pendant / locket", "20–45%", "Under 35% for simple designs"],
            ["Earrings / studs", "25–55%", "Under 40% for plain gold studs"],
            ["Necklace (set)", "25–60%", "Under 45% for non-ornate sets"],
            ["Mangalsutra", "30–60%", "Under 50% for machine-made"],
            ["Handmade / custom", "50–150%+", "Justified for genuine handcraft"],
          ]}
        />
        <Callout>
          These ranges are for plain gold jewellery without diamonds or gemstones. If a piece contains diamonds, rubies, or other
          stones, the retail price will be significantly higher than the gold value — and the &quot;making charge&quot; will look
          inflated because it includes the stone value. Always ask the retailer for a breakdown: gold weight, stone details,
          and making charge separately.
        </Callout>
        <P>
          The wide ranges exist because design complexity varies enormously. A simple machine-stamped 22K bangle and a
          hand-engraved antique-finish bangle are different products even if they weigh the same. The craftsmanship justifies
          a higher making charge for the latter.
        </P>
      </Section>

      <Section id="why-high-charges" title="Why some pieces have higher making charges">
        <P>
          Several legitimate factors push making charges higher:
        </P>
        <P>
          <strong>Design complexity.</strong> A plain band ring costs less to make than a ring with filigree work, multiple stone
          settings, or a custom design. Hand-finishing and polishing add labour time.
        </P>
        <P>
          <strong>Lower karat weight.</strong> 9K and 14K gold jewellery tends to have higher percentage making charges because
          the gold content is lower in absolute terms. A 14K ring with a $200 gold value and $150 making charge has a 75% charge
          — but the dollar amount of the charge is modest.
        </P>
        <P>
          <strong>Brand premium.</strong> Branded retailers (Tiffany, Cartier, local premium brands) charge significant premiums
          for the brand name. This is a choice, not a deception, as long as the buyer understands what they are paying for.
        </P>
        <P>
          <strong>Gemstones and diamonds.</strong> Any gold piece with stones will appear to have a very high making charge
          if you only compare the retail price to the gold value. The stone value is a separate component. Our Gold Calculator
          flags pieces with diamonds and gemstones so you can account for this.
        </P>
      </Section>

      <Section id="red-flags" title="Red flags: when a making charge is too high">
        <P>
          Watch out for these warning signs:
        </P>
        <P>
          <strong>No weight disclosure.</strong> If a retailer will not tell you the gram weight of a gold piece, they may
          be hiding a high making charge. Australian consumer law requires retailers to provide accurate product information
          on request.
        </P>
        <P>
          <strong>Making charge over 60% on machine-made pieces.</strong> A plain machine-made chain or bangle with a making
          charge above 60% is outside the normal range. It is not necessarily a scam — the retailer may have higher overheads —
          but you can almost certainly find the same piece cheaper elsewhere.
        </P>
        <P>
          <strong>&quot;Discounted from&quot; pricing.</strong> Some retailers inflate a fictional original price and then show
          a &quot;discount.&quot; A $5,000 bangle &quot;reduced to $2,500&quot; may never have been worth $5,000. Focus on the
          actual price relative to the gold value, not the size of the discount.
        </P>
        <P>
          <strong>No hallmark.</strong> Gold jewellery should carry a hallmark stamped into the metal (e.g. 750 for 18K,
          916 for 22K, 375 for 9K). If there is no hallmark, ask why and consider having the piece independently tested.
        </P>
      </Section>

      <Section id="how-to-negotiate" title="How to negotiate making charges">
        <P>
          Making charges are often negotiable, especially at independent jewellers and South Asian gold shops. Here is how
          to approach it:
        </P>
        <P>
          <strong>1. Ask for the gold weight.</strong> Before discussing price, ask: &quot;What is the gram weight of this piece?&quot;
          A reputable jeweller will tell you without hesitation.
        </P>
        <P>
          <strong>2. Calculate the melt value.</strong> Use the Lustrumo Gold Calculator to calculate the gold value at today&apos;s
          spot price. Now you know the baseline.
        </P>
        <P>
          <strong>3. Ask for the making charge separately.</strong> Say: &quot;I can see the gold value is approximately $X. What
          is your making charge on this piece?&quot; This shows you are informed and anchors the negotiation to the gold value.
        </P>
        <P>
          <strong>4. Compare across retailers.</strong> Check the Lustrumo Gold Prices page to see what other retailers charge
          for similar pieces. If one store charges 45% and another charges 25%, you have leverage.
        </P>
        <P>
          <strong>5. Consider buying gold separately from making.</strong> Some traditional jewellers will sell you the gold at
          near-spot and quote the making charge as a flat fee. This is often the most transparent pricing model.
        </P>
        <ToolCTA
          title="Compare gold prices across retailers"
          description="See making charge analysis for thousands of gold products from Australian jewellers."
          href={`${prefix}/gold-prices`}
          cta="Gold Prices"
        />
      </Section>

      <Section id="tools" title="Tools to help you">
        <P>
          Lustrumo provides three free tools specifically designed for gold buyers:
        </P>
        <ToolCTA
          title="Gold Price Calculator"
          description="Enter karat and weight to instantly calculate gold melt value and fair retail range."
          href={`${prefix}/gold-calculator`}
          cta="Calculate Gold Value"
        />
        <ToolCTA
          title="Gold Prices & Making Charge Analysis"
          description="Live spot prices and making charge data across thousands of products from Australian retailers."
          href={`${prefix}/gold-prices`}
          cta="View Gold Prices"
        />
        <ToolCTA
          title="Deal Checker"
          description="Paste any product URL for an instant gold valuation with making charge assessment."
          href={`${prefix}/deal-check`}
          cta="Check a Deal"
        />
      </Section>
    </ArticleLayout>
  )
}
