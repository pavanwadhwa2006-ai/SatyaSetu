"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchBiddersForTender, fetchTenderById, triggerAnalyzeBid } from "@/lib/mock-api";
import { Bidder } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowRight, Users, Brain, Loader2, Calendar, Building, Sparkles
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";

export default function TenderEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tender, setTender] = useState<any | null>(null);
  const [biddersForTender, setBiddersForTender] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [t, biddersData] = await Promise.all([
        fetchTenderById(id),
        fetchBiddersForTender(id),
      ]);
      setTender(t);
      setBiddersForTender(biddersData);
    } catch (err) {
      console.warn("Error loading tender evaluation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRunAiVerification = async (bidSubmissionId: string) => {
    setAnalyzingId(bidSubmissionId);
    try {
      await triggerAnalyzeBid(bidSubmissionId);
      await loadData();
    } catch (err) {
      console.warn("AI verification error:", err);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading tender applications & bid submissions...</span>
      </div>
    );
  }

  if (!tender) return <div className="p-6 text-sm text-muted-foreground">Tender not found.</div>;

  const req = tender.extractedRequirements || {};
  const tenderNum = req.tender_number || tender.id;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/officer/tenders" className="text-muted-foreground hover:text-foreground">Tenders</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Bid Evaluation</span>
        </div>
        <PreviousButton fallbackHref="/officer/tenders" />
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground font-medium">{tenderNum}</span>
          <StatusBadge status={tender.status} size="sm" showIcon={false} />
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#1e3a5f] border-blue-200">
            Live Supabase Integration
          </Badge>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold leading-snug">Bid Evaluation — {tenderNum}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{tender.title}</p>
      </div>

      {/* Tender Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Estimated Value</p>
            <p className="text-base sm:text-lg font-bold truncate">
              {tender.estimatedValueFormatted || `₹${Number(tender.estimatedValue || 18500000).toLocaleString('en-IN')}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Applications Received</p>
            <p className="text-base sm:text-lg font-bold">{biddersForTender.length} Bidders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Organization</p>
            <p className="text-xs sm:text-sm font-semibold truncate mt-1 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-[#1e3a5f]" /> {tender.organization || "Government Procurement Department"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Closing Date</p>
            <p className="text-xs sm:text-sm font-bold mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              {tender.submissionDeadline
                ? new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : "2026-09-30"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bidder Comparison Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="font-semibold text-sm sm:text-base">Applicant Bidders (`public.bid_submissions`)</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-[#1e3a5f] px-2.5 py-1 rounded text-xs border border-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">AI Verification Engine (`POST /api/analysis/analyze-bid`)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Company Name</TableHead>
                <TableHead className="w-[140px]">Submission Status</TableHead>
                <TableHead className="w-[130px]">Submitted At</TableHead>
                <TableHead className="w-[110px]">AI Score</TableHead>
                <TableHead className="w-[120px]">AI Status</TableHead>
                <TableHead className="w-[160px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {biddersForTender.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-10">
                    No applications received yet for this tender.
                  </TableCell>
                </TableRow>
              ) : (
                biddersForTender.map((vendor: any) => {
                  const bidSubId = vendor.bidSubmissionId || vendor.id;
                  const submissionStatus = vendor.submissionStatus || "SUBMITTED";
                  const submittedAt = vendor.submittedAt || "Recent";
                  const aiScore = vendor.aiScore;
                  const aiStatus = vendor.aiVerificationStatus || "PENDING";
                  const isAnalyzing = analyzingId === bidSubId;

                  return (
                    <TableRow key={bidSubId}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                            {vendor.legalName || vendor.shortName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {vendor.shortName} • {vendor.state || "India"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            submissionStatus === "QUALIFIED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold text-[10px]"
                              : submissionStatus === "DISQUALIFIED"
                              ? "bg-red-50 text-red-800 border-red-300 font-semibold text-[10px]"
                              : submissionStatus === "UNDER_EVALUATION"
                              ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold text-[10px]"
                              : "bg-blue-50 text-blue-800 border-blue-300 font-semibold text-[10px]"
                          }
                        >
                          {submissionStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {submittedAt}
                      </TableCell>

                      <TableCell>
                        {aiScore !== undefined && aiScore !== null ? (
                          <div className="text-xs sm:text-sm font-bold text-emerald-700">
                            {aiScore}%
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not Run</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            aiStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              : "bg-slate-100 text-slate-700 border-slate-200 text-[10px]"
                          }
                        >
                          {aiStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            disabled={isAnalyzing}
                            onClick={() => handleRunAiVerification(bidSubId)}
                            className="bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1.5 whitespace-nowrap"
                          >
                            {isAnalyzing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Brain className="h-3.5 w-3.5" />
                            )}
                            {isAnalyzing ? "Analyzing..." : "Run AI Verification"}
                          </Button>
                          <Link href={`/officer/tenders/${id}/bidders/${vendor.id}`}>
                            <Button size="sm" variant="outline" className="text-xs gap-1">
                              View <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
