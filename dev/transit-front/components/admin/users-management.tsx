"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Shield,
  Search,
  Loader2,
  Edit,
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
// 👇 1. Import du hook de notification
import { useToast } from "@/components/ui/use-toast";

interface User {
  ID: number;
  Nom: string;
  Prenom: string;
  Email: string;
  IsActive: boolean;
  IsAdmin?: boolean;
  Date_Creation: string;
}

export function UsersManagement() {
  const router = useRouter();
  // 👇 2. Initialisation du hook
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Etats Édition
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    Nom: "",
    Prenom: "",
    Email: "",
    IsActive: false,
    IsAdmin: false,
  });

  // Etats Suppression
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const usersList = Array.isArray(data) ? data : data.users || [];

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Erreur chargement users:", error);
      // Petit toast discret en cas d'erreur de chargement
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        (user.Nom?.toLowerCase() || "").includes(lowerTerm) ||
        (user.Prenom?.toLowerCase() || "").includes(lowerTerm) ||
        user.Email.toLowerCase().includes(lowerTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      Nom: user.Nom,
      Prenom: user.Prenom,
      Email: user.Email,
      IsActive: Boolean(user.IsActive),
      IsAdmin: Boolean(user.IsAdmin),
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    const token = getToken();

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${editingUser.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      const updatedList = users.map((u) =>
        u.ID === editingUser.ID ? { ...u, ...editForm } : u
      );

      setUsers(updatedList);
      setEditingUser(null);

      // Succès
      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      console.error("Erreur update:", error);

      // 👇 3. REMPLACEMENT DE L'ALERT PAR TOAST
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: error.message || "Une erreur est survenue.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const id = userToDelete;
    setUserToDelete(null);
    setIsDeleting(id);

    const token = getToken();
    try {
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.ID !== id));
        toast({
          title: "Utilisateur supprimé",
          description: "Le compte a été supprimé définitivement.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Impossible de supprimer",
          description: "Cet utilisateur a peut-être des fichiers liés.",
        });
      }
    } catch (error) {
      console.error("Erreur delete:", error);
      toast({
        variant: "destructive",
        title: "Erreur serveur",
        description: "Impossible de contacter le serveur.",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... Le reste de ton JSX reste identique ... */}
      {/* Je ne le remets pas tout pour économiser de la place, 
          garde tout ce qu'il y a entre le header et la fin des modales */}

      <div>
        <h1 className="text-3xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">
          Manage Tranz.it users and permissions
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.ID}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="p-3 font-medium">
                      {user.Prenom} {user.Nom}
                    </td>
                    <td className="p-3 text-muted-foreground">{user.Email}</td>
                    <td className="p-3 text-sm">
                      {user.IsAdmin ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      ) : (
                        <span className="text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          user.IsActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {user.IsActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(user)}
                        className="gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setUserToDelete(user.ID)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </Card>

      {/* --- MODAL D'ÉDITION --- */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user profile here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom</Label>
                <Input
                  id="edit-prenom"
                  value={editForm.Prenom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, Prenom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom</Label>
                <Input
                  id="edit-nom"
                  value={editForm.Nom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, Nom: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={editForm.Email}
                onChange={(e) =>
                  setEditForm({ ...editForm, Email: e.target.value })
                }
              />
            </div>

            {/* TOGGLE STATUS */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-base">Active Account</Label>
                <div className="text-xs text-muted-foreground">
                  User can log in
                </div>
              </div>
              <Switch
                checked={editForm.IsActive}
                onCheckedChange={(val) =>
                  setEditForm({ ...editForm, IsActive: val })
                }
              />
            </div>

            {/* TOGGLE ADMIN (Optionnel) */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-base">Administrator</Label>
                <div className="text-xs text-muted-foreground">
                  Full access to dashboard
                </div>
              </div>
              <Switch
                checked={editForm.IsAdmin}
                onCheckedChange={(val) =>
                  setEditForm({ ...editForm, IsAdmin: val })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
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

      {/* --- MODAL DE CONFIRMATION SUPPRESSION --- */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
