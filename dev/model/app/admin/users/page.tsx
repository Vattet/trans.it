"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UsersManagement } from "@/components/admin/users-management"

export default function AdminUsersPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem("tranzit_auth")
    if (!auth) {
      router.push("/login")
      return
    }

    const authData = JSON.parse(auth)
    const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    const userData = users[authData.email]

    if (!userData || !userData.isAdmin) {
      router.push("/dashboard")
      return
    }

    setAdmin({ ...userData, email: authData.email })
    setIsLoading(false)
  }, [router])

  if (isLoading) return null

  return (
    <AdminLayout admin={admin}>
      <UsersManagement />
    </AdminLayout>
  )
}
