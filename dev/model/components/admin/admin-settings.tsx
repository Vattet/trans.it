"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface AdminSettingsProps {
  admin?: any
}

export function AdminSettings({ admin }: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    maxFileSize: 2,
    defaultExpiration: 7,
    platformName: "Tranz.it",
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: name.includes("maxFileSize") ? Number.parseInt(value) : Number.parseInt(value),
    }))
  }

  const handleSave = () => {
    localStorage.setItem("tranzit_settings", JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and limits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings((prev) => ({ ...prev, platformName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (GB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultExpiration">Default Expiration (Days)</Label>
              <Input
                id="defaultExpiration"
                type="number"
                name="defaultExpiration"
                value={settings.defaultExpiration}
                onChange={handleChange}
                min="1"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>

            {saved && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-600">
                Settings saved successfully!
              </div>
            )}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Danger Zone
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Use these actions with caution. They cannot be undone.</p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm("Are you sure? This will delete all transfers.")) {
                  localStorage.removeItem("tranzit_transfers")
                  alert("All transfers have been deleted.")
                }
              }}
            >
              Clear All Transfers
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm("Are you sure? This will delete all user data.")) {
                  localStorage.removeItem("tranzit_users")
                  localStorage.removeItem("tranzit_auth")
                  window.location.href = "/login"
                }
              }}
            >
              Delete All Users
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
