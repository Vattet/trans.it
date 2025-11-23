"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, FileText, Download, TrendingUp } from "lucide-react"

interface AdminDashboardProps {
  admin?: any
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransfers: 0,
    totalDownloads: 0,
    totalStorage: 0,
    activeTransfers: 0,
  })

  const [chartData, setChartData] = useState<any[]>([])
  const [recentTransfers, setRecentTransfers] = useState<any[]>([])

  useEffect(() => {
    // Calculate stats from localStorage
    const users = JSON.parse(localStorage.getItem("tranzit_users") || "{}")
    const transfers = JSON.parse(localStorage.getItem("tranzit_transfers") || "{}")

    const totalUsers = Object.keys(users).length
    const transfersArray = Object.values(transfers) as any[]
    const totalTransfers = transfersArray.length
    const totalDownloads = transfersArray.reduce((acc, t) => acc + (t.downloadCount || 0), 0)
    const totalStorage = transfersArray.reduce((acc, t) => {
      return acc + (t.files?.reduce((fAcc: number, f: any) => fAcc + f.size, 0) || 0)
    }, 0)
    const activeTransfers = transfersArray.filter((t) => new Date(t.expiresAt) > new Date()).length

    setStats({
      totalUsers,
      totalTransfers,
      totalDownloads,
      totalStorage: Math.round(totalStorage / (1024 * 1024)),
      activeTransfers,
    })

    // Generate chart data (7 days)
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      // Simulate data for demo
      data.push({
        date: dateStr,
        transfers: Math.floor(Math.random() * 10) + 2,
        downloads: Math.floor(Math.random() * 15) + 3,
      })
    }
    setChartData(data)

    // Get recent transfers
    const recent = transfersArray
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    setRecentTransfers(recent)
  }, [])

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of Tranz.it platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Transfers</p>
              <p className="text-3xl font-bold">{stats.totalTransfers}</p>
            </div>
            <FileText className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
              <p className="text-3xl font-bold">{stats.totalDownloads}</p>
            </div>
            <Download className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-3xl font-bold">{stats.totalStorage} MB</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Transfers</p>
              <p className="text-3xl font-bold">{stats.activeTransfers}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/30" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="transfers" stroke="#3b82f6" />
              <Line type="monotone" dataKey="downloads" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Transfer Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transfers" fill="#3b82f6" />
              <Bar dataKey="downloads" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transfers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Transfers</h3>
          <Link href="/admin/transfers">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          {recentTransfers.length > 0 ? (
            recentTransfers.map((transfer: any) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transfer.files[0]?.name}
                    {transfer.files.length > 1 && ` + ${transfer.files.length - 1} more`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By {transfer.createdBy} • {new Date(transfer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{transfer.downloadCount} downloads</p>
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(transfer.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">No transfers yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
