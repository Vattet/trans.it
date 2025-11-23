"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
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
      setFormData({
        name: userData.name,
        email: authData.email,
      })
      setIsLoading(false)
    } else {
      router.push("/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    if (users[formData.email]) {
      users[formData.email].name = formData.name
      localStorage.setItem("tranzit_users", JSON.stringify(users))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (isLoading) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} disabled className="bg-muted" />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>

            {saved && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-600">
                Changes saved successfully!
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
