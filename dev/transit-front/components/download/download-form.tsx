"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

  // compteur dynamique
  const [downloadCount, setDownloadCount] = useState<number>(
    transfer.lien?.Nb_Acces ?? transfer.downloadCount ?? 0
  );

  // --- FETCH LIVE STATS ---
  const refreshStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/public/links/${transfer.code}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data?.link?.Nb_Acces !== undefined) {
        setDownloadCount(data.link.Nb_Acces);
      }
    } catch (err) {
      console.error("Erreur refresh stats :", err);
    }
  };

  // --- REFRESH AU MOUNT (FIABILITÉ) ---
  useEffect(() => {
    refreshStats();
  }, []);

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    setError("");

    const url = new URL(
      `http://localhost:8000/public/download/${transfer.code}`
    );

    if (password) url.searchParams.append("password", password);

    // OUVERTURE DU FICHIER
    window.open(url.toString(), "_blank");

    // Petit délai pour laisser le backend mettre à jour Nb_Acces
    setTimeout(async () => {
      await refreshStats(); // Mise à jour garantie
      setIsDownloading(false);
    }, 1500);
  };

  const totalSizeMB = (transfer.files[0].size / (1024 * 1024)).toFixed(2);

  return (
    <form onSubmit={handleDownload} className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ready to Download</h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {transfer.sender}
            </span>{" "}
            shared a file with you.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* FILE DETAILS */}
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

        {/* STATS */}
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

        {/* PASSWORD */}
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

        {/* DOWNLOAD BUTTON */}
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
