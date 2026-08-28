"use client";

import { useState, useMemo, useEffect } from "react";
import {
  fetchGroundTruthTenders,
  fetchGroundTruthBidders,
  fetchGroundTruthRequirements,
  fetchGroundTruthDocuments,
  fetchGroundTruthEvidence,
  fetchGroundTruthCompliance,
  fetchGroundTruthBenchmarks,
  fetchGroundTruthValidation,
} from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  FileCheck2,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Building2,
  Scale,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function GroundTruthPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [bidders, setBidders] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [complianceResults, setComplianceResults] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [validationReport, setValidationReport] = useState<any>(null);

  const [selectedTenderId, setSelectedTenderId] = useState<string>("");
  const [selectedBidderId, setSelectedBidderId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"intelligence" | "requirements" | "documents" | "profile" | "validation">("intelligence");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroundTruthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, bRes, rRes, dRes, eRes, cRes, bmRes, vRes] = await Promise.all([
        fetchGroundTruthTenders(),
        fetchGroundTruthBidders(),
        fetchGroundTruthRequirements(),
        fetchGroundTruthDocuments(),
        fetchGroundTruthEvidence(),
        fetchGroundTruthCompliance(),
        fetchGroundTruthBenchmarks(),
        fetchGroundTruthValidation().catch(() => null),
      ]);

      const tList = tRes.items || [];
      const bList = bRes.items || [];
      setTenders(tList);
      setBidders(bList);
      setRequirements(rRes.items || []);
      setDocuments(dRes.items || []);
      setEvidenceList(eRes.items || []);
      setComplianceResults(cRes.items || []);
      setBenchmarks(bmRes.items || []);
      setValidationReport(vRes);

      if (tList.length > 0 && !selectedTenderId) {
        setSelectedTenderId(tList[0].id);
      }
      if (bList.length > 0 && !selectedBidderId) {
        setSelectedBidderId(bList[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load Ground Truth API data:", err);
      setError(err.message || "Failed to fetch Ground Truth datasets from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroundTruthData();
  }, []);

  const selectedTender = useMemo(() => {
    return tenders.find((t) => t.id === selectedTenderId) || tenders[0];
  }, [tenders, selectedTenderId]);

  const biddersForTender = useMemo(() => {
    if (!selectedTender) return [];
    return bidders.filter((b) => b.tenderId === selectedTender.id);
  }, [bidders, selectedTender]);

  const currentBidder = useMemo(() => {
    const found = biddersForTender.find((b) => b.id === selectedBidderId);
    if (found) return found;
    return biddersForTender[0] || bidders[0];
  }, [biddersForTender, bidders, selectedBidderId]);

  const currentRequirements = useMemo(() => {
    if (!selectedTender) return [];
    return requirements.filter((r) => r.tenderId === selectedTender.id);
  }, [requirements, selectedTender]);

  const currentDocuments = useMemo(() => {
    if (!currentBidder) return [];
    return documents.filter((d) => d.bidderId === currentBidder.id);
  }, [documents, currentBidder]);

  const currentEvidence = useMemo(() => {
    if (!currentBidder) return [];
    return evidenceList.filter((e) => e.bidderId === currentBidder.id);
  }, [evidenceList, currentBidder]);

  const currentCompliance = useMemo(() => {
    if (!currentBidder) return [];
    return complianceResults.filter((c) => c.bidderId === currentBidder.id);
  }, [complianceResults, currentBidder]);

  const currentBenchmark = useMemo(() => {
    if (!currentBidder) return null;
    return benchmarks.find((b) => b.bidderId === currentBidder.id || b.bidderCode === currentBidder.bidderCode);
  }, [benchmarks, currentBidder]);

  const handleTenderChange = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    const newBidders = bidders.filter((b) => b.tenderId === tenderId);
    if (newBidders.length > 0) {
      setSelectedBidderId(newBidders[0].id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {status}
          </span>
        );
      case "NON_COMPLIANT":
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {status}
          </span>
        );
      case "REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading Ground Truth datasets from backend API...</p>
      </div>
    );
  }

  if (error || !selectedTender) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error || "Could not load Ground Truth dataset from backend."}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadGroundTruthData} className="text-xs">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#1e3a5f]" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Canonical Ground Truth &amp; Benchmark Explorer
            </h1>
            <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
              FASTAPI LIVE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ground Truth standard linking tender requirements with structured bidder evidence from backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadGroundTruthData} className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tender & Bidder Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Tender Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1e3a5f]" />
            Select Canonical Tender:
          </label>
          <select
            value={selectedTender.id}
            onChange={(e) => handleTenderChange(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#1e3a5f]"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.bidNumber} — {t.title.substring(0, 60)}...
              </option>
            ))}
          </select>
        </div>

        {/* Bidder Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#1e3a5f]" />
            Select Canonical Bidder Entity:
          </label>
          <div className="flex gap-2">
            {biddersForTender.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBidderId(b.id)}
                className={`flex-1 p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                  currentBidder?.id === b.id
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-mono text-[10px] opacity-80">{b.bidderCode}</div>
                <div className="truncate font-semibold">{b.shortName}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Entity Banner */}
      {selectedTender && currentBidder && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedTender.bidNumber}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="font-semibold text-slate-900 text-sm">{selectedTender.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">Buyer: {selectedTender.buyer}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Estimated Tender Value</div>
              <div className="text-sm font-bold text-slate-900">{selectedTender.estimatedValueFormatted}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                {currentBidder.bidderCode.split("-")[1] || "B"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-sm">{currentBidder.legalName}</h2>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                    {currentBidder.bidderCode}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentBidder.businessType} · {currentBidder.state}
                </p>
              </div>
            </div>

            {currentBenchmark && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">Master Ground Truth Verdict</div>
                  <div className="mt-0.5">{getStatusBadge(currentBenchmark.expectedOverallStatus)}</div>
                </div>
                <div className="text-right border-l pl-3">
                  <div className="text-[11px] text-muted-foreground">Compliance Score</div>
                  <div className="text-sm font-bold text-emerald-700">{currentBenchmark.expectedComplianceScore}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("intelligence")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "intelligence"
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Compliance &amp; Evidence Intelligence
        </button>
        <button
          onClick={() => setActiveTab("requirements")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "requirements"
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Tender Requirements ({currentRequirements.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "documents"
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Bidder Synthetic Documents ({currentDocuments.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "profile"
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Entity Profile &amp; Solvency
        </button>
        <button
          onClick={() => setActiveTab("validation")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "validation"
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Benchmark Validation Suite (5/5)
        </button>
      </div>

      {/* Tab 1: Compliance & Evidence Intelligence */}
      {activeTab === "intelligence" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 bg-slate-50/50 border-b">
              <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1e3a5f]" />
                Requirement-by-Requirement Evidence &amp; Compliance Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b text-slate-700 font-semibold uppercase text-[11px]">
                      <th className="py-2.5 px-3">Req Code</th>
                      <th className="py-2.5 px-3">Requirement &amp; Rule</th>
                      <th className="py-2.5 px-3">Bidder Extracted Evidence</th>
                      <th className="py-2.5 px-3">Document Source</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRequirements.map((req) => {
                      const comp = currentCompliance.find((c) => c.requirementId === req.id);
                      const ev = currentEvidence.find((e) => e.requirementId === req.id);
                      const status = comp?.status || "REVIEW";

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a5f] align-top">
                            {req.requirementCode}
                          </td>
                          <td className="py-2.5 px-3 align-top max-w-xs">
                            <div className="font-semibold text-slate-900">{req.requirementName}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Condition: <span className="font-mono">{req.operator} {JSON.stringify(req.threshold)}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top max-w-xs">
                            {ev ? (
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900">{ev.rawValue}</div>
                                <div className="text-[11px] text-slate-500 italic line-clamp-2">
                                  &ldquo;{ev.rawQuote}&rdquo;
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No evidence provided</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top text-[11px] text-slate-600">
                            {ev?.documentId ? (
                              <div>
                                <div className="font-medium text-slate-800">{ev.documentName || "PDF Document"}</div>
                                <div className="text-slate-400">Page {ev.pageNumber} · Conf: {(ev.confidence * 100).toFixed(0)}%</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top text-center">
                            {getStatusBadge(status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Requirements */}
      {activeTab === "requirements" && (
        <Card>
          <CardHeader className="py-3 px-4 bg-slate-50/50 border-b">
            <CardTitle className="text-xs sm:text-sm font-semibold">Tender Specifications &amp; Clauses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {currentRequirements.map((r) => (
              <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#1e3a5f]">{r.requirementCode}</span>
                  <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                </div>
                <h3 className="font-semibold text-xs text-slate-900">{r.requirementName}</h3>
                <p className="text-xs text-slate-600">{r.rawText}</p>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Evaluation: <code className="text-slate-800">{r.operator} {JSON.stringify(r.threshold)}</code> {r.unit || ""}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Documents */}
      {activeTab === "documents" && (
        <Card>
          <CardHeader className="py-3 px-4 bg-slate-50/50 border-b">
            <CardTitle className="text-xs sm:text-sm font-semibold">Synthetic Bidder PDF Package</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {currentDocuments.map((doc) => (
              <div key={doc.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{doc.documentName}</div>
                    <div className="text-[11px] text-muted-foreground">Type: {doc.documentType} · Pages: {doc.pageCount}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Synthesized PDF
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Entity Profile */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader className="py-3 px-4 bg-slate-50/50 border-b">
            <CardTitle className="text-xs sm:text-sm font-semibold">Bidder Legal &amp; Financial Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Legal Name:</span>
                <p className="font-semibold text-slate-900">{currentBidder?.legalName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Business Structure:</span>
                <p className="font-semibold text-slate-900">{currentBidder?.businessType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">PAN &amp; GSTIN:</span>
                <p className="font-semibold font-mono text-slate-900">{currentBidder?.panNumber} / {currentBidder?.gstin}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registered Address:</span>
                <p className="font-semibold text-slate-900">{currentBidder?.registeredAddress}, {currentBidder?.state}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Validation Suite */}
      {activeTab === "validation" && (
        <Card>
          <CardHeader className="py-3 px-4 bg-slate-50/50 border-b">
            <CardTitle className="text-xs sm:text-sm font-semibold">Master Benchmark Validation Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-700 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Bidder Code</th>
                    <th className="py-2.5 px-3">Company Legal Name</th>
                    <th className="py-2.5 px-3">Expected Ground Truth</th>
                    <th className="py-2.5 px-3">Compliance Score</th>
                    <th className="py-2.5 px-3">Pass / Fail / Rev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benchmarks.map((bm) => (
                    <tr key={bm.bidderCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a5f]">{bm.bidderCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{bm.bidderName}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(bm.expectedOverallStatus)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{bm.expectedComplianceScore}%</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="text-emerald-700 font-semibold">{bm.expectedPassedCount} P</span> /{" "}
                        <span className="text-rose-700 font-semibold">{bm.expectedFailedCount} F</span> /{" "}
                        <span className="text-amber-700 font-semibold">{bm.expectedReviewCount} R</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
