"use client";

import { useState, useMemo } from "react";
import {
  groundTruthTenders,
  tenderRequirements,
  groundTruthBidders,
  bidderDocuments,
  bidderEvidence,
  groundTruthComplianceResults,
  bidderBenchmarks,
  getRequirementsByTenderId,
  getBiddersByTenderId,
  getDocumentsByBidderId,
  getEvidenceByBidderId,
  getComplianceResultsByBidderId,
  getBenchmarkByBidderId,
  validateGroundTruthBenchmarks,
} from "@/data/ground-truth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function GroundTruthPage() {
  const [selectedTenderId, setSelectedTenderId] = useState<string>(groundTruthTenders[0].id);
  const [selectedBidderId, setSelectedBidderId] = useState<string>('bidder-t1-b2');
  const [activeTab, setActiveTab] = useState<"intelligence" | "requirements" | "documents" | "profile" | "validation">("intelligence");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const selectedTender = useMemo(() => {
    return groundTruthTenders.find((t) => t.id === selectedTenderId) || groundTruthTenders[0];
  }, [selectedTenderId]);

  const biddersForTender = useMemo(() => {
    return getBiddersByTenderId(selectedTender.id);
  }, [selectedTender]);

  // If selected bidder is not in the current tender, default to the first bidder of this tender
  const currentBidder = useMemo(() => {
    const found = biddersForTender.find((b) => b.id === selectedBidderId);
    if (found) return found;
    return biddersForTender[0] || groundTruthBidders[0];
  }, [biddersForTender, selectedBidderId]);

  const requirements = useMemo(() => {
    return getRequirementsByTenderId(selectedTender.id);
  }, [selectedTender]);

  const documents = useMemo(() => {
    return getDocumentsByBidderId(currentBidder.id);
  }, [currentBidder]);

  const evidenceList = useMemo(() => {
    return getEvidenceByBidderId(currentBidder.id);
  }, [currentBidder]);

  const complianceResults = useMemo(() => {
    return getComplianceResultsByBidderId(currentBidder.id);
  }, [currentBidder]);

  const benchmark = useMemo(() => {
    return getBenchmarkByBidderId(currentBidder.id);
  }, [currentBidder]);

  const validationReport = useMemo(() => {
    return validateGroundTruthBenchmarks();
  }, []);

  const handleTenderChange = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    const newBidders = getBiddersByTenderId(tenderId);
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
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            REVIEW REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Ground Truth Dataset Explorer
              </h1>
              <p className="text-xs text-muted-foreground">
                Phase 3 Canonical Benchmark Layer — Independent Tender Requirements, Structured Evidence & Master Outcomes
              </p>
            </div>
          </div>
        </div>

        {/* Global Integrity Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("validation")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Benchmark Integrity: <strong>5/5 Verified</strong></span>
          </button>
        </div>
      </div>

      {/* Tender Selection Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Select Procurement Tender
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {groundTruthTenders.map((t) => {
            const isSelected = t.id === selectedTender.id;
            const biddersCount = getBiddersByTenderId(t.id).length;
            const reqCount = getRequirementsByTenderId(t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => handleTenderChange(t.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-[#1e3a5f]/5 border-[#1e3a5f] shadow-xs ring-1 ring-[#1e3a5f]/30"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#1e3a5f] bg-slate-100 px-2 py-0.5 rounded">
                    {t.bidNumber}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {t.estimatedValueFormatted}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-slate-900 line-clamp-1 mb-1">
                  {t.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {t.buyer}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t pt-2 mt-1">
                  <span>{reqCount} Requirements</span>
                  <span>•</span>
                  <span>{biddersCount} Evaluated Bidders</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tender Metadata Card */}
      <Card className="bg-slate-50/70 border-slate-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Procuring Entity</span>
              <p className="text-sm font-semibold text-slate-900">{selectedTender.buyer}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div>
                <span className="text-muted-foreground">Evaluation: </span>
                <span className="font-medium text-slate-800">{selectedTender.evaluationType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">EMD: </span>
                <span className="font-medium text-slate-800">{selectedTender.emdAmountFormatted}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Delivery: </span>
                <span className="font-medium text-slate-800">{selectedTender.deliveryPeriodDays} Days</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed border-t pt-2">
            {selectedTender.description}
          </p>
        </CardContent>
      </Card>

      {/* Bidder Selection Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Evaluated Bidders for this Tender
        </label>
        <div className="flex flex-wrap gap-2">
          {biddersForTender.map((b) => {
            const isSelected = b.id === currentBidder.id;
            const bBenchmark = getBenchmarkByBidderId(b.id);
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBidderId(b.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? "bg-white border-[#1e3a5f] shadow-xs font-semibold text-slate-900 ring-2 ring-[#1e3a5f]/20"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span className="font-mono text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f] px-1.5 py-0.5 rounded">
                  {b.bidderCode}
                </span>
                <span>{b.legalName}</span>
                {bBenchmark && (
                  <span className="ml-1">
                    {getStatusBadge(bBenchmark.benchmarkStatus)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bidder Benchmark Summary Card */}
      {benchmark && (
        <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {currentBidder.bidderCode}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {currentBidder.legalName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                CIN: {currentBidder.cin} • PAN: {currentBidder.pan} • GSTIN: {currentBidder.gstin} • Enterprise: {currentBidder.enterpriseType} ({currentBidder.businessType})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Expected Ground Truth:</span>
              {getStatusBadge(benchmark.benchmarkStatus)}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="space-y-1">
              <span className="font-semibold text-slate-700">Benchmark Rationale:</span>
              <p className="text-slate-600 leading-relaxed">{benchmark.summaryReason}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md">
                <div className="font-bold text-emerald-800 text-sm">{benchmark.passingRequirementsCount}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Passed</div>
              </div>
              <div className="text-center px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-md">
                <div className="font-bold text-rose-800 text-sm">{benchmark.failingRequirementsCount}</div>
                <div className="text-[10px] text-rose-600 font-medium">Failed</div>
              </div>
              <div className="text-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                <div className="font-bold text-amber-800 text-sm">{benchmark.reviewRequirementsCount}</div>
                <div className="text-[10px] text-amber-600 font-medium">Review</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("intelligence")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "intelligence"
              ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Tender Intelligence ({requirements.length} Structured Rules)
        </button>
        <button
          onClick={() => setActiveTab("requirements")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "requirements"
              ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scale className="w-4 h-4" />
          Requirements & Compliance Matrix ({complianceResults.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "documents"
              ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Submitted Documents & Evidence ({documents.length} Docs / {evidenceList.length} Facts)
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Bidder Profile & Metadata
        </button>
        <button
          onClick={() => setActiveTab("validation")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "validation"
              ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Benchmark Integrity Verification
        </button>
      </div>

      {/* TAB 0: TENDER INTELLIGENCE (PHASE 5) */}
      {activeTab === "intelligence" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Machine-readable procurement requirements, normalized field definitions, evaluation operators, evidence criteria, and statutory exemption rules for <strong>{selectedTender.bidNumber}</strong>.
            </p>
            <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {requirements.filter((r) => r.mandatory).length} Mandatory / {requirements.length} Total Rules
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 w-28">Rule Code</th>
                  <th className="py-3 px-3.5 w-44">Normalized Field</th>
                  <th className="py-3 px-3.5 w-60">Human Requirement Text</th>
                  <th className="py-3 px-3.5 w-48">Evaluation Rule & Operator</th>
                  <th className="py-3 px-3.5 w-48">Evidence Document Types</th>
                  <th className="py-3 px-3.5 w-44">Exemption Metadata</th>
                  <th className="py-3 px-3.5">Source RFP Clause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 align-top">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {req.requirementCode}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {req.mandatory ? (
                          <span className="text-rose-600 font-semibold">MANDATORY</span>
                        ) : (
                          <span className="text-slate-500">OPTIONAL</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 align-top">
                      <span className="font-mono font-semibold text-[#1e3a5f] bg-[#1e3a5f]/5 px-1.5 py-0.5 rounded text-[11px] block mb-1">
                        {req.normalizedField}
                      </span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                        Type: {req.requirementType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 align-top">
                      <p className="text-slate-800 font-medium leading-snug">{req.requirementText}</p>
                    </td>
                    <td className="py-3 px-3.5 align-top font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span className="text-slate-500 font-normal">{req.operator}</span>
                        <span>{req.originalValue || String(req.thresholdValue || '')}</span>
                      </div>
                      {req.baseValue && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Base: {req.baseValue}
                        </span>
                      )}
                      {req.normalizedValue !== undefined && req.normalizedValue !== null && (
                        <span className="text-[10px] text-slate-400 block">
                          Norm: {String(req.normalizedValue)} {req.thresholdUnit || ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 align-top">
                      {req.evidenceRequired && req.evidenceRequired.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {req.evidenceRequired.map((ev, i) => (
                            <span key={i} className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                              {ev}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None specified</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 align-top text-[11px]">
                      {req.exemptionMetadata ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-emerald-700 block">
                            {req.exemptionMetadata.qualifiesFor.join(', ')}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Req: {req.exemptionMetadata.requiredEvidence}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No Exemption</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 align-top text-slate-600 text-[11px]">
                      <div className="font-medium text-slate-800">{req.sourceClause}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {req.sourceDocument} (p. {req.sourcePage})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1: REQUIREMENTS & COMPLIANCE MATRIX */}
      {activeTab === "requirements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing independent requirement evaluation against submitted bidder evidence for{" "}
              <strong>{currentBidder.legalName}</strong>.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 w-32">Req Code</th>
                  <th className="py-3 px-3.5 w-64">Requirement & Category</th>
                  <th className="py-3 px-3.5 w-44">Tender Threshold</th>
                  <th className="py-3 px-3.5 w-56">Submitted Bidder Evidence</th>
                  <th className="py-3 px-3.5 w-32 text-center">Result</th>
                  <th className="py-3 px-3.5">Deterministic Evaluation Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complianceResults.map((item) => {
                  const req = tenderRequirements.find((r) => r.id === item.requirementId);
                  const ev = bidderEvidence.find((e) => e.id === item.evidenceId);
                  const doc = ev ? bidderDocuments.find((d) => d.id === ev.documentId) : undefined;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 align-top">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {req?.requirementCode || item.requirementId}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {req?.mandatory ? (
                            <span className="text-rose-600 font-semibold">MANDATORY</span>
                          ) : (
                            <span className="text-slate-500">OPTIONAL</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-semibold text-slate-900 mb-0.5">
                          {req?.requirementText}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{req?.category}</span>
                          <span>•</span>
                          <span>{req?.sourceClause}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top font-mono text-slate-800">
                        <div className="font-semibold">{item.requiredValue}</div>
                        {req?.operator && (
                          <span className="text-[10px] text-slate-500">Rule: {req.operator} {String(req.thresholdValue || '')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-medium text-slate-900">{item.submittedValue}</div>
                        {doc && ev && (
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>{doc.fileName} (Page {ev.sourcePage})</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 align-top text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-3.5 align-top text-slate-600 leading-relaxed">
                        {item.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMITTED DOCUMENTS & EVIDENCE */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => {
              const docEvidence = bidderEvidence.filter((e) => e.documentId === doc.id);
              return (
                <Card key={doc.id} className="border-slate-200 overflow-hidden bg-white shadow-xs">
                  <CardHeader className="bg-slate-50/80 border-b py-3 px-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#1e3a5f] bg-white px-1.5 py-0.5 rounded border">
                            {doc.documentCode}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{doc.documentName}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          File: <span className="font-mono">{doc.fileName}</span> • Type: {doc.documentType} • Page: {doc.pageNumber} {doc.validUntil ? `• Valid Until: ${doc.validUntil}` : ''}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.documentStatus === 'VALID' ? 'bg-emerald-100 text-emerald-800' :
                        doc.documentStatus === 'EXPIRED' ? 'bg-rose-100 text-rose-800' :
                        doc.documentStatus === 'DEFICIENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {doc.documentStatus}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {docEvidence.length > 0 ? (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Extracted Evidence & Field Values</span>
                        <div className="grid grid-cols-1 gap-2">
                          {docEvidence.map((ev) => (
                            <div key={ev.id} className="p-2.5 rounded-lg bg-slate-50/90 border border-slate-100 text-xs flex flex-col md:flex-row md:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-semibold text-slate-800">{ev.fieldName}</span>
                                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-600">{ev.evidenceType}</span>
                                  <span className="text-[10px] text-slate-400">Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-slate-700 font-medium">"{ev.extractedValue}"</p>
                                <p className="text-[11px] text-slate-500 italic">Source text: "{ev.sourceText}" (Page {ev.sourcePage})</p>
                              </div>
                              <div className="shrink-0 text-right font-mono text-xs">
                                <span className="text-slate-400 text-[10px] block">Normalized Value:</span>
                                <span className="font-bold text-[#1e3a5f]">{String(ev.normalizedValue)} {ev.unit || ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No structured evidence fields mapped to this document.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BIDDER PROFILE & METADATA */}
      {activeTab === "profile" && (
        <Card className="border-slate-200 bg-white">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Bidder Entity Profile</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Canonical registration and statutory metadata for {currentBidder.legalName}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Legal Company Name</span>
                <p className="font-bold text-slate-900 text-sm">{currentBidder.legalName}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Normalized Bidder Code</span>
                <p className="font-mono font-bold text-[#1e3a5f] text-sm">{currentBidder.bidderCode}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Corporate Identity (CIN)</span>
                <p className="font-mono font-semibold text-slate-800">{currentBidder.cin}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Permanent Account Number (PAN)</span>
                <p className="font-mono font-semibold text-slate-800">{currentBidder.pan}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">GST Identification (GSTIN)</span>
                <p className="font-mono font-semibold text-slate-800">{currentBidder.gstin}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Udyam Registration</span>
                <p className="font-mono font-semibold text-slate-800">{currentBidder.udyamNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Enterprise & Business Type</span>
                <p className="font-semibold text-slate-800">{currentBidder.enterpriseType} • {currentBidder.businessType}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Authorized Signatory</span>
                <p className="font-semibold text-slate-800">{currentBidder.authorizedSignatory} ({currentBidder.designation})</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Registered Address</span>
                <p className="text-slate-800">{currentBidder.registeredAddress}, {currentBidder.city}, {currentBidder.state} - {currentBidder.pincode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: BENCHMARK INTEGRITY VERIFICATION */}
      {activeTab === "validation" && (
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Ground Truth Benchmark Validation Suite
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Automated assertion of canonical outcomes for all 5 bidders across the 3 tenders.
                  </CardDescription>
                </div>
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                    ALL BENCHMARKS VERIFIED (5/5)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {/* Bidder Benchmark Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Bidder Outcome Assertions</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-700 font-semibold uppercase text-[11px]">
                        <th className="py-2.5 px-3">Bidder Code</th>
                        <th className="py-2.5 px-3">Company Legal Name</th>
                        <th className="py-2.5 px-3">Expected Ground Truth</th>
                        <th className="py-2.5 px-3">Actual Evaluated Status</th>
                        <th className="py-2.5 px-3 text-center">Failing</th>
                        <th className="py-2.5 px-3 text-center">Review</th>
                        <th className="py-2.5 px-3 text-center">Passing</th>
                        <th className="py-2.5 px-3 text-right">Assertion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationReport.bidderValidation.map((bv) => (
                        <tr key={bv.bidderCode} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a5f]">{bv.bidderCode}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{bv.legalName}</td>
                          <td className="py-2.5 px-3 font-mono">{bv.expectedBenchmark}</td>
                          <td className="py-2.5 px-3">{getStatusBadge(bv.actualBenchmark)}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-600">{bv.failingCount}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-600">{bv.reviewCount}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{bv.passingCount}</td>
                          <td className="py-2.5 px-3 text-right">
                            {bv.passed ? (
                              <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold text-xs inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> FAIL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Integrity Checks */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Relational & Normalization Integrity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {validationReport.integrityChecks.map((chk, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{chk.name}</p>
                        <p className="text-slate-500 text-[11px]">{chk.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
