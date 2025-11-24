"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Copy, Check, AlertCircle, Loader2, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ANONYMOUS_USER_ID = "9"; // ID de l'utilisateur Anonyme en BDD

export function FileUploadForm({ user }: { user?: any }) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Options (Valeurs par défaut)
  const [transferPassword, setTransferPassword] = useState("");
  const [expirationDays, setExpirationDays] = useState("7");
  const [maxDownloads, setMaxDownloads] = useState("unlimited");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [transferLink, setTransferLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(Array.from(e.target.files || []));
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    const totalSize = [...files, ...newFiles].reduce(
      (acc, file) => acc + file.size,
      0
    );
    if (totalSize > MAX_FILE_SIZE) {
      setError("Total file size exceeds 2GB limit");
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    // Récupération fallback de l'utilisateur
    let currentUser = user;
    if (!currentUser && typeof localStorage !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setIsUploading(true);
    const token = getToken();

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const uniqueCode = Math.random().toString(36).substring(2, 9);
      const generatedUrl = `${window.location.origin}/download/${uniqueCode}`;

      const expirationDate = new Date();
      // Si l'utilisateur n'est pas connecté, on force 7 jours par défaut, sinon on prend son choix
      const daysToAdd = currentUser ? parseInt(expirationDays) : 7;
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("Nom_document", file.name);
        formData.append("Tailles_MB", (file.size / (1024 * 1024)).toFixed(4));
        formData.append("IsActive", "1");

        if (currentUser && currentUser.ID) {
          formData.append("Id_User", currentUser.ID);
        } else {
          formData.append("Id_User", ANONYMOUS_USER_ID);
        }

        const resDoc = await fetch("http://localhost:8000/api/documents", {
          method: "POST",
          headers: headers,
          body: formData,
        });

        if (!resDoc.ok) {
          const errData = await resDoc.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to upload ${file.name}`);
        }
        const docData = await resDoc.json();
        const docId = docData.document_id || docData.id;

        if (docId) {
          const linkBody = {
            Id_Doc: docId,
            Code_unique: uniqueCode,
            URL: generatedUrl,
            Nb_Acces: 0,
            isActive: true,
            Date_Expiration: expirationDate.toISOString(),
            // Ici on pourrait ajouter le mot de passe si le backend le supportait
          };

          await fetch("http://localhost:8000/api/links", {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(linkBody),
          });
        }
        return docData;
      });

      await Promise.all(uploadPromises);

      setTransferLink(generatedUrl);
      setUploadComplete(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transferLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (uploadComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Transfer Created!</h2>
            <p className="text-muted-foreground">
              Files uploaded successfully.
            </p>
          </div>
          <div className="bg-background p-4 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">Share this link:</p>
            <div className="flex items-center gap-2">
              <Input
                value={transferLink}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Expires on:{" "}
              {new Date(
                Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-3 pt-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([]);
                setUploadComplete(false);
                setTransferLink("");
              }}
            >
              Send Another
            </Button>
            {user && (
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Send Files</h1>
        <p className="text-muted-foreground">
          Upload your files and share instantly
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-base font-medium mb-1">
          Drag and drop files here or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:underline font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-muted-foreground">Max 2GB per transfer</p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <div className="bg-card border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-background rounded transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-destructive/10 rounded transition"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- AFFICHAGE CONDITIONNEL DES OPTIONS --- */}
      {user ? (
        // UTILISATEUR CONNECTÉ : Affiche les options
        <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
          <h3 className="font-semibold">Transfer Options</h3>

          <div className="space-y-2">
            <Label htmlFor="password">Password Protection (Optional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={transferPassword}
              onChange={(e) => setTransferPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Expires In</Label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger id="expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="downloads">Max Downloads</Label>
            <Select value={maxDownloads} onValueChange={setMaxDownloads}>
              <SelectTrigger id="downloads">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Download</SelectItem>
                <SelectItem value="5">5 Downloads</SelectItem>
                <SelectItem value="10">10 Downloads</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        // UTILISATEUR ANONYME : Affiche un message promotionnel
        <div className="p-4 bg-secondary/50 border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Want more options?</p>
              <p className="text-xs text-muted-foreground">
                Sign in to protect your files with a password and set custom expiration.
              </p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={files.length === 0 || isUploading}
        size="lg"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading &
            Generating Link...
          </>
        ) : (
          "Create Transfer"
        )}
      </Button>
    </form>
  );
}