"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Shield, Search, Loader2 } from "lucide-react";

// Interface correspondant à ton Backend Laravel
interface User {
  ID: number; // Ton API renvoie "ID" (majuscule)
  Nom: string;
  Prenom: string;
  Email: string;
  IsActive: boolean; // Pour simuler le statut Admin ou Actif
  Date_Creation: string;
  role?: string; // Optionnel si tu ajoutes la gestion des rôles plus tard
}

export function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Helper pour récupérer le token
  const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  // 1. Charger les utilisateurs depuis l'API
  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login"); // Pas de token ? Retour au login
      return;
    }

    try {
      // Remplace par la bonne route de ton backend (ex: /api/users)
      const res = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`, // Très important : Envoi du token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (res.status === 401) {
        // Token expiré ou invalide
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();

      // Adaptation selon si ton API renvoie { data: [...] } ou directement [...]
      const usersList = Array.isArray(data) ? data : data.users || [];

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Erreur chargement users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filtrer la recherche côté client
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

  // 3. Supprimer un utilisateur (Appel API)
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

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
        // Mise à jour locale pour éviter de recharger la page
        const newUsers = users.filter((u) => u.ID !== id);
        setUsers(newUsers);
        setFilteredUsers(newUsers); // Note: petit bug visuel fix ici (il faut update filteredUsers aussi)
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur delete:", error);
    }
  };

  // 4. Toggle Admin / Statut (Exemple)
  const toggleStatus = async (user: User) => {
    // Note: Adapte cette URL selon ton backend. Exemple: changer le statut actif/inactif
    const token = getToken();
    try {
      // Exemple hypothétique d'update
      /* const res = await fetch(`http://localhost:8000/api/users/${user.ID}`, {
            method: "PUT", // ou PATCH
            headers: { ... },
            body: JSON.stringify({ IsActive: !user.IsActive })
        });
        */

      // Pour l'instant, alerte tant que ton backend n'a pas la route update
      alert(
        "Fonctionnalité à connecter à ton backend (PUT /api/users/" +
          user.ID +
          ")"
      );
    } catch (error) {
      console.error(error);
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
                <th className="text-left p-3 font-semibold">Joined</th>
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
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(user.Date_Creation).toLocaleDateString()}
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
                        onClick={() => toggleStatus(user)}
                        className="gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.ID)}
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
    </div>
  );
}
