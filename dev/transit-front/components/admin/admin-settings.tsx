"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Save } from "lucide-react";

interface AdminSettingsProps {
  admin?: any;
}

export function AdminSettings({ admin }: AdminSettingsProps) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    maxFileSize: 2,
    defaultExpiration: 7,
    platformName: "Tranz.it",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Helper pour récupérer le token
  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "platformName" ? value : Number.parseInt(value),
    }));
  };

  // 1. Sauvegarder les réglages (Nécessite une route API /api/settings côté Laravel)
  const handleSave = async () => {
    setIsSaving(true);
    const token = getToken();

    try {
      // Simulation d'appel API (à décommenter quand tu auras créé la route Laravel)
      /*
        const res = await fetch("http://localhost:8000/api/settings", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error("Erreur sauvegarde");
        */

      // Pour l'instant on simule le succès
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Supprimer tous les transferts (Danger Zone)
  const handleClearTransfers = async () => {
    if (
      !confirm(
        "Are you sure? This will delete ALL transfers from the database."
      )
    )
      return;

    setIsLoading(true);
    const token = getToken();

    try {
      // Tu devras créer cette route dans Laravel: Route::delete('/admin/transfers/all', ...)
      const res = await fetch("http://localhost:8000/api/admin/transfers/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        alert(
          "Route API non trouvée. Veuillez créer 'DELETE /api/admin/transfers/all' dans Laravel."
        );
        return;
      }

      if (!res.ok) throw new Error("Failed to delete");
      alert("All transfers have been deleted.");
    } catch (error) {
      console.error(error);
      alert("Erreur serveur ou permission refusée.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Supprimer tous les utilisateurs (Danger Zone)
  const handleDeleteUsers = async () => {
    const confirmMessage =
      "WARNING: This will delete ALL users except you. Are you sure?";
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    const token = getToken();

    try {
      // Tu devras créer cette route dans Laravel: Route::delete('/admin/users/all', ...)
      const res = await fetch("http://localhost:8000/api/admin/users/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        alert(
          "Route API non trouvée. Veuillez créer 'DELETE /api/admin/users/all' dans Laravel."
        );
        return;
      }

      if (!res.ok) throw new Error("Failed to delete");

      alert("All users deleted.");
      // Optionnel : logout forcé
      // window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Erreur serveur ou permission refusée.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and limits
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                name="platformName"
                value={settings.platformName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (GB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultExpiration">
                Default Expiration (Days)
              </Label>
              <Input
                id="defaultExpiration"
                type="number"
                name="defaultExpiration"
                value={settings.defaultExpiration}
                onChange={handleChange}
                min="1"
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>

            {saved && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-600">
                Settings saved successfully!
              </div>
            )}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Danger Zone
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these actions with caution. They perform irreversible actions
              on the database.
            </p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleClearTransfers}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Clear All Transfers (Database)"
              )}
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteUsers}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete All Users (Database)"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
