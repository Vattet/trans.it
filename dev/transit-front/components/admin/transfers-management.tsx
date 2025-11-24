"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Search,
  Loader2,
  FileText,
  Download,
  ExternalLink,
  AlertTriangle,
  Edit,
  Save,
  Lock,
  Calendar,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface mise à jour avec les paramètres
interface AdminTransfer {
  ID: number;
  Code_unique: string;
  Nb_Acces: number;
  IsActive: boolean;
  Date_Expiration: string; // Date expiration du LIEN (souvent liée aux params)
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
    // Les paramètres de sécurité du document
    parametre?: {
      Protection_MotDePasse: boolean;
      Date_Expiration: string;
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

  // --- ÉTATS POUR LA SUPPRESSION ---
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  // --- ÉTATS POUR L'ÉDITION ---
  const [editingTransfer, setEditingTransfer] = useState<AdminTransfer | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Formulaire d'édition
  const [editForm, setEditForm] = useState({
    Nom_document: "",
    Protection_MotDePasse: false,
    Mot_de_passe: "", // Vide par défaut (on ne change que si rempli)
    Date_Expiration: "",
  });

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  // 1. Charger tous les transferts
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

  useEffect(() => {
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

  // --- ACTIONS SIMPLES ---
  const downloadFile = (code: string) => {
    window.open(`http://localhost:8000/public/download/${code}`, "_blank");
  };

  const visitPublicPage = (code: string) => {
    window.open(`${window.location.origin}/download/${code}`, "_blank");
  };

  // --- LOGIQUE D'ÉDITION ---

  const handleEditClick = (transfer: AdminTransfer) => {
    if (!transfer.document) return;

    // Formatage de la date pour l'input type="date" (YYYY-MM-DD)
    let formattedDate = "";
    // On regarde dans les paramètres du doc en priorité, sinon dans le lien
    const rawDate =
      transfer.document.parametre?.Date_Expiration || transfer.Date_Expiration;
    if (rawDate) {
      formattedDate = new Date(rawDate).toISOString().split("T")[0];
    }

    setEditingTransfer(transfer);
    setEditForm({
      Nom_document: transfer.document.Nom_document,
      Protection_MotDePasse: Boolean(
        transfer.document.parametre?.Protection_MotDePasse
      ),
      Mot_de_passe: "", // On ne peut pas récupérer le mot de passe haché, on le laisse vide
      Date_Expiration: formattedDate,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransfer || !editingTransfer.document) return;
    setIsSaving(true);
    const token = getToken();

    try {
      // 1. Mise à jour du Document (Nom)
      // Route: PUT /api/documents/{id}
      await fetch(
        `http://localhost:8000/api/documents/${editingTransfer.document.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            Nom_document: editForm.Nom_document,
          }),
        }
      );

      // 2. Mise à jour des Paramètres (Mdp, Expiration)
      // Route: PUT /api/document-params/{idDoc}
      // Note: Le contrôleur ParametreDocumentController attend 'Id_Document' dans l'URL pour l'update
      const paramsPayload: any = {
        Protection_MotDePasse: editForm.Protection_MotDePasse,
        Date_Expiration: editForm.Date_Expiration,
      };

      // On n'envoie le mot de passe que s'il a été modifié (non vide)
      if (
        editForm.Protection_MotDePasse &&
        editForm.Mot_de_passe.trim() !== ""
      ) {
        paramsPayload.Mot_de_passe = editForm.Mot_de_passe;
      }

      await fetch(
        `http://localhost:8000/api/document-params/${editingTransfer.document.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(paramsPayload),
        }
      );

      // 3. Rafraîchir la liste locale
      // On recharge tout pour avoir les données fraîches
      await fetchAllTransfers();

      setEditingTransfer(null); // Fermer modale
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGIQUE DE SUPPRESSION ---
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const docId = fileToDelete;
    setFileToDelete(null);
    setIsDeleting(docId);

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
                  <th className="text-left p-3 font-semibold">Stats</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map((transfer) => {
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
                              Anonyme
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Download className="w-3 h-3" /> {transfer.Nb_Acces}
                          </div>
                        </td>

                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(
                            transfer.Date_Creation
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {/* BOUTON EDIT */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Edit Transfer"
                              onClick={() => handleEditClick(transfer)}
                            >
                              <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>

                            {/* DOWNLOAD */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Download"
                              onClick={() => downloadFile(transfer.Code_unique)}
                            >
                              <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>

                            {/* VISIT */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Visit"
                              onClick={() =>
                                visitPublicPage(transfer.Code_unique)
                              }
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>

                            {/* DELETE */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Delete"
                              onClick={() =>
                                setFileToDelete(transfer.document!.ID)
                              }
                              disabled={isDeleting === transfer.document!.ID}
                              className="hover:bg-destructive/10"
                            >
                              {isDeleting === transfer.document!.ID ? (
                                <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
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

      {/* --- MODAL D'ÉDITION --- */}
      <Dialog
        open={!!editingTransfer}
        onOpenChange={(open) => !open && setEditingTransfer(null)}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Transfer</DialogTitle>
            <DialogDescription>
              Update file details and security settings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nom du fichier */}
            <div className="space-y-2">
              <Label htmlFor="name">File Name</Label>
              <Input
                id="name"
                value={editForm.Nom_document}
                onChange={(e) =>
                  setEditForm({ ...editForm, Nom_document: e.target.value })
                }
              />
            </div>

            {/* Date d'expiration */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Expiration Date
              </Label>
              <Input
                id="date"
                type="date"
                value={editForm.Date_Expiration}
                onChange={(e) =>
                  setEditForm({ ...editForm, Date_Expiration: e.target.value })
                }
              />
            </div>

            {/* Sécurité Mot de passe */}
            <div className="space-y-4 border rounded-lg p-4 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="protect" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password Protection
                </Label>
                <Switch
                  id="protect"
                  checked={editForm.Protection_MotDePasse}
                  onCheckedChange={(val) =>
                    setEditForm({ ...editForm, Protection_MotDePasse: val })
                  }
                />
              </div>

              {editForm.Protection_MotDePasse && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                  <Label htmlFor="pwd">New Password</Label>
                  <Input
                    id="pwd"
                    type="text" // Visible pour l'admin
                    placeholder="Leave empty to keep current"
                    value={editForm.Mot_de_passe}
                    onChange={(e) =>
                      setEditForm({ ...editForm, Mot_de_passe: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Warning: Entering a value here will overwrite the existing
                    password.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransfer(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE SUPPRESSION --- */}
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
