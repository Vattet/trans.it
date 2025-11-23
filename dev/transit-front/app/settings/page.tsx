"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  // On sépare Nom et Prénom car ton API les sépare
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false) // Pour l'état du bouton sauvegarde
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // 1. Chargement des données au démarrage
  useEffect(() => {
    // Vérification du cookie token
    const hasToken = document.cookie.includes("token=")
    const userStr = localStorage.getItem("user")

    if (!hasToken || !userStr) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
      
      setFormData({
        nom: userData.Nom || "",       
        prenom: userData.Prenom || "",
        email: userData.Email || "",
      })
      setIsLoading(false)
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 2. Sauvegarde vers l'API (Backend)
  const handleSave = async () => {
    setError("")
    setSaved(false)
    setIsSaving(true)

    // Récupérer le token
    const tokenMatch = document.cookie.match(new RegExp("(^| )token=([^;]+)"))
    const token = tokenMatch ? tokenMatch[2] : null

    try {
      // Remplace par la bonne route API (ex: PUT /api/users/6)
      const res = await fetch(`http://localhost:8000/api/users/${user.ID}`, {
        method: "PUT", // ou PATCH selon ton backend
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          Nom: formData.nom,
          Prenom: formData.prenom,
          Email: formData.email, // Souvent l'email ne peut pas être changé, à voir avec ton backend
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour")
      }

      // 3. Mise à jour réussie : On met à jour le localStorage
      // On fusionne les anciennes données avec les nouvelles pour garder l'ID, etc.
      const updatedUser = { ...user, Nom: formData.nom, Prenom: formData.prenom, Email: formData.email }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Feedback visuel
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile Information</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input 
                  id="prenom" 
                  name="prenom" 
                  value={formData.prenom} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input 
                  id="nom" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                // Si l'email n'est pas modifiable, ajoute "disabled" ci-dessous
                // disabled 
                className="bg-muted/50" 
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            {saved && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-600">
                Changes saved successfully!
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}