"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TransfersList } from "@/components/dashboard/transfers-list";
import { QuickUpload } from "@/components/dashboard/quick-upload";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Nouvel état pour stocker les statistiques
  const [stats, setStats] = useState({
    filesTransferred: 0,
    totalDownloads: 0,
    storageUsed: "0",
    activeTransfers: 0,
  });

  // Helper pour récupérer le token
  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  useEffect(() => {
    // 1. Vérification Auth (inchangée)
    const hasToken = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("token="));
    const userStr = localStorage.getItem("user");

    if (!hasToken || !userStr) {
      router.push("/");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // 2. RÉCUPÉRATION DES DONNÉES POUR LES STATS
      const fetchStats = async () => {
        const token = getToken();
        try {
          // On utilise l'API existante qui récupère tous les docs de l'user
          const res = await fetch(
            `http://localhost:8000/api/users/${userData.ID}/documents`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (res.ok) {
            const documents = await res.json();

            // --- CALCULS DYNAMIQUES ---

            // 1. Nombre de fichiers
            const count = documents.length;

            // 2. Total Téléchargements (Somme des Nb_Acces dans la relation lien)
            const downloads = documents.reduce((acc: number, doc: any) => {
              return acc + (doc.lien?.Nb_Acces || 0);
            }, 0);

            // 3. Stockage utilisé (Somme des Tailles_MB)
            const storage = documents.reduce((acc: number, doc: any) => {
              return acc + parseFloat(doc.Tailles_MB || 0);
            }, 0);

            // 4. Transferts Actifs (Ceux qui sont marqués IsActive)
            const active = documents.filter((doc: any) => doc.IsActive).length;

            setStats({
              filesTransferred: count,
              totalDownloads: downloads,
              storageUsed: storage.toFixed(2), // On arrondit à 2 décimales
              activeTransfers: active,
            });
          }
        } catch (error) {
          console.error("Erreur chargement stats", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    } catch (error) {
      console.error("Erreur lecture user", error);
      localStorage.removeItem("user");
      router.push("/");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.Prenom} !
          </p>
        </div>

        <QuickUpload />

        {/* --- CARTES STATISTIQUES DYNAMIQUES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Files Transferred</p>
            <p className="text-3xl font-bold">{stats.filesTransferred}</p>
          </div>

          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Downloads</p>
            <p className="text-3xl font-bold">{stats.totalDownloads}</p>
          </div>

          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <p className="text-3xl font-bold">{stats.storageUsed} MB</p>
          </div>

          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Active Transfers</p>
            <p className="text-3xl font-bold">{stats.activeTransfers}</p>
          </div>
        </div>

        {/* Note: Si tu veux éviter de faire deux appels API (un ici et un dans TransfersList),
            tu pourrais passer la liste 'documents' récupérée ici en props à TransfersList */}
        <TransfersList />
      </div>
    </DashboardLayout>
  );
}
