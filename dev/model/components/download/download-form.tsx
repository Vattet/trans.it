"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Lock } from "lucide-react"

interface DownloadFormProps {
  transfer: any
  transferId: string
}

export function DownloadForm({ transfer, transferId }: DownloadFormProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check password if required
    if (transfer.password && password !== transfer.password) {
      alert("Invalid password")
      return
    }

    setIsDownloading(true)

    // Simulate download - in real app, this would download actual files
    setTimeout(() => {
      // Update download count
      const transfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")
      if (transfers[transferId]) {
        transfers[transferId].downloadCount += 1
        localStorage.setItem("tranzit_transfers", JSON.stringify(transfers))
      }

      alert(`Downloaded ${transfer.files.length} file(s) successfully!`)
      setIsDownloading(false)
    }, 1000)
  }

  const totalSize = transfer.files.reduce((acc: number, file: any) => acc + file.size, 0)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

  return (
    <form onSubmit={handleDownload} className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Download Files</h1>
          <p className="text-muted-foreground">
            Someone shared {transfer.files.length} file{transfer.files.length !== 1 ? "s" : ""} with you
          </p>
        </div>

        {/* Files */}
        <div className="space-y-2">
          <Label>Files ({transfer.files.length})</Label>
          <div className="bg-background border border-border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
            {transfer.files.map((file: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-card rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total: {totalSizeMB} MB</p>
        </div>

        {/* Transfer Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background border border-border rounded-lg text-sm">
          <div>
            <p className="text-muted-foreground">Downloads</p>
            <p className="font-semibold">
              {transfer.downloadCount}
              {transfer.maxDownloads ? ` / ${transfer.maxDownloads}` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expires</p>
            <p className="font-semibold">{new Date(transfer.expiresAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Password */}
        {transfer.password && (
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              Show password
            </label>
          </div>
        )}

        {/* Download Button */}
        <Button type="submit" className="w-full gap-2" size="lg" disabled={transfer.password && !password}>
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading..." : "Download Files"}
        </Button>
      </div>
    </form>
  )
}
