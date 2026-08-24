"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getComplianceByBidder } from "@/data/compliance";
import { getRiskByBidder } from "@/data/risk-and-recommendations";
import { getBidByBidderAndTender } from "@/data/bids";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, FileSearch, AlertTriangle, Lightbulb, Gavel, ScrollText,
  Brain, FileText,
} from "lucide-react";

export default function BidderCompliancePage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const compliance = getComplianceByBidder(bidderId);
  const risk = getRiskByBidder(bidderId);
  const bid = getBidByBidderAndTender(bidderId, id);

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
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}`} className="text-muted-foreground hover:text-foreground">Bid Evaluation</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{bidder.shortName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bidder Compliance Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground">AI Compliance Analysis</span>
        </div>
      </div>

      {/* Score + Risk + Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={`border ${scoreBg}`}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Compliance Score</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{compliance.complianceScore}</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={risk?.riskLevel ?? "LOW"} size="lg" showIcon={false} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{risk?.riskScore ?? 0} / 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Status</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={compliance.overallStatus} size="lg" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Requirements</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-xs"><span className="font-bold text-emerald-700">{compliance.passedRequirements}</span> Pass</span>
              <span className="text-xs"><span className="font-bold text-red-700">{compliance.failedRequirements}</span> Fail</span>
              <span className="text-xs"><span className="font-bold text-amber-700">{compliance.reviewRequirements}</span> Review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/documents`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSearch className="h-3.5 w-3.5" /> Document Verification
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/verification`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> AI Verification
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/risk`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Risk Analysis
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/recommendation`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" /> AI Recommendation
          </Button>
        </Link>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/decision`}>
          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1.5">
            <Gavel className="h-3.5 w-3.5" /> Final Decision
          </Button>
        </Link>
      </div>

      {/* Compliance Table */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Requirement-by-Requirement Compliance</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requirement</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[60px]">Conf.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compliance.items.map((item) => (
              <TableRow key={item.requirementId}>
                <TableCell className="font-medium text-sm">{item.requirementName}</TableCell>
                <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                <TableCell>
                  {item.evidenceDocument ? (
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-[#1e3a5f]">
                        <FileText className="h-3 w-3" />
                        {item.evidenceDocument}
                      </div>
                      {item.evidencePage && (
                        <span className="text-muted-foreground"> — Page {item.evidencePage}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No document</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                  {item.reason}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium ${
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
      </Card>
    </div>
  );
}
