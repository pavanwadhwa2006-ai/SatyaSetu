"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { useAuth } from "@/contexts/auth-context";
import {
  FileText,
  Send,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  IndianRupee,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  fetchBackendTenders,
  fetchBidSubmissions,
  fetchDashboardStats,
  BackendTender,
  StoredBidSubmission,
  DashboardStats,
} from "@/lib/api-client";

export default function BidderDashboard() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<BackendTender[]>([]);
  const [submissions, setSubmissions] = useState<StoredBidSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBidderDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tendersRes, bidsRes, statsRes] = await Promise.all([
        fetchBackendTenders(),
        fetchBidSubmissions(),
        fetchDashboardStats(),
      ]);
      setTenders(tendersRes.items || []);
      setSubmissions(bidsRes.items || []);
      setStats(statsRes);
    } catch (err: any) {
      console.error("Failed to load bidder dashboard:", err);
      setError(err.message || "Failed to load tenders from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidderDashboard();
  }, []);

  const statCards = [
    {
      label: "Available Tenders",
      value: stats ? stats.active_tenders.toString() : "—",
      icon: FileText,
      color: "text-[#1e3a5f]",
      bg: "bg-[#1e3a5f]/10",
    },
    {
      label: "Submitted Bids",
      value: stats ? stats.submitted_bids.toString() : "—",
      icon: Send,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Draft Bids",
      value: stats ? stats.draft_bids.toString() : "—",
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Total Submissions",
      value: stats ? stats.total_bids.toString() : "—",
      icon: AlertCircle,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Welcome, <span className="text-[#1e3a5f]">{user?.organization || user?.name || "Bidder Portal"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Bidder Workspace · Browse active GeM tenders and submit compliance documentation
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadBidderDashboard}
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
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadBidderDashboard} className="text-xs">
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

      {/* Available Tenders */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">Available GeM Procurement Tenders</h2>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            FastAPI Real-time Database
          </Badge>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
            <p className="text-sm text-muted-foreground">Loading available tenders...</p>
          </div>
        ) : tenders.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-muted-foreground text-sm">
            No tenders currently available.
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tender.tender_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            tender.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tender.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          {tender.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm leading-snug">{tender.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tender.organization}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Deadline:{" "}
                          {new Date(tender.submission_deadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                          ₹{(tender.estimated_value / 100000).toFixed(2)} Lakh
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/bidder/tenders/${encodeURIComponent(tender.tender_number || tender.id)}`}
                      className="w-full sm:w-auto"
                    >
                      <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1 mt-1 sm:mt-0">
                        View Tender
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
