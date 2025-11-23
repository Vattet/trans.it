"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Copy, Check, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024

export function FileUploadForm({ user }: { user?: any }) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [transferPassword, setTransferPassword] = useState("")
  const [expirationDays, setExpirationDays] = useState("7")
  const [maxDownloads, setMaxDownloads] = useState("unlimited")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [transferLink, setTransferLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError("")
    const droppedFiles = Array.from(e.dataTransfer.files)
    validateAndAddFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    validateAndAddFiles(selectedFiles)
  }

  const validateAndAddFiles = (newFiles: File[]) => {
    const totalSize = [...files, ...newFiles].reduce((acc, file) => acc + file.size, 0)

    if (totalSize > MAX_FILE_SIZE) {
      setError("Total file size exceeds 2GB limit")
      return
    }

    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (files.length === 0) {
      setError("Please select at least one file")
      return
    }

    setIsUploading(true)

    try {
      const transferId = Math.random().toString(36).substr(2, 9)
      const link = `${window.location.origin}/download/${transferId}`

      const transfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")
      transfers[transferId] = {
        id: transferId,
        files: files.map((f) => ({ name: f.name, size: f.size })),
        password: transferPassword || null,
        expiresAt: new Date(Date.now() + Number.parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString(),
        maxDownloads: maxDownloads === "unlimited" ? null : Number.parseInt(maxDownloads),
        downloadCount: 0,
        createdBy: user?.email || "anonymous",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("tranzit_transfers", JSON.stringify(transfers))

      setTransferLink(link)
      setUploadComplete(true)
    } catch (err) {
      setError("An error occurred during upload. Please try again.")
    }

    setIsUploading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transferLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

  if (uploadComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Transfer Created!</h2>
            <p className="text-muted-foreground">Your files are ready to share</p>
          </div>

          <div className="bg-background p-4 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">Share this link with recipients:</p>
            <div className="flex items-center gap-2">
              <Input value={transferLink} readOnly className="flex-1 font-mono text-sm" />
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2 bg-transparent">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Files</p>
              <p className="font-semibold">{files.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-semibold">{totalSizeMB} MB</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-semibold">{expirationDays} days</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([])
                setUploadComplete(false)
                setTransferLink("")
                setTransferPassword("")
              }}
            >
              Send Another
            </Button>
            {user && <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Send Files</h1>
        <p className="text-muted-foreground">Upload your files and share instantly</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-base font-medium mb-1">
          Drag and drop files here or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:underline font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-muted-foreground">Max 2GB per transfer</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <div className="bg-card border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-background rounded transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-destructive/10 rounded transition"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total: {totalSizeMB} MB</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold">Transfer Options</h3>

        <div className="space-y-2">
          <Label htmlFor="password">Password Protection (Optional)</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password to protect this transfer"
            value={transferPassword}
            onChange={(e) => setTransferPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Recipients will need this password to download</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiration">Expires In</Label>
          <Select value={expirationDays} onValueChange={setExpirationDays}>
            <SelectTrigger id="expiration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="downloads">Max Downloads</Label>
          <Select value={maxDownloads} onValueChange={setMaxDownloads}>
            <SelectTrigger id="downloads">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Download</SelectItem>
              <SelectItem value="5">5 Downloads</SelectItem>
              <SelectItem value="10">10 Downloads</SelectItem>
              <SelectItem value="unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={files.length === 0 || isUploading} size="lg">
        {isUploading ? "Uploading..." : "Create Transfer"}
      </Button>
    </form>
  )
}
