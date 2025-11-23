"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSettings } from "@/components/admin/admin-settings";
import { Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Vérifier si le token est présent dans les cookies
    const hasToken = document.cookie.includes("token=");

    // 2. Récupérer l'utilisateur stocké
    const userStr = localStorage.getItem("user");

    if (!hasToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);

      if (!userData.IsAdmin && !userData.isAdmin) {
        router.push("/dashboard");
        return;
      }

      setAdmin(userData);
      setIsLoading(false);
    } catch (e) {
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

  return (
    <AdminLayout admin={admin}>
      <AdminSettings admin={admin} />
    </AdminLayout>
  );
}
