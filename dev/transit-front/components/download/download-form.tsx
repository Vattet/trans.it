"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Lock,
  FileIcon,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

interface DownloadFormProps {
  transfer: any;
  transferId: string;
}

export function DownloadForm({ transfer, transferId }: DownloadFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [downloadCount, setDownloadCount] = useState<number>(
    transfer.downloadCount || 0
  );

  // 1. VÉRIFICATION DE L'EXPIRATION
  const isExpired = new Date(transfer.expiresAt) < new Date();

  // 2. GESTION DU TÉLÉCHARGEMENT AVEC VÉRIFICATION MDP
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Si un mot de passe est requis mais vide
    if (transfer.isPasswordProtected && !password) {
      setError("Veuillez entrer le mot de passe pour télécharger ce fichier.");
      return;
    }

    setIsDownloading(true);

    try {
      // Construction de l'URL
      const url = new URL(
        `http://localhost:8000/public/download/${transfer.code}`
      );
      if (password) url.searchParams.append("password", password);

      // Appel API (GET)
      const response = await fetch(url.toString(), { method: "GET" });

      // Gestion des erreurs spécifiques du Backend
      if (response.status === 403) {
        throw new Error("Mot de passe incorrect ou lien expiré.");
      }
      if (response.status === 404) {
        throw new Error("Le fichier physique est introuvable sur le serveur.");
      }
      if (!response.ok) {
        throw new Error("Erreur inconnue lors du téléchargement.");
      }

      // Si tout est OK, on récupère le fichier (Blob)
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // On déclenche le téléchargement navigateur
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = transfer.files[0]?.name || "downloaded-file";
      document.body.appendChild(a);
      a.click();

      // Nettoyage
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      // Mise à jour du compteur visuel (+1)
      setDownloadCount((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsDownloading(false);
    }
  };

  const totalSizeMB = (transfer.files[0].size / (1024 * 1024)).toFixed(2);

  // --- CAS 1 : FICHIER EXPIRÉ (BLOQUÉ) ---
  if (isExpired) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-destructive/50 rounded-lg p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-destructive">
              Transfert Expiré
            </h1>
            <p className="text-muted-foreground mt-2">
              Ce fichier n'est plus disponible car la date d'expiration est
              passée.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Date limite : {new Date(transfer.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- CAS 2 : FICHIER DISPONIBLE ---
  return (
    <form onSubmit={handleDownload} className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 space-y-6 shadow-sm">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ready to Download</h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {transfer.sender}
            </span>{" "}
            shared a file with you.
          </p>
        </div>

        {/* Message d'erreur (ex: mauvais mot de passe) */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Infos du fichier */}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background border border-border rounded-lg text-sm">
          <div>
            <p className="text-muted-foreground">Downloads</p>
            <p className="font-semibold">{downloadCount} times</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expires on</p>
            <p className="font-semibold">
              {new Date(transfer.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CHAMP MOT DE PASSE (Si protégé) */}
        {transfer.isPasswordProtected && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              <Lock className="w-4 h-4" />
              Password Required
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter file password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-destructive" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              The sender has protected this file with a password.
            </p>
          </div>
        )}

        {/* BOUTON DOWNLOAD */}
        <Button
          type="submit"
          className="w-full gap-2"
          size="lg"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying &
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {transfer.isPasswordProtected
                ? "Unlock & Download"
                : "Download File"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
