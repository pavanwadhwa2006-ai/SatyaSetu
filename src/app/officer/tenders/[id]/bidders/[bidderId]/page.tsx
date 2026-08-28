"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getComplianceByBidder } from "@/data/compliance";
import { getRiskByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileSearch, AlertTriangle, Lightbulb, Gavel,
  Brain, FileText,
} from "lucide-react";

import { PreviousButton } from "@/components/shared/previous-button";

export default function BidderCompliancePage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const compliance = getComplianceByBidder(bidderId);
  const risk = getRiskByBidder(bidderId);

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
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Brain className="h-4 w-4 text-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground">AI Compliance Analysis</span>
        </div>
      </div>

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
