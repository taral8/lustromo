export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Last updated: March 2026</p>

      <div className="mt-8 space-y-8">
        <Section title="1. Overview">
          Lustrumo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the lustrumo.com.au website and related
          tools. This Privacy Policy explains how we collect, use, and protect your personal
          information in accordance with the Australian Privacy Act 1988 and the Australian
          Privacy Principles (APPs).
        </Section>

        <Section title="2. Information We Collect">
          <strong>Information you provide:</strong> When you use our contact form, subscribe to
          email alerts, or create an account, we collect your name, email address, and any
          message content you submit.
          {"\n\n"}
          <strong>Automatically collected:</strong> We collect standard web analytics data
          including pages visited, time on site, browser type, and approximate location
          (country/state level). We do not use this data to identify individuals.
          {"\n\n"}
          <strong>Deal Checker data:</strong> When you submit a URL to our Deal Checker tool,
          we fetch the publicly available product page to extract pricing and specification data.
          We do not store the URLs you submit beyond the current session unless you create an account.
        </Section>

        <Section title="3. How We Use Your Information">
          We use collected information to:
          {"\n\n"}
          • Provide and improve our jewellery intelligence tools
          {"\n"}• Send price alerts and market updates (if you subscribe)
          {"\n"}• Respond to enquiries submitted via our contact form
          {"\n"}• Generate aggregate market analytics (no individual data is shared)
          {"\n"}• Maintain platform security and prevent abuse
        </Section>

        <Section title="4. Data Sharing">
          We do not sell your personal information. We may share data with:
          {"\n\n"}
          • <strong>Supabase</strong> (database hosting — data stored in Australia/US regions)
          {"\n"}• <strong>Vercel</strong> (website hosting)
          {"\n"}• <strong>Analytics providers</strong> (aggregate, anonymised data only)
          {"\n\n"}
          We do not share personal data with jewellery retailers or any third party for
          marketing purposes.
        </Section>

        <Section title="5. Cookies">
          We use essential cookies for site functionality (session management, locale preferences).
          We use analytics cookies to understand how our tools are used. You can disable
          non-essential cookies in your browser settings without affecting core tool functionality.
        </Section>

        <Section title="6. Data Retention">
          Contact form submissions are retained for 12 months. Email subscriptions are retained
          until you unsubscribe. Analytics data is retained in aggregate form indefinitely.
          Account data is retained until you request deletion.
        </Section>

        <Section title="7. Your Rights">
          Under the Australian Privacy Act, you have the right to:
          {"\n\n"}
          • Access the personal information we hold about you
          {"\n"}• Request correction of inaccurate information
          {"\n"}• Request deletion of your personal information
          {"\n"}• Unsubscribe from marketing communications at any time
          {"\n\n"}
          To exercise these rights, contact us at privacy@lustrumo.com.au.
        </Section>

        <Section title="8. Security">
          We use industry-standard security measures including encrypted connections (HTTPS),
          secure database access controls, and row-level security policies. We do not store
          payment information — all payments are processed by Stripe.
        </Section>

        <Section title="9. Contact">
          For privacy-related enquiries:{"\n\n"}
          Email: privacy@lustrumo.com.au{"\n"}
          Lustrumo{"\n"}
          Australia
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
