"use client"

import type React from "react"

import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-lg">Tranz.it</span>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border rounded-lg p-8">{children}</div>

        {/* Footer Link */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/" className="hover:text-primary transition">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
