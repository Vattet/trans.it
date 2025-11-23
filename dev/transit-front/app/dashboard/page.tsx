"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Assure-toi que ces imports pointent vers tes vrais fichiers
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TransfersList } from "@/components/dashboard/transfers-list" 
import { QuickUpload } from "@/components/dashboard/quick-upload"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Vérifier si le cookie "token" existe
    // (Simple vérification de présence pour le front)
    const hasToken = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    // 2. Récupérer l'utilisateur stocké par le Login
    const userStr = localStorage.getItem("user");

    // Si pas de token OU pas d'user -> Dehors !
    if (!hasToken || !userStr) {
      // Note: Si ta page de login est "/", mets "/" ici. Si c'est "/login", mets "/login"
      router.push("/"); 
      return;
    }

    try {
      // 3. Charger les données
      const userData = JSON.parse(userStr);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      // Si le JSON est corrompu, on nettoie et on redirige
      console.error("Erreur lecture user", error);
      localStorage.removeItem("user");
      router.push("/");
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Chargement du dashboard...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {/* J'ai mis user?.Prenom car ton API renvoie "Prenom", pas "name" */}
          <p className="text-muted-foreground">Welcome back, {user?.Prenom} !</p>
        </div>

        {/* Tes composants existants */}
        <QuickUpload />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Files Transferred</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Downloads</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <p className="text-3xl font-bold">0 MB</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Active Transfers</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        <TransfersList />
      </div>
    </DashboardLayout>
  )
}