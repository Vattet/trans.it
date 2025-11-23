"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Transfer {
  ID: number;
  Nom_document: string;
  Tailles_MB: number;
  Date_Creation: string;
  lien?: {
    Code_unique: string;
    Nb_Acces: number;
    Date_Expiration: string;
  } | null;
}

export function TransfersList() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  // --- FETCH OPTIMISÉ AVEC NORMALISATION ---
  const fetchTransfers = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const token = getToken();

      const res = await fetch(
        `http://localhost:8000/api/users/${user.ID}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Erreur API:", res.status);
        return;
      }

      const data = await res.json();

      console.log("TRANSFERS RAW BACKEND :", data);

      // 🔥 Normalisation pour éviter tous les "No link" incorrects
      const normalized = data.map((doc: Transfer) => ({
        ...doc,
        lien:
          doc.lien && typeof doc.lien === "object" && doc.lien.Code_unique
            ? doc.lien
            : null,
      }));

      setTransfers(normalized);
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const copyLink = (code: string, id: number) => {
    const link = `${window.location.origin}/download/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (code: string) => {
    const url = `http://localhost:8000/public/download/${code}`;
    window.open(url, "_blank");
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const id = fileToDelete;
    setFileToDelete(null);
    setIsDeleting(id);

    const token = getToken();

    try {
      const res = await fetch(`http://localhost:8000/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setTransfers((prev) => prev.filter((t) => t.ID !== id));
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

  // --- LOADING ---
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Transfers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your shared files
          </p>
        </div>

        {/* --- NO FILES --- */}
        {transfers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No transfers yet</h3>
            <p className="text-muted-foreground text-sm">
              Start by uploading a file above!
            </p>
          </div>
        ) : (
          // --- TABLE ---
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Downloads
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.ID}>
                    {/* NAME */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span
                          className="truncate max-w-[150px] md:max-w-[220px]"
                          title={transfer.Nom_document}
                        >
                          {transfer.Nom_document}
                        </span>
                      </div>
                    </TableCell>

                    {/* SIZE */}
                    <TableCell>
                      {parseFloat(transfer.Tailles_MB.toString()).toFixed(2)} MB
                    </TableCell>

                    {/* DATE */}
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {new Date(transfer.Date_Creation).toLocaleDateString()}
                    </TableCell>

                    {/* DOWNLOAD COUNT */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-muted-foreground" />
                        {transfer.lien?.Nb_Acces ?? 0}
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {transfer.lien ? (
                          <>
                            {/* DOWNLOAD */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadFile(transfer.lien!.Code_unique)
                              }
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>

                            {/* COPY LINK */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyLink(
                                  transfer.lien!.Code_unique,
                                  transfer.ID
                                )
                              }
                              className={
                                copiedId === transfer.ID ? "text-green-500" : ""
                              }
                              title="Copy Link"
                            >
                              {copiedId === transfer.ID ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <LinkIcon className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2">
                            No link
                          </span>
                        )}

                        {/* DELETE */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileToDelete(transfer.ID)}
                          disabled={isDeleting === transfer.ID}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          {isDeleting === transfer.ID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* --- DELETE MODAL --- */}
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete File?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file and the sharing link will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
