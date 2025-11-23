"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/lib/use-language";
import { t } from "@/lib/translations";

export function HeroSection() {
  const { language } = useLanguage();

  // États pour gérer l'affichage conditionnel
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérification de la présence du token et de l'user
    const hasToken = document.cookie.includes("token=");
    const hasUser = localStorage.getItem("user");

    if (hasToken && hasUser) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  return (
    <section className="py-20 md:py-32 px-4 fade-in">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-3 py-1 bg-secondary/50 border border-border rounded-full mb-6 slide-up">
          <span className="text-sm font-medium">
            {t("heroTitle", language)}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance slide-up">
          {t("heroSubtitle", language).split(",")[0]}{" "}
          <span className="text-primary">
            {t("heroSubtitle", language).split(",")[1]}
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl mx-auto slide-up">
          {t("heroDescription", language)}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 slide-up">
          {/* BOUTON PRINCIPAL DYNAMIQUE */}
          {!isLoading &&
            (isLoggedIn ? (
              // Cas Connecté
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              // Cas Public
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  {t("startSharing", language)}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ))}

          {/* BOUTON SECONDAIRE (Toujours accessible) */}
          <Link href="/upload">
            <Button size="lg" variant="outline">
              {t("tryNow", language)}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto slide-up">
          <div>
            <p className="text-2xl font-bold text-primary">2GB</p>
            <p className="text-xs text-muted-foreground">
              {t("maxFileSize", language)}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">256-bit</p>
            <p className="text-xs text-muted-foreground">
              {t("encryption", language)}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              7 {t("oneDay", language).split(" ")[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("fileRetention", language)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
