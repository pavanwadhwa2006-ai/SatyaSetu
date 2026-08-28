"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { fetchBidderById, triggerAnalyzeBid } from "@/lib/mock-api";
import { Bidder } from "@/types";
import { getComplianceByBidder } from "@/data/compliance";
import { getRiskByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileSearch, AlertTriangle, Lightbulb, Gavel,
  Brain, FileText, Loader2, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

import { PreviousButton } from "@/components/shared/previous-button";

export default function BidderCompliancePage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const compliance = getComplianceByBidder(bidderId);
  const risk = getRiskByBidder(bidderId);

  useEffect(() => {
    let isMounted = true;
    fetchBidderById(bidderId).then((b) => {
      if (isMounted) {
        setBidder(b || getBidderById(bidderId) || null);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [bidderId]);

  const handleRunAnalyzeBid = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await triggerAnalyzeBid(bidderId);
      if (res) {
        setAnalysisResult(res);
      } else {
        setAnalysisError("Failed to fetch analysis result from backend API.");
      }
    } catch (err: any) {
      setAnalysisError(err?.message || "An unexpected error occurred while calling the backend analysis API.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading bidder compliance profile...</span>
      </div>
    );
  }

  if (!bidder || !compliance) return <div className="p-6">Bidder not found.</div>;

  const scoreColor =
    compliance.complianceScore >= 90 ? "text-emerald-600" :
    compliance.complianceScore >= 80 ? "text-amber-600" :
    "text-red-600";

  const scoreBg =
    compliance.complianceScore >= 90 ? "bg-emerald-50 border-emerald-200" :
    compliance.complianceScore >= 80 ? "bg-amber-50 border-amber-200" :
    "bg-red-50 border-red-200";

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${id}`} className="text-muted-foreground hover:text-foreground">Bid Evaluation</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{bidder.shortName}</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${id}`} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Bidder Compliance Analysis</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            disabled={analyzing}
            onClick={handleRunAnalyzeBid}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1.5"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {analyzing ? "Analyzing Bid..." : "Run Analyze Bid"}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {analysisError && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-800 text-xs sm:text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{analysisError}</span>
          </div>
        </Card>
      )}

      {/* Live Backend Analysis Results Card (Populated upon running backend analysis) */}
      {analysisResult && (
        <Card className="p-4 sm:p-5 border-2 border-[#1e3a5f]/20 bg-slate-50/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#1e3a5f]" />
              <h2 className="font-semibold text-sm sm:text-base text-[#1e3a5f]">
                Live Backend Analysis Output (`POST /api/analysis/analyze-bid`)
              </h2>
            </div>
            <Badge
              className={
                analysisResult.recommendation === "AUTO_APPROVE"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold"
                  : analysisResult.recommendation === "HUMAN_REVIEW"
                  ? "bg-amber-100 text-amber-800 border-amber-300 font-semibold"
                  : "bg-red-100 text-red-800 border-red-300 font-semibold"
              }
            >
              Recommendation: {analysisResult.recommendation}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="text-muted-foreground">Risk Score</span>
              <p className="text-lg font-bold text-slate-800">{analysisResult.risk_score} / 100</p>
            </div>
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="text-muted-foreground">Documents Processed</span>
              <p className="text-lg font-bold text-slate-800">{analysisResult.documents_processed} Files</p>
            </div>
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="text-muted-foreground">Name Consistency</span>
              <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                {analysisResult.name_consistency?.passed ? (
                  <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Passed</span>
                ) : (
                  <span className="text-red-700 flex items-center gap-1"><XCircle className="h-4 w-4" /> Discrepancy</span>
                )}
              </p>
            </div>
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="text-muted-foreground">Missing Documents</span>
              <p className="text-xs font-medium mt-1 text-slate-700">
                {analysisResult.missing_documents?.length > 0
                  ? analysisResult.missing_documents.join(", ")
                  : "None (All Present)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* PAN Check */}
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="font-semibold text-slate-700">PAN Verification</span>
              <div className="text-muted-foreground">Number: <span className="font-mono font-medium text-foreground">{analysisResult.pan?.number || "N/A"}</span></div>
              <div className="text-muted-foreground">Format Valid: <span className="font-semibold text-foreground">{analysisResult.pan?.format_valid ? "Yes" : "No"}</span></div>
              <div className="text-muted-foreground">Status: <span className="font-medium text-emerald-700">{analysisResult.pan?.status}</span></div>
            </div>

            {/* GST Check */}
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="font-semibold text-slate-700">GSTIN Verification</span>
              <div className="text-muted-foreground">GSTIN: <span className="font-mono font-medium text-foreground">{analysisResult.gst?.gstin || "N/A"}</span></div>
              <div className="text-muted-foreground">Format Valid: <span className="font-semibold text-foreground">{analysisResult.gst?.format_valid ? "Yes" : "No"}</span></div>
              <div className="text-muted-foreground">Status: <span className="font-medium text-emerald-700">{analysisResult.gst?.status}</span></div>
            </div>

            {/* Turnover Check */}
            <div className="bg-white p-3 rounded border space-y-1">
              <span className="font-semibold text-slate-700">Turnover Result</span>
              <div className="text-muted-foreground">Required: <span className="font-medium text-foreground">₹{Number(analysisResult.turnover?.required || 0).toLocaleString('en-IN')}</span></div>
              <div className="text-muted-foreground">Actual: <span className="font-medium text-foreground">₹{Number(analysisResult.turnover?.actual || 0).toLocaleString('en-IN')}</span></div>
              <div className="text-muted-foreground">Eligible: <span className={`font-semibold ${analysisResult.turnover?.eligible ? "text-emerald-700" : "text-red-700"}`}>{analysisResult.turnover?.eligible ? "Yes (Pass)" : "No (Fail)"}</span></div>
            </div>
          </div>
        </Card>
      )}

      {/* Score + Risk + Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className={`border ${scoreBg}`}>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Compliance Score</p>
            <p className={`text-2xl sm:text-3xl font-bold ${scoreColor}`}>{compliance.complianceScore}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={risk?.riskLevel ?? "LOW"} size="md" showIcon={false} />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{risk?.riskScore ?? 0} / 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Status</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={compliance.overallStatus} size="md" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Requirements</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2">
              <span className="text-xs"><span className="font-bold text-emerald-700">{compliance.passedRequirements}</span> Pass</span>
              <span className="text-xs"><span className="font-bold text-red-700">{compliance.failedRequirements}</span> Fail</span>
              <span className="text-xs"><span className="font-bold text-amber-700">{compliance.reviewRequirements}</span> Rev</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons (Scrollable / Wrapping) */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/documents`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileSearch className="h-3.5 w-3.5" /> Document Verification
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/verification`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Brain className="h-3.5 w-3.5" /> AI Verification
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/risk`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" /> Risk Analysis
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/recommendation`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Lightbulb className="h-3.5 w-3.5" /> AI Recommendation
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/decision`}>
          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1.5 text-xs">
            <Gavel className="h-3.5 w-3.5" /> Final Decision
          </Button>
        </Link>
      </div>

      {/* Compliance Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b">
          <h2 className="font-semibold text-sm sm:text-base">Requirement-by-Requirement Compliance</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Requirement</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Evidence</TableHead>
                <TableHead className="min-w-[200px]">Reason</TableHead>
                <TableHead className="w-[60px] text-right">Conf.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compliance.items.map((item) => (
                <TableRow key={item.requirementId}>
                  <TableCell className="font-medium text-xs sm:text-sm">{item.requirementName}</TableCell>
                  <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                  <TableCell>
                    {item.evidenceDocument ? (
                      <div className="text-xs">
                        <div className="flex items-center gap-1 text-[#1e3a5f]">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.evidenceDocument}</span>
                        </div>
                        {item.evidencePage && (
                          <span className="text-muted-foreground">Page {item.evidencePage}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No document</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-xs font-semibold ${
                      item.confidence >= 95 ? "text-emerald-700" :
                      item.confidence >= 85 ? "text-amber-700" :
                      "text-red-700"
                    }`}>
                      {item.confidence}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
