"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { UsersManagement } from "@/components/admin/users-management";
import { Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Vérifier si le token (cookie) et l'user (storage) existent
    const hasToken = document.cookie.includes("token=");
    const userStr = localStorage.getItem("user");

    if (!hasToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);

      // 2. Vérifier si l'utilisateur a le rôle Admin
      // On vérifie les deux cas possibles (Majuscule ou minuscule selon ton API)
      if (!userData.IsAdmin && !userData.isAdmin) {
        // Connecté mais pas admin -> On renvoie au dashboard utilisateur
        router.push("/dashboard");
        return;
      }

      setAdmin(userData);
      setIsLoading(false);
    } catch (e) {
      // Si les données locales sont corrompues, on nettoie et on redirige
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

  if (!admin) return null;

  return (
    <AdminLayout admin={admin}>
      <UsersManagement />
    </AdminLayout>
  );
}
