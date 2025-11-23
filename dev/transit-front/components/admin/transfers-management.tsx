"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Loader2, FileText, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interface correspondant à la réponse JSON de ton API Laravel
interface AdminTransfer {
  ID: number;
  Code_unique: string;
  Nb_Acces: number;
  IsActive: boolean;
  Date_Expiration: string;
  Date_Creation: string;
  document?: {
    ID: number;
    Nom_document: string;
    Tailles_MB: number;
    user?: {
      Email: string;
      Nom: string;
      Prenom: string;
    };
  };
}

export function TransfersManagement() {
  const [transfers, setTransfers] = useState<AdminTransfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<AdminTransfer[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // État pour la modale de suppression
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  // 1. Charger tous les transferts
  useEffect(() => {
    const fetchAllTransfers = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/api/links", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTransfers(data);
          setFilteredTransfers(data);
        }
      } catch (error) {
        console.error("Erreur chargement admin transfers", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTransfers();
  }, []);

  // 2. Filtrer (Recherche)
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = transfers.filter((t) => {
      const filename = t.document?.Nom_document.toLowerCase() || "";
      const email = t.document?.user?.Email.toLowerCase() || "anonyme";
      const code = t.Code_unique.toLowerCase();

      return (
        filename.includes(lowerTerm) ||
        email.includes(lowerTerm) ||
        code.includes(lowerTerm)
      );
    });
    setFilteredTransfers(filtered);
  }, [searchTerm, transfers]);

  // 3. Supprimer un transfert (Appelé par la modale)
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const docId = fileToDelete;
    setFileToDelete(null); // Fermer la modale
    setIsDeleting(docId); // Activer le loader

    const token = getToken();

    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setTransfers((prev) => prev.filter((t) => t.document?.ID !== docId));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    } finally {
      setIsDeleting(null);
    }
  };

  const totalSizeMB = filteredTransfers.reduce((acc, t) => {
    return acc + parseFloat(t.document?.Tailles_MB?.toString() || "0");
  }, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transfers Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all file transfers on the platform
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename, email, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Code</th>
                  <th className="text-left p-3 font-semibold">File</th>
                  <th className="text-left p-3 font-semibold">Created By</th>
                  <th className="text-left p-3 font-semibold">Downloads</th>
                  <th className="text-left p-3 font-semibold">Created</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map((transfer) => {
                    const isExpired =
                      new Date(transfer.Date_Expiration) < new Date();
                    const isActive = transfer.IsActive && !isExpired;

                    if (!transfer.document) return null;

                    return (
                      <tr
                        key={transfer.ID}
                        className="border-b border-border hover:bg-muted/50 transition"
                      >
                        <td className="p-3 font-mono text-sm text-primary">
                          {transfer.Code_unique}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p
                                className="font-medium truncate max-w-[200px]"
                                title={transfer.document.Nom_document}
                              >
                                {transfer.document.Nom_document}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {parseFloat(
                                  transfer.document.Tailles_MB.toString()
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-sm">
                          {transfer.document.user ? (
                            <div className="flex flex-col">
                              <span>{transfer.document.user.Email}</span>
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground">
                              Anonyme (Guest)
                            </span>
                          )}
                        </td>

                        <td className="p-3">{transfer.Nb_Acces}</td>

                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(
                            transfer.Date_Creation
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isActive
                                ? "bg-green-500/10 text-green-600 border border-green-200"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                          >
                            {isActive
                              ? "Active"
                              : isExpired
                              ? "Expired"
                              : "Disabled"}
                          </span>
                        </td>

                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setFileToDelete(transfer.document!.ID)
                            }
                            disabled={isDeleting === transfer.document!.ID}
                          >
                            {isDeleting === transfer.document!.ID ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No transfers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredTransfers.length} total transfers •{" "}
            {totalSizeMB.toFixed(2)} MB consumed
          </div>
        </Card>
      </div>

      {/* --- MODALE DE CONFIRMATION (IDENTIQUE AUX AUTRES) --- */}
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete File Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. It will delete the file from the
              server and remove the download link for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
