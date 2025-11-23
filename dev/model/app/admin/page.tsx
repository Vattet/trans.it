"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and is admin
    const auth = localStorage.getItem("tranzit_auth")
    if (!auth) {
      router.push("/login")
      return
    }

    const authData = JSON.parse(auth)
    const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    const userData = users[authData.email]

    // Simple admin check - in real app would be role-based from database
    if (!userData || !userData.isAdmin) {
      router.push("/dashboard")
      return
    }

    setAdmin({ ...userData, email: authData.email })
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <AdminLayout admin={admin}>
      <AdminDashboard admin={admin} />
    </AdminLayout>
  )
}
