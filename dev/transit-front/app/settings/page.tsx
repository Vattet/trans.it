"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Profile form state
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
  });

  // User params state
  // Note: userParams contient l'objet complet reçu de l'API
  const [userParams, setUserParams] = useState<any>(null);
  const [loadingParams, setLoadingParams] = useState(true);
  const [savingParams, setSavingParams] = useState(false);

  // Profile loading/saving state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [savedParams, setSavedParams] = useState(false); // Nouveau state pour le feedback vert

  // Helper pour récupérer le token
  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  // -------------------------------
  //   1) CHARGEMENT INITIAL
  // -------------------------------
  useEffect(() => {
    const hasToken = document.cookie.includes("token=");
    const userStr = localStorage.getItem("user");

    if (!hasToken || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Initialisation du formulaire Profil
      setFormData({
        nom: userData.Nom || "",
        prenom: userData.Prenom || "",
        email: userData.Email || "",
      });

      // Chargement des paramètres
      loadUserParams(userData.ID);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  }, [router]);

  // -------------------------------
  //   2) CHARGER LES PARAMÈTRES
  // -------------------------------
  const loadUserParams = async (userId: number) => {
    const token = getToken();
    setLoadingParams(true);

    try {
      // Route : Route::get('/api/users/{id}/params', ...)
      const res = await fetch(
        `http://localhost:8000/api/users/${userId}/params`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Si data est vide ou null, userParams restera null (ce qui déclenchera le POST plus tard)
        setUserParams(data);
      } else {
        // Si 404, c'est normal, l'utilisateur n'a pas encore de params
        setUserParams(null);
      }
    } catch (err) {
      console.error("Erreur chargement params:", err);
      setUserParams(null);
    } finally {
      setLoadingParams(false);
    }
  };

  // -------------------------------
  //   3) SAUVEGARDER LE PROFIL
  // -------------------------------
  const handleSaveProfile = async () => {
    setError("");
    setIsSaving(true);
    const token = getToken();

    try {
      // Route : Route::put('/api/users/{id}', ...)
      const res = await fetch(`http://localhost:8000/api/users/${user.ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          Nom: formData.nom,
          Prenom: formData.prenom,
          Email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Échec de la mise à jour du profil");

      // Mise à jour locale
      const updatedUser = {
        ...user,
        Nom: formData.nom,
        Prenom: formData.prenom,
        Email: formData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------
  //   4) SAUVEGARDER LES PARAMÈTRES (CORRIGÉ & ROBUSTE)
  // -------------------------------
  const saveUserParams = async () => {
    setSavingParams(true);
    setError(""); // Reset des erreurs précédentes
    const token = getToken();

    // Valeurs par défaut sécurisées
    const notif = userParams?.Notification_Mail ?? false;
    const lang = userParams?.Langue ?? "fr";

    try {
      // ON UTILISE TOUJOURS LA ROUTE "STORE" (POST)
      // Grâce au backend "updateOrCreate", ça marchera même si ça existe déjà.
      const endpoint = "http://localhost:8000/api/user-params";

      const payload = {
        Id_User: user.ID, // Indispensable pour la recherche/création
        Notification_Mail: notif ? 1 : 0, // Conversion boolean -> int pour Laravel
        Langue: lang,
      };

      // --- DEBUG LOGS ---
      console.log("--- TENTATIVE SAUVEGARDE PARAMÈTRES ---");
      console.log("URL:", endpoint);
      console.log("Données envoyées:", payload);

      const res = await fetch(endpoint, {
        method: "POST", // Toujours POST car le backend gère l'update si existant
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERREUR BACKEND:", data);
        throw new Error(data.message || "Erreur serveur lors de la sauvegarde");
      }

      // Succès
      console.log("Succès:", data);
      setUserParams(data);
      setSavedParams(true);
      setTimeout(() => setSavedParams(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingParams(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* ---------------- PROFILE ---------------- */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile Information</h3>

          {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                "Save Profile Changes"
              )}
            </Button>

            {saved && (
              <p className="text-green-600 text-sm text-center">
                Profile saved successfully!
              </p>
            )}
          </div>
        </Card>

        {/* ---------------- USER PARAMS ---------------- */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Preferences</h3>

          {loadingParams ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notification Mail */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about your activity.
                  </p>
                </div>
                <Switch
                  // Conversion explicite du booléen (parfois 1/0 en BDD)
                  checked={Boolean(userParams?.Notification_Mail)}
                  onCheckedChange={(val) =>
                    setUserParams((prev: any) => ({
                      ...prev,
                      Notification_Mail: val, // Mise à jour optimiste
                    }))
                  }
                />
              </div>

              {/* Langue */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={userParams?.Langue || "fr"}
                  onValueChange={(val) =>
                    setUserParams((prev: any) => ({ ...prev, Langue: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={saveUserParams}
                disabled={savingParams}
                variant="outline"
                className="w-full"
              >
                {savingParams ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  "Save Preferences"
                )}
              </Button>

              {/* FEEDBACK VERT POUR LES PARAMÈTRES */}
              {savedParams && (
                <p className="text-green-600 text-sm text-center font-medium">
                  Preferences saved successfully!
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
