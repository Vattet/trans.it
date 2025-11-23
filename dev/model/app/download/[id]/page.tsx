"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DownloadLayout } from "@/components/download/download-layout"
import { DownloadForm } from "@/components/download/download-form"

export default function DownloadPage() {
  const params = useParams()
  const [transfer, setTransfer] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    const transfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")
    const transferData = transfers[id]

    if (!transferData) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    // Check expiration
    if (new Date(transferData.expiresAt) < new Date()) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    // Check download limit
    if (transferData.maxDownloads && transferData.downloadCount >= transferData.maxDownloads) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    setTransfer(transferData)
    setIsLoading(false)
  }, [params])

  if (isLoading) {
    return (
      <DownloadLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transfer...</p>
        </div>
      </DownloadLayout>
    )
  }

  if (notFound || !transfer) {
    return (
      <DownloadLayout>
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">Transfer Not Found</h1>
          <p className="text-muted-foreground">
            This transfer has expired or is no longer available. Please request a new transfer from the sender.
          </p>
        </div>
      </DownloadLayout>
    )
  }

  return (
    <DownloadLayout>
      <DownloadForm transfer={transfer} transferId={params.id as string} />
    </DownloadLayout>
  )
}
