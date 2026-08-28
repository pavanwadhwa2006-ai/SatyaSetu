"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileSearch, AlertTriangle, Lightbulb, Gavel,
  Brain, FileText, Loader2, AlertCircle,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthCompliance,
  fetchGroundTruthBenchmarks,
  fetchGroundTruthEvidence,
  fetchGroundTruthRequirements,
} from "@/lib/api-client";

export default function BidderCompliancePage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [complianceList, setComplianceList] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, biddersData, compData, evData, reqData, benchData] = await Promise.all([
          fetchBackendTenderById(decodedId).catch(() => null),
          fetchGroundTruthBidders(),
          fetchGroundTruthCompliance(),
          fetchGroundTruthEvidence(),
          fetchGroundTruthRequirements(),
          fetchGroundTruthBenchmarks(),
        ]);

        setTender(tenderData);
        const bList = biddersData.items || [];
        const matchedBidder = bList.find(
          (b: any) => b.id === decodedBidderId || b.bidderCode === decodedBidderId
        ) || bList[0];
        setBidder(matchedBidder);

        if (matchedBidder) {
          const bidderComps = (compData.items || []).filter((c: any) => c.bidderId === matchedBidder.id);
          setComplianceList(bidderComps);

          const bidderEv = (evData.items || []).filter((e: any) => e.bidderId === matchedBidder.id);
          setEvidenceList(bidderEv);

          const tenderReqs = (reqData.items || []).filter(
            (r: any) => r.tenderId === matchedBidder.tenderId || (tenderData && (r.tenderId === tenderData.id || r.gemBidNumber === tenderData.tender_number))
          );
          setRequirements(tenderReqs);

          const matchedBench = (benchData.items || []).find(
            (bm: any) => bm.bidderId === matchedBidder.id || bm.bidderCode === matchedBidder.bidderCode
          );
          setBenchmark(matchedBench);
        }
      } catch (err: any) {
        console.error("Failed to load bidder compliance analysis:", err);
        setError(err.message || "Failed to load bidder data from backend API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedId, decodedBidderId]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading bidder compliance intelligence from backend...</p>
      </div>
    );
  }

  if (error || !bidder) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(decodedId)}`} />
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || "Bidder entity not found."}</span>
        </div>
      </div>
    );
  }

  const overallStatus = benchmark?.expectedOverallStatus || "REVIEW";
  const complianceScore = benchmark?.expectedComplianceScore || 0;
  const riskLevel = benchmark?.expectedRiskLevel || "MEDIUM";

  const scoreColor =
    complianceScore >= 90 ? "text-emerald-600" :
    complianceScore >= 80 ? "text-amber-600" :
    "text-red-600";

  const scoreBg =
    complianceScore >= 90 ? "bg-emerald-50 border-emerald-200" :
    complianceScore >= 80 ? "bg-amber-50 border-amber-200" :
    "bg-red-50 border-red-200";

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}`} className="text-muted-foreground hover:text-foreground">
            Bid Evaluation
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{bidder.shortName}</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}`} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {bidder.bidderCode}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {bidder.businessType}
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold">{bidder.legalName}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Registered: {bidder.registeredAddress}, {bidder.state} · PAN: {bidder.panNumber}
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Brain className="h-4 w-4 text-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground font-mono">Backend Intelligence Standard</span>
        </div>
      </div>

      {/* Score + Risk + Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className={`border ${scoreBg}`}>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Compliance Score</p>
            <p className={`text-2xl sm:text-3xl font-bold ${scoreColor}`}>{complianceScore}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={riskLevel} size="md" showIcon={false} />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Ground Truth Standard</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Status</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={overallStatus} size="md" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Requirements Breakdown</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2">
              <span className="text-xs"><span className="font-bold text-emerald-700">{benchmark?.expectedPassedCount || 0}</span> Pass</span>
              <span className="text-xs"><span className="font-bold text-red-700">{benchmark?.expectedFailedCount || 0}</span> Fail</span>
              <span className="text-xs"><span className="font-bold text-amber-700">{benchmark?.expectedReviewCount || 0}</span> Rev</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/officer/ground-truth`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileSearch className="h-3.5 w-3.5" /> Ground Truth Explorer
          </Button>
        </Link>
        <Link href={`/officer/audit`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Brain className="h-3.5 w-3.5" /> Audit Trails
          </Button>
        </Link>
        <Link href={`/officer/reports`}>
          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Full Tender Report
          </Button>
        </Link>
      </div>

      {/* Compliance Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b">
          <h2 className="font-semibold text-sm sm:text-base">Requirement-by-Requirement Compliance &amp; Evidence</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Req Code</TableHead>
                <TableHead className="min-w-[180px]">Requirement &amp; Rule</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Bidder Evidence</TableHead>
                <TableHead className="min-w-[200px]">Reasoning / Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((req) => {
                const comp = complianceList.find((c) => c.requirementId === req.id);
                const ev = evidenceList.find((e) => e.requirementId === req.id);
                const status = comp?.status || "REVIEW";

                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs font-bold text-[#1e3a5f]">{req.requirementCode}</TableCell>
                    <TableCell>
                      <div className="font-medium text-xs sm:text-sm">{req.requirementName}</div>
                      <div className="text-[11px] text-muted-foreground">{req.operator} {JSON.stringify(req.threshold)}</div>
                    </TableCell>
                    <TableCell><StatusBadge status={status} size="sm" /></TableCell>
                    <TableCell>
                      {ev ? (
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900">{ev.rawValue}</span>
                          {ev.documentName && (
                            <div className="flex items-center gap-1 text-[#1e3a5f] mt-0.5">
                              <FileText className="h-3 w-3 shrink-0" />
                              <span className="truncate">{ev.documentName}</span>
                              {ev.pageNumber && <span className="text-muted-foreground">(P.{ev.pageNumber})</span>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No document</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ev?.rawQuote ? `"${ev.rawQuote}"` : "Verified via canonical ground truth rules"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
