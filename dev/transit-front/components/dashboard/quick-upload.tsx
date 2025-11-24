"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { setFilesToTransfer } from "@/lib/file-store";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export function QuickUpload() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    const droppedFiles = Array.from(e.dataTransfer.files);
    // On ne prend que le premier fichier
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    // On ne prend que le premier fichier
    if (selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  };

  // Modification : On traite UN seul fichier et on REMPLACE la liste
  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("Total file size exceeds 2GB limit");
      return;
    }
    // On remplace le tableau par le nouveau fichier unique
    setFiles([file]);
  };

  const removeFile = () => {
    setFiles([]); // On vide la liste
    setError("");
  };

  const handleContinue = () => {
    if (files.length > 0) {
      setFilesToTransfer(files);
      router.push("/upload");
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Upload Zone - Cachée si un fichier est déjà sélectionné */}
      {files.length === 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Retrait de l'attribut 'multiple' */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Drag and drop file here or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum 2GB per transfer
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Files List (Affiché seulement si un fichier est présent) */}
      {files.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="space-y-2 mb-4">
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
                  onClick={removeFile} // Plus besoin d'index car un seul fichier
                  className="ml-2 p-1 hover:bg-destructive/10 rounded transition"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              1 file • {totalSizeMB} MB
            </p>

            <Button onClick={handleContinue} className="gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
