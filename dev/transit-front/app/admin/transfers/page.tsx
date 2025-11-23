"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { TransfersManagement } from "@/components/admin/transfers-management";
import { Loader2 } from "lucide-react";

export default function AdminTransfersPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Vérifier la présence du token et de l'user
    const hasToken = document.cookie.includes("token=");
    const userStr = localStorage.getItem("user");

    if (!hasToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);

      // 2. Vérifier les droits d'admin
      // On accepte IsAdmin (Laravel standard) ou isAdmin (JS standard)
      if (!userData.IsAdmin && !userData.isAdmin) {
        router.push("/dashboard");
        return;
      }

      setAdmin(userData);
      setIsLoading(false);
    } catch (e) {
      // Si les données locales sont corrompues
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
      <TransfersManagement />
    </AdminLayout>
  );
}
