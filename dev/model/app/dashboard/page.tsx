"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TransfersList } from "@/components/dashboard/transfers-list"
import { QuickUpload } from "@/components/dashboard/quick-upload"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem("tranzit_auth")
    if (!auth) {
      router.push("/login")
      return
    }

    const authData = JSON.parse(auth)
    const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    const userData = users[authData.email]

    if (userData) {
      setUser({ ...userData, email: authData.email })
      setIsLoading(false)
    } else {
      router.push("/login")
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        <QuickUpload />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Files Transferred</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Downloads</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <p className="text-3xl font-bold">0 MB</p>
          </div>
          <div className="lg:col-span-1 space-y-2 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Active Transfers</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        <TransfersList />
      </div>
    </DashboardLayout>
  )
}
