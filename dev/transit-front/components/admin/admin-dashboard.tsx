"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  FileText,
  Download,
  TrendingUp,
  HardDrive,
} from "lucide-react";

interface AdminDashboardProps {
  admin?: any;
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransfers: 0,
    totalDownloads: 0,
    totalStorage: 0,
    activeTransfers: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);

  const getToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // 1. APPEL API STATS
        const statsRes = await fetch("http://localhost:8000/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (statsRes.ok) {
          const data = await statsRes.json();

          // A. Mise à jour des cartes
          setStats({
            totalUsers: data.totalUsers || 0,
            totalTransfers: data.totalTransfers || 0,
            totalDownloads: data.totalDownloads || 0,
            totalStorage: data.totalStorage || 0, // Déjà en MB via le backend
            activeTransfers: data.activeTransfers || 0,
          });

          // B. Mise à jour des GRAPHIQUES avec les vraies données
          if (data.chartData) {
            setChartData(data.chartData);
          }
        }

        // 2. APPEL API LISTE RÉCENTS (Route /api/links)
        const transfersRes = await fetch("http://localhost:8000/api/links", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (transfersRes.ok) {
          const linksData = await transfersRes.json();
          // On garde les 5 premiers pour la liste "Récents"
          setRecentTransfers(linksData.slice(0, 5));
        }
      } catch (error) {
        console.error("Erreur chargement dashboard admin", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Tranz.it platform activity
        </p>
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
              <p className="text-sm text-muted-foreground">Total Files</p>
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
            <HardDrive className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Links</p>
              <p className="text-3xl font-bold">{stats.activeTransfers}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/30" />
          </div>
        </Card>
      </div>

      {/* Charts avec VRAIES DONNÉES */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Activity Over Time (Last 7 days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="transfers"
                name="Uploads"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="downloads"
                name="Links Created"
                stroke="#8b5cf6"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Transfer Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="transfers" name="Uploads" fill="#3b82f6" />
              <Bar dataKey="downloads" name="Links Created" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transfers - VRAIES DONNÉES */}
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
            recentTransfers.map((link: any) => (
              <div
                key={link.ID}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {link.document?.Nom_document || "Fichier inconnu"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Code: {link.Code_unique} •{" "}
                    {new Date(link.Date_Creation).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {link.Nb_Acces} downloads
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {link.document
                      ? `${parseFloat(link.document.Tailles_MB).toFixed(2)} MB`
                      : ""}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No transfers found
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
