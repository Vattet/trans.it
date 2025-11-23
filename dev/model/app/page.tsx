"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/use-language"
import { t } from "@/lib/translations"

export default function Home() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg">Tranz.it</span>
          </div>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-foreground hover:text-primary transition">
              {t("login", language)}
            </Link>
            <Link href="/register">
              <Button>{t("getStarted", language)}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <section className="border-t border-border py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("readyToShare", language)}</h2>
          <p className="text-muted-foreground mb-8">{t("startSendingFiles", language)}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">{t("createAccount", language)}</Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline">
                {t("sendFileAnon", language)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t("footer", language)}</p>
        </div>
      </footer>
    </div>
  )
}
