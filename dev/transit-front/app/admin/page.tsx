"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Vérification de la session (Token dans les cookies)
    const hasToken = document.cookie.includes("token=");

    // 2. Récupération de l'utilisateur connecté
    const userStr = localStorage.getItem("user");

    // Si pas de token ou pas d'infos utilisateur -> Login
    if (!hasToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);

      // 3. Vérification des droits d'Admin
      // On vérifie IsAdmin (convention Laravel souvent utilisée) ou isAdmin (convention JS)
      if (!userData.IsAdmin && !userData.isAdmin) {
        // L'utilisateur est connecté mais n'est PAS admin -> Dashboard classique
        router.push("/dashboard");
        return;
      }

      setAdmin(userData);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lecture admin", error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <AdminLayout admin={admin}>
      <AdminDashboard admin={admin} />
    </AdminLayout>
  );
}
