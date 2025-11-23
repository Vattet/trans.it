"use client";

import { useEffect, useState } from "react";
import { UploadLayout } from "@/components/upload/upload-layout";
import { FileUploadForm } from "@/components/upload/file-upload-form";

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const hasToken = document.cookie.includes("token=");

    if (userStr && hasToken) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <UploadLayout user={user}>
      <FileUploadForm user={user} />
    </UploadLayout>
  );
}
