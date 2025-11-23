"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Pour le logout
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/use-language";
import { t } from "@/lib/translations";
// Imports pour le header connecté
import { LogOut, Settings, Upload, LayoutDashboard } from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const router = useRouter();

  // État pour savoir si l'utilisateur est connecté
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Vérification de la connexion au chargement
  useEffect(() => {
    const hasToken = document.cookie.includes("token=");
    const hasUser = localStorage.getItem("user");

    if (hasToken && hasUser) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  // 2. Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    setIsLoggedIn(false); // On met à jour l'état local
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Dynamique */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                T
              </span>
            </div>
            <span className="font-bold text-lg">Tranz.it</span>
          </Link>

          {/* Navigation Conditionnelle */}
          {!isLoading && (
            <nav className="flex items-center gap-2">
              {isLoggedIn ? (
                // --- VERSION CONNECTÉ (Dashboard Header) ---
                <>
                  <Link href="/upload">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">New Transfer</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                // --- VERSION PUBLIC (Landing Header) ---
                <>
                  <div className="mr-2">
                    <LanguageSwitcher />
                  </div>
                  <Link
                    href="/login"
                    className="text-foreground hover:text-primary transition mr-4 hidden sm:block"
                  >
                    {t("login", language)}
                  </Link>
                  <Link href="/register">
                    <Button>{t("getStarted", language)}</Button>
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {/* Note: La HeroSection gère sa propre logique interne si tu as utilisé le code précédent, 
          sinon tu peux lui passer isLoggedIn en props */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section (Bas de page) */}
      <section className="border-t border-border py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t("readyToShare", language)}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("startSendingFiles", language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              // --- CAS CONNECTÉ ---
              <>
                <Link href="/upload">
                  <Button size="lg" className="gap-2">
                    <Upload className="w-4 h-4" /> New Transfer
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              // --- CAS NON CONNECTÉ ---
              <>
                <Link href="/register">
                  <Button size="lg">{t("createAccount", language)}</Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline">
                    {t("sendFileAnon", language)}
                  </Button>
                </Link>
              </>
            )}
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
  );
}
