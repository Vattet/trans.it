"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search } from "lucide-react"

interface Transfer {
  id: string
  files: any[]
  createdBy: string
  createdAt: string
  expiresAt: string
  downloadCount: number
  maxDownloads?: number
}

export function TransfersManagement() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const storedTransfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")
    const transfersList = Object.entries(storedTransfers).map(([id, data]: [string, any]) => ({
      id,
      ...data,
    }))
    setTransfers(transfersList)
    setFilteredTransfers(transfersList)
  }, [])

  useEffect(() => {
    const filtered = transfers.filter(
      (transfer) =>
        transfer.id.includes(searchTerm) ||
        transfer.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.files.some((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredTransfers(filtered)
  }, [searchTerm, transfers])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transfer?")) {
      const storedTransfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")
      delete storedTransfers[id]
      localStorage.setItem("tranzit_transfers", JSON.stringify(storedTransfers))
      setTransfers(transfers.filter((t) => t.id !== id))
    }
  }

  const totalSize = transfers.reduce((acc, t) => {
    return acc + (t.files?.reduce((fAcc: number, f: any) => fAcc + f.size, 0) || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transfers Management</h1>
        <p className="text-muted-foreground">Monitor and manage all file transfers</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">Transfer ID</th>
                <th className="text-left p-3 font-semibold">Files</th>
                <th className="text-left p-3 font-semibold">Created By</th>
                <th className="text-left p-3 font-semibold">Downloads</th>
                <th className="text-left p-3 font-semibold">Expires</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => {
                  const isExpired = new Date(transfer.expiresAt) < new Date()
                  return (
                    <tr key={transfer.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="p-3 font-mono text-sm">{transfer.id}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{transfer.files[0]?.name}</p>
                          {transfer.files.length > 1 && (
                            <p className="text-sm text-muted-foreground">+{transfer.files.length - 1} more</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{transfer.createdBy}</td>
                      <td className="p-3">
                        {transfer.downloadCount}
                        {transfer.maxDownloads && ` / ${transfer.maxDownloads}`}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(transfer.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            isExpired ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(transfer.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No transfers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {filteredTransfers.length} transfers • {(totalSize / (1024 * 1024)).toFixed(2)} MB total
        </div>
      </Card>
    </div>
  )
}
