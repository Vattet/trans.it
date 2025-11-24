"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DownloadLayout } from "@/components/download/download-layout";
import { DownloadForm } from "@/components/download/download-form";
import { Loader2, AlertCircle } from "lucide-react";

export default function DownloadPage() {
  const params = useParams();
  const [transfer, setTransfer] = useState<any>(null);
  const [errorType, setErrorType] = useState<"not_found" | "inactive" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const codeUnique = params.id as string;
    if (!codeUnique) return;

    const fetchTransferData = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/public/links/${codeUnique}`,
          { headers: { Accept: "application/json" } }
        );

        if (res.status === 404) {
          setErrorType("not_found");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        const linkData = data.link;

        // Si le lien est désactivé manuellement par l'admin ou l'user
        if (!linkData.IsActive) {
          setErrorType("inactive");
          setIsLoading(false);
          return;
        }

        // Note: On ne bloque pas l'expiration ICI pour pouvoir afficher
        // le message "Expired" proprement dans le composant enfant.

        const formattedTransfer = {
          id: linkData.ID,
          code: linkData.Code_unique,
          files: [
            {
              name: linkData.document.Nom_document,
              size: parseFloat(linkData.document.Tailles_MB) * 1024 * 1024,
              type: "file",
            },
          ],
          expiresAt: linkData.Date_Expiration, // Sera traité dans le formulaire
          sender: linkData.document.user?.Email || "Anonyme",
          downloadUrl: linkData.URL,
          directDownloadId: linkData.document.ID,
          downloadCount: linkData.Nb_Acces,

          // 👇 AJOUT IMPORTANT : On vérifie si le doc a un mot de passe
          isPasswordProtected:
            linkData.document.parametre?.Protection_MotDePasse || false,
        };

        setTransfer(formattedTransfer);
      } catch (err) {
        console.error(err);
        setErrorType("not_found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransferData();
  }, [params]);

  if (isLoading) {
    return (
      <DownloadLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DownloadLayout>
    );
  }

  if (errorType || !transfer) {
    let title = "Transfer Not Found";
    let message = "Ce transfert n'existe pas ou le lien est invalide.";

    if (errorType === "inactive") {
      title = "Transfert Désactivé";
      message = "Ce transfert a été désactivé par l'expéditeur.";
    }

    return (
      <DownloadLayout>
        <div className="max-w-2xl mx-auto text-center space-y-4 pt-10">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </DownloadLayout>
    );
  }

  return (
    <DownloadLayout>
      <DownloadForm transfer={transfer} transferId={params.id as string} />
    </DownloadLayout>
  );
}
