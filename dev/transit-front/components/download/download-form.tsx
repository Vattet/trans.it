"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Lock, FileIcon, Loader2, AlertCircle } from "lucide-react";

interface DownloadFormProps {
  transfer: any;
  transferId: string;
}

export function DownloadForm({ transfer, transferId }: DownloadFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    setError("");

    try {
      // 1. CONSTRUCTION DE L'URL (GET)
      // Attention : Assure-toi que c'est bien "/api/public" si ta route est dans api.php
      const baseUrl = `http://localhost:8000/public/download/${transfer.code}`;
      const url = new URL(baseUrl);

      // Si un mot de passe est saisi, on l'ajoute dans l'URL (?password=xyz)
      if (password) {
        url.searchParams.append("password", password);
      }

      // 2. APPEL À L'API (GET)
      const response = await fetch(url.toString(), {
        method: "GET", // <--- CHANGEMENT ICI
        // Pas de body ni de headers spécifiques nécessaires pour un GET simple
      });

      if (response.status === 403) {
        throw new Error("Lien expiré ou mot de passe incorrect");
      }
      if (response.status === 404) {
        throw new Error("Fichier introuvable sur le serveur");
      }
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      // 3. RÉCUPÉRATION DU FICHIER (BLOB)
      const blob = await response.blob();

      // 4. DÉCLENCHEMENT DU TÉLÉCHARGEMENT NAVIGATEUR
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const fileName = transfer.files[0]?.name || "downloaded-file";
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      // Nettoyage
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsDownloading(false);
    }
  };

  const totalSizeMB = (transfer.files[0].size / (1024 * 1024)).toFixed(2);

  return (
    <form onSubmit={handleDownload} className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ready to Download</h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {transfer.sender}
            </span>{" "}
            shared a file with you.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Files ({transfer.files.length})</Label>
          <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
              <FileIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{transfer.files[0].name}</p>
              <p className="text-sm text-muted-foreground">{totalSizeMB} MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-background border border-border rounded-lg text-sm">
          <div>
            <p className="text-muted-foreground">Downloads</p>
            <p className="font-semibold">{transfer.downloadCount || 0} times</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expires on</p>
            <p className="font-semibold">
              {new Date(transfer.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {transfer.password && (
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full gap-2"
          size="lg"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download File
            </>
          )}
        </Button>
      </div>
    </form>
  );
}