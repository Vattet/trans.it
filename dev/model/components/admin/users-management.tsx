"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Shield, Search } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isAdmin?: boolean
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    const usersList = Object.entries(storedUsers).map(([email, userData]: [string, any]) => ({
      id: userData.id,
      email,
      name: userData.name,
      createdAt: userData.createdAt,
      isAdmin: userData.isAdmin,
    }))
    setUsers(usersList)
    setFilteredUsers(usersList)
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleDelete = (email: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const storedUsers = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
      delete storedUsers[email]
      localStorage.setItem("tranzit_users", JSON.stringify(storedUsers))
      setUsers(users.filter((u) => u.email !== email))
    }
  }

  const toggleAdmin = (email: string) => {
    const storedUsers = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    if (storedUsers[email]) {
      storedUsers[email].isAdmin = !storedUsers[email].isAdmin
      localStorage.setItem("tranzit_users", JSON.stringify(storedUsers))
      setUsers(users.map((u) => (u.email === email ? { ...u, isAdmin: !u.isAdmin } : u)))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage Tranz.it users and permissions</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 text-muted-foreground">{user.email}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          user.isAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleAdmin(user.email)} className="gap-1">
                        <Shield className="w-3 h-3" />
                        {user.isAdmin ? "Remove" : "Make"} Admin
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(user.email)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
  )
}
