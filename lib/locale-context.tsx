"use client"

import { createContext, useContext } from "react"
import { type Locale, locales } from "./locale"

const LocaleContext = createContext<Locale>("au")

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useLocaleConfig() {
  const locale = useContext(LocaleContext)
  return locales[locale]
}
