"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowRight, Users, Brain, Loader2, AlertCircle, FileText, CheckCircle2,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchTenderRequirements,
  fetchBidSubmissions,
  fetchGroundTruthBenchmarks,
  fetchGroundTruthBidders,
  BackendTender,
  StructuredRequirement,
  StoredBidSubmission,
  GroundTruthBenchmark,
} from "@/lib/api-client";

export default function TenderEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [tender, setTender] = useState<BackendTender | null>(null);
  const [requirements, setRequirements] = useState<StructuredRequirement[]>([]);
  const [submissions, setSubmissions] = useState<StoredBidSubmission[]>([]);
  const [benchmarks, setBenchmarks] = useState<GroundTruthBenchmark[]>([]);
  const [bidders, setBidders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, reqData, subData, benchData, bidderData] = await Promise.all([
          fetchBackendTenderById(decodedId),
          fetchTenderRequirements(decodedId).catch(() => ({ items: [], total: 0 })),
          fetchBidSubmissions().catch(() => ({ items: [], total: 0 })),
          fetchGroundTruthBenchmarks().catch(() => ({ items: [], total: 0 })),
          fetchGroundTruthBidders().catch(() => ({ items: [], total: 0 })),
        ]);

        setTender(tenderData);
        setRequirements(reqData.items || []);
        
        // Filter submissions for this tender
        const matchedSubs = (subData.items || []).filter(
          (s) =>
            s.tender_id === tenderData.id ||
            s.tender_id === tenderData.tender_number ||
            (s.tender && (s.tender.id === tenderData.id || s.tender.tender_number === tenderData.tender_number))
        );
        setSubmissions(matchedSubs);
        setBenchmarks(benchData.items || []);
        setBidders(bidderData.items || []);
      } catch (err: any) {
        console.error("Failed to load tender evaluation data:", err);
        setError(err.message || "Failed to load tender from backend.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedId]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading tender evaluation details from backend...</p>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <PreviousButton fallbackHref="/officer/tenders" />
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || "Tender not found in database."}</span>
        </div>
      </div>
    );
  }

  // Find ground truth bidders matching this tender
  const tenderGroundTruthBidders = bidders.filter(
    (b) =>
      b.tenderId === tender.id ||
      b.tenderId === tender.tender_number ||
      (tender.tender_number === "GEM/2026/B/7261466" && b.tenderId === "tender-t1") ||
      (tender.tender_number === "GEM/2026/B/7364888" && b.tenderId === "tender-t2") ||
      (tender.tender_number === "GEM/2026/B/7676747" && b.tenderId === "tender-t3")
  );

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
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
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
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
            GeM Public Dataset
          </Badge>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold leading-snug">{tender.title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Buyer: {tender.organization} {tender.department ? `· ${tender.department}` : ""} · Category: {tender.category}
        </p>
      </div>

      {/* Tender Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Estimated Value</p>
            <p className="text-base sm:text-lg font-bold truncate">₹{(tender.estimated_value / 100000).toFixed(2)} Lakh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Submissions in DB</p>
            <p className="text-base sm:text-lg font-bold">{submissions.length} Active Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Phase 5 Requirements</p>
            <p className="text-base sm:text-lg font-bold">{requirements.length} Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Submission Deadline</p>
            <p className="text-base sm:text-lg font-bold">
              {new Date(tender.submission_deadline).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bidder Comparison Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="font-semibold text-sm sm:text-base">Bidder Packages Associated with Tender</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span className="text-xs text-muted-foreground">Phase 3 Benchmark &amp; Submission Layer</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tenderGroundTruthBidders.length === 0 && submissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No bidder submissions currently recorded for this tender.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[170px]">Bidder Entity</TableHead>
                  <TableHead className="w-[110px]">Bidder Code</TableHead>
                  <TableHead className="w-[120px]">Business Type</TableHead>
                  <TableHead className="w-[110px]">State</TableHead>
                  <TableHead className="w-[140px]">Benchmark Status</TableHead>
                  <TableHead className="w-[100px] text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenderGroundTruthBidders.map((bidder) => {
                  const bench = benchmarks.find((b) => b.bidderId === bidder.id || b.bidderCode === bidder.bidderCode);

                  return (
                    <TableRow key={bidder.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">{bidder.legalName}</p>
                          <p className="text-[11px] text-muted-foreground">{bidder.shortName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">
                          {bidder.bidderCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{bidder.businessType}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{bidder.state}</TableCell>
                      <TableCell>
                        {bench ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              bench.expectedOverallStatus === "COMPLIANT"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : bench.expectedOverallStatus === "REVIEW"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {bench.expectedOverallStatus} ({bench.expectedComplianceScore}%)
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/officer/ground-truth`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/10">
                            <ArrowRight className="h-4 w-4" />
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

      {/* Structured Requirements from Tender Intelligence */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="font-semibold text-sm sm:text-base">Structured Tender Intelligence Requirements ({requirements.length})</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Phase 5 Normalized Engine</span>
        </div>
        <div className="overflow-x-auto">
          {requirements.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No structured requirements extracted for this tender yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead className="min-w-[180px]">Requirement</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead className="w-[80px]">Operator</TableHead>
                  <TableHead className="w-[120px]">Threshold</TableHead>
                  <TableHead className="w-[90px]">Mandatory</TableHead>
                  <TableHead className="min-w-[200px]">Evidence Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs font-bold text-[#1e3a5f]">{req.requirementCode}</TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-slate-900">{req.requirementName}</p>
                      <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1">{req.rawText}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium bg-slate-50">
                        {req.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{req.operator}</TableCell>
                    <TableCell className="font-medium text-xs text-slate-900">
                      {typeof req.threshold === "number" && req.threshold >= 10000
                        ? `₹${(req.threshold / 100000).toFixed(2)}L`
                        : JSON.stringify(req.threshold)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          req.isMandatory
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {req.isMandatory ? "Mandatory" : "Optional"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono text-[11px]">
                      {req.acceptableEvidenceTypes && req.acceptableEvidenceTypes.length > 0
                        ? req.acceptableEvidenceTypes.join(", ")
                        : "Documentary Proof"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
