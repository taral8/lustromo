import { notFound } from "next/navigation"
import { isValidLocale, type Locale } from "@/lib/locale"
import { LocaleProvider } from "@/lib/locale-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isValidLocale(params.locale)) {
    notFound()
  }

  return (
    <LocaleProvider locale={params.locale as Locale}>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer locale={params.locale} />
      <BottomNav />
    </LocaleProvider>
  )
}
