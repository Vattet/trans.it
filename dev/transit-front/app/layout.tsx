import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tranz.it - Partage sécurisé de fichiers",
  description:
    "Plateforme de transfert de fichiers rapide et sécurisée. Partagez des fichiers jusqu'à 2 Go avec chiffrement de bout en bout. Aucun téléchargement requis pour les destinataires.",
  keywords: "transfert de fichiers, partage sécurisé, transfert chiffré, stockage en nuage",
  authors: [{ name: "Tranz.it" }],
  openGraph: {
    title: "Tranz.it - Partage sécurisé de fichiers",
    description: "Plateforme de transfert de fichiers rapide et sécurisée avec chiffrement de bout en bout",
    type: "website",
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
