"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, ClipboardCheck, AlertTriangle, BarChart3, ArrowRight,
  Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import {
  fetchBackendTenders,
  fetchBidSubmissions,
  fetchDashboardStats,
  BackendTender,
  StoredBidSubmission,
  DashboardStats,
} from "@/lib/api-client";

export default function OfficerDashboard() {
  const [tenders, setTenders] = useState<BackendTender[]>([]);
  const [submissions, setSubmissions] = useState<StoredBidSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tendersRes, bidsRes] = await Promise.all([
        fetchDashboardStats(),
        fetchBackendTenders(),
        fetchBidSubmissions(),
      ]);
      setStats(statsRes);
      setTenders(tendersRes.items || []);
      setSubmissions(bidsRes.items || []);
    } catch (err: any) {
      console.error("Error loading officer dashboard:", err);
      setError(err.message || "Failed to connect to SatyaSetu backend API. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: "Active Tenders",
      value: stats ? stats.active_tenders.toString() : "—",
      icon: FileText,
      color: "text-[#1e3a5f]",
      bg: "bg-[#1e3a5f]/10",
    },
    {
      label: "Bids Received",
      value: stats ? stats.total_bids.toString() : "—",
      icon: ClipboardCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Submitted Bids",
      value: stats ? stats.submitted_bids.toString() : "—",
      icon: BarChart3,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Registered Vendors",
      value: stats ? stats.total_vendors.toString() : "—",
      icon: AlertTriangle,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f]">Procurement Evaluation Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor real GeM tenders, evaluate bidder submissions, and inspect intelligence facts
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadDashboardData}
          disabled={loading}
          className="self-start sm:self-auto text-xs gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Backend Connection Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={loadDashboardData} className="text-xs shrink-0">
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
              <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tender Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-sm sm:text-base">Real GeM Tender Evaluations</h2>
            <p className="text-xs text-muted-foreground">Source: FastAPI / Supabase Database</p>
          </div>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Live Database ({tenders.length} Tenders)
          </Badge>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
              <p className="text-xs text-muted-foreground">Fetching tenders from database...</p>
            </div>
          ) : tenders.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No tenders found in the database.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Tender</TableHead>
                  <TableHead className="w-[80px]">Bids</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Estimated Value</TableHead>
                  <TableHead className="w-[110px]">Deadline</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => {
                  const tenderBidsCount = submissions.filter(
                    (s) => s.tender_id === tender.id || (s.tender && (s.tender.id === tender.id || s.tender.tender_number === tender.tender_number))
                  ).length;

                  return (
                    <TableRow key={tender.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <span className="text-xs font-mono text-muted-foreground font-medium">
                            {tender.tender_number}
                          </span>
                          <p className="text-xs sm:text-sm font-medium leading-snug">{tender.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{tender.organization}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold text-xs">
                          {tenderBidsCount > 0 ? `${tenderBidsCount} Bids` : "0 Bids"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[11px] whitespace-nowrap ${
                            tender.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tender.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        ₹{(tender.estimated_value / 100000).toFixed(2)} Lakh
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(tender.submission_deadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/officer/tenders/${encodeURIComponent(tender.tender_number || tender.id)}`}>
                          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1 text-xs whitespace-nowrap">
                            Analyze Bids <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
