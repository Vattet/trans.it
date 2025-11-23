"use client"

import { Shield, Zap, Lock, Users, BarChart3, Settings } from "lucide-react"
import { useLanguage } from "@/lib/use-language"
import { t } from "@/lib/translations"

export function FeaturesSection() {
  const { language } = useLanguage()

  const features = [
    {
      icon: Zap,
      titleKey: "lightningFast",
      descKey: "lightningFastDesc",
    },
    {
      icon: Shield,
      titleKey: "secureByDefault",
      descKey: "secureByDefaultDesc",
    },
    {
      icon: Lock,
      titleKey: "passwordProtected",
      descKey: "passwordProtectedDesc",
    },
    {
      icon: Users,
      titleKey: "multipleRecipients",
      descKey: "multipleRecipientsDesc",
    },
    {
      icon: BarChart3,
      titleKey: "transferTracking",
      descKey: "transferTrackingDesc",
    },
    {
      icon: Settings,
      titleKey: "customizable",
      descKey: "customizableDesc",
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("everythingYouNeed", language)}</h2>
          <p className="text-muted-foreground">{t("powerfulFeatures", language)}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.titleKey}
                className="p-6 border border-border rounded-lg hover:border-primary/50 transition"
              >
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{t(feature.titleKey as any, language)}</h3>
                <p className="text-sm text-muted-foreground">{t(feature.descKey as any, language)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
