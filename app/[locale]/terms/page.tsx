import Link from "next/link"

export default function TermsPage({ params }: { params: { locale: string } }) {
  const prefix = `/${params.locale}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
        Terms of Service
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Last updated: March 2026</p>

      <div className="mt-8 space-y-8">
        <Section title="1. Acceptance of Terms">
          By accessing or using Lustrumo (lustrumo.com.au), you agree to be bound by these Terms
          of Service. If you do not agree, do not use the platform. We may update these terms at
          any time — continued use after changes constitutes acceptance.
        </Section>

        <Section title="2. Description of Service">
          Lustrumo is a jewellery intelligence platform that provides diamond price tracking, gold
          valuations, certification verification, and retailer ratings. Our tools are designed to
          help consumers make informed purchasing decisions. Lustrumo is not a jewellery retailer
          and does not sell diamonds, gold, or any jewellery products.
        </Section>

        <Section title="3. Information Accuracy">
          Lustrumo fair value estimates are based on current diamond market data, live gold spot
          prices, and indicative setting costs. Estimates reflect the assessed intrinsic and market
          value of the specific diamond grade, metal type, and setting style.
          {"\n\n"}
          <strong>Estimates do not account for:</strong>
          {"\n"}• Brand premiums or retailer-specific pricing strategies
          {"\n"}• Bespoke craftsmanship or custom design charges
          {"\n"}• Resale value or investment returns
          {"\n"}• Insurance or replacement value
          {"\n\n"}
          All data is provided on an &quot;as is&quot; basis. While we strive for accuracy, we do
          not guarantee that prices, ratings, or comparisons are error-free. Always verify
          information independently before making a purchase.
        </Section>

        <Section title="4. Data Confidence Scores">
          Every comparison and valuation on Lustrumo includes a data confidence score (0–100).
          This score reflects the completeness and reliability of the underlying data. Results
          with a confidence score below 60 are flagged as indicative only. You should not rely
          solely on low-confidence estimates for purchasing decisions.
        </Section>

        <Section title="5. Retailer Ratings">
          Lustrumo rates retailers based on data completeness, pricing accuracy, certification
          compliance, and data recency. Ratings are generated algorithmically from publicly
          available product listing data. Lustrumo does not accept payment from retailers
          for favourable ratings.
          {"\n\n"}
          Retailers may contact us to request data corrections or dispute a rating. See our{" "}
          <Link href={`${prefix}/contact`} style={{ color: "var(--accent-primary)" }}>Contact page</Link> for
          retailer enquiries.
        </Section>

        <Section title="6. Certification Verification">
          Our Certification Verifier cross-references certificate numbers against publicly
          available retailer product data and provides links to official grading lab verification
          pages (GIA, IGI, HRD). Lustrumo does not independently verify the authenticity of
          grading reports. Always verify certificates directly with the issuing laboratory.
        </Section>

        <Section title="7. Affiliate Links & Commissions">
          Lustrumo may include links to retailer product pages. Some of these links may be
          affiliate links, meaning Lustrumo may earn a commission if you make a purchase.
          Affiliate relationships never affect our ratings, fair value estimates, or comparison
          results. Commission income is disclosed in our footer.
        </Section>

        <Section title="8. User Accounts">
          Some features may require account registration. You are responsible for maintaining
          the security of your account credentials. You must not share your account or use
          another person&apos;s account. We reserve the right to suspend or terminate accounts
          that violate these terms.
        </Section>

        <Section title="9. Prohibited Use">
          You may not:
          {"\n\n"}
          • Scrape, crawl, or systematically extract data from Lustrumo for commercial purposes
          {"\n"}• Use our tools to mislead consumers or misrepresent product values
          {"\n"}• Attempt to manipulate retailer ratings or data quality scores
          {"\n"}• Use the platform for any unlawful purpose
          {"\n"}• Interfere with the platform&apos;s operation or security
        </Section>

        <Section title="10. Intellectual Property">
          All content, tools, algorithms, and data presented on Lustrumo are the intellectual
          property of Lustrumo or its licensors. The Equivalent Value Class (EVC) methodology,
          retailer scoring system, and valuation algorithms are proprietary. You may not
          reproduce, distribute, or create derivative works without written permission.
        </Section>

        <Section title="11. Limitation of Liability">
          To the maximum extent permitted by Australian law, Lustrumo and its operators shall
          not be liable for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of the platform, including but not limited to financial
          losses from purchasing decisions made based on our estimates.
          {"\n\n"}
          Our total liability for any claim arising from these terms shall not exceed the amount
          you have paid to Lustrumo in the 12 months preceding the claim, or AUD $100,
          whichever is greater.
        </Section>

        <Section title="12. Australian Consumer Law">
          Nothing in these terms excludes, restricts, or modifies any consumer guarantee,
          right, or remedy conferred by the Australian Consumer Law (Schedule 2 of the
          Competition and Consumer Act 2010) that cannot be excluded, restricted, or modified
          by agreement.
        </Section>

        <Section title="13. Governing Law">
          These terms are governed by the laws of the State of Victoria, Australia. Any
          disputes shall be subject to the exclusive jurisdiction of the courts of Victoria.
        </Section>

        <Section title="14. Contact">
          For questions about these terms:
          {"\n\n"}
          Email: legal@lustrumo.com.au{"\n"}
          Or visit our <Link href={`${prefix}/contact`} style={{ color: "var(--accent-primary)" }}>Contact page</Link>.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      <div className="mt-3 whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  )
}
