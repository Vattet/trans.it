"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UploadLayout } from "@/components/upload/upload-layout"
import { FileUploadForm } from "@/components/upload/file-upload-form"

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated (optional for public uploads)
    const auth = localStorage.getItem("tranzit_auth")
    if (auth) {
      const authData = JSON.parse(auth)
      const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
      const userData = users[authData.email]
      if (userData) {
        setUser({ ...userData, email: authData.email })
      }
    }
  }, [])

  return (
    <UploadLayout user={user}>
      <FileUploadForm user={user} />
    </UploadLayout>
  )
}
