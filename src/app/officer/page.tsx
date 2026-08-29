"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTenders } from "@/lib/mock-api";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, ClipboardCheck, BarChart3, ArrowRight, Plus, Loader2, ShieldCheck
} from "lucide-react";

export default function OfficerDashboard() {
  const [tendersList, setTendersList] = useState<any[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);
  const [bidCountsMap, setBidCountsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const liveTenders = await fetchTenders();

        // Fetch bid_submissions counts
        const { data: bids } = await supabase.from("bid_submissions").select("id, tender_id, status, ai_verification_status");

        if (isMounted) {
          setTendersList(liveTenders);
          if (bids) {
            setSubmissionsCount(bids.length);
            setPendingCount(bids.filter((b) => b.status === "UNDER_EVALUATION" || b.status === "SUBMITTED").length);
            setVerifiedCount(bids.filter((b) => b.ai_verification_status === "VERIFIED").length);

            const map: Record<string, number> = {};
            bids.forEach((b) => {
              if (b.tender_id) {
                map[b.tender_id] = (map[b.tender_id] || 0) + 1;
              }
            });
            setBidCountsMap(map);
          }
        }
      } catch (err) {
        console.warn("Officer dashboard data fetch warning:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f]">Procurement Evaluation Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor tenders, evaluate bidder applications, and make automated AI procurement decisions
          </p>
        </div>
        <Link href="/officer/tenders/publish">
          <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1.5 self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Publish Tender
          </Button>
        </Link>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f]">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{tendersList.length}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Active Tenders</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{submissionsCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Bids Received</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{pendingCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{verifiedCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">AI Verified Bids</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tender Evaluation Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-sm sm:text-base text-[#1e3a5f]">Live Tender Evaluations (`tenders`)</h2>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-800 border-emerald-300">
            Live Supabase Integration
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
              <span className="text-xs">Loading live tenders...</span>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="min-w-[320px]">GeM Tender Details</TableHead>
                  <TableHead className="w-[100px] text-center">Bids Received</TableHead>
                  <TableHead className="w-[120px]">Tender Status</TableHead>
                  <TableHead className="w-[130px]">Submission Deadline</TableHead>
                  <TableHead className="w-[130px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tendersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                      No active tenders published yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tendersList.map((row) => {
                    const bidsReceived = bidCountsMap[row.id] || 0;
                    const tenderNum = row.tenderNumber || (row as any).tender_number || "GEM/2026/B/7903799";
                    const estVal = row.estimatedValueFormatted || (row.estimatedValue ? `₹${(row.estimatedValue / 100000).toFixed(2)} Lakh` : "₹16.01 Lakh");

                    return (
                      <TableRow key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="space-y-1 py-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center font-mono text-[11px] font-bold bg-[#1e3a5f] text-white px-2 py-0.5 rounded shadow-sm">
                                {tenderNum}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-medium">• {row.organization || "Ministry Of Finance"}</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                              {row.title}
                            </p>
                            <div className="text-[11px] text-muted-foreground">
                              Estimated Value: <span className="font-semibold text-slate-800">{estVal}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`font-bold text-xs px-2.5 py-0.5 ${
                            bidsReceived > 0 ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {bidsReceived} {bidsReceived === 1 ? "Bid" : "Bids"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 whitespace-nowrap font-bold uppercase tracking-wider">
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 whitespace-nowrap font-medium">
                          {row.submissionDeadline ? new Date(row.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "3 Sept 2026"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/officer/tenders/${row.id}`}>
                            <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1 text-xs whitespace-nowrap font-medium shadow-sm">
                              Analyze Bids <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
