"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DownloadLayout } from "@/components/download/download-layout";
import { DownloadForm } from "@/components/download/download-form";
import { Loader2 } from "lucide-react";

export default function DownloadPage() {
  const params = useParams();
  // "transfer" contiendra les infos formatées pour le formulaire
  const [transfer, setTransfer] = useState<any>(null);

  // États d'erreur plus précis
  const [errorType, setErrorType] = useState<
    "not_found" | "expired" | "inactive" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const codeUnique = params.id as string;

    if (!codeUnique) return;

    const fetchTransferData = async () => {
      try {
        // 1. Appel à l'API publique (pas besoin de token ici, c'est un lien de partage)
        const res = await fetch(
          `http://localhost:8000/api/public/links/${codeUnique}`,
          {
            headers: { Accept: "application/json" },
          }
        );

        if (res.status === 404) {
          setErrorType("not_found");
          setIsLoading(false);
          return;
        }

        const data = await res.json(); // Réponse : { link: { ...document... } }

        if (!res.ok) throw new Error("Erreur serveur");

        const linkData = data.link;

        // 2. Vérifications de sécurité (Expiration, Actif)
        const now = new Date();
        const expiration = new Date(linkData.Date_Expiration);

        if (!linkData.IsActive) {
          setErrorType("inactive"); // Le créateur a désactivé le lien
          setIsLoading(false);
          return;
        }

        if (expiration < now) {
          setErrorType("expired");
          setIsLoading(false);
          return;
        }

        // 3. Transformation des données pour le composant DownloadForm
        // On adapte la structure de ton API (BDD) vers la structure attendue par ton UI
        const formattedTransfer = {
          id: linkData.ID,
          code: linkData.Code_unique,
          // Ton DownloadForm attend probablement un tableau "files"
          files: [
            {
              name: linkData.document.Nom_document,
              // Conversion MB -> Bytes pour l'affichage si nécessaire, ou laisse en MB
              size: parseFloat(linkData.document.Tailles_MB) * 1024 * 1024,
              type: "file",
            },
          ],
          expiresAt: linkData.Date_Expiration,
          sender: linkData.document.user?.Email || "Anonyme", // Si tu as inclus la relation user
          downloadUrl: linkData.URL, // L'URL pour télécharger réellement
          directDownloadId: linkData.document.ID, // Pour savoir quel fichier demander
        };

        setTransfer(formattedTransfer);
      } catch (err) {
        console.error(err);
        setErrorType("not_found"); // Par défaut en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransferData();
  }, [params]);

  // --- RENDU : CHARGEMENT ---
  if (isLoading) {
    return (
      <DownloadLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Recherche du transfert...</p>
        </div>
      </DownloadLayout>
    );
  }

  // --- RENDU : ERREURS ---
  if (errorType || !transfer) {
    let title = "Transfer Not Found";
    let message = "This transfer does not exist or the link is invalid.";

    if (errorType === "expired") {
      title = "Transfer Expired";
      message = "This transfer link has passed its expiration date.";
    } else if (errorType === "inactive") {
      title = "Transfer Unavailable";
      message = "This transfer has been disabled by the sender.";
    }

    return (
      <DownloadLayout>
        <div className="max-w-2xl mx-auto text-center space-y-4 pt-10">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </DownloadLayout>
    );
  }

  // --- RENDU : SUCCÈS ---
  // On passe "transferId" (le code) et l'objet "transfer" formaté
  return (
    <DownloadLayout>
      <DownloadForm transfer={transfer} transferId={params.id as string} />
    </DownloadLayout>
  );
}
