"use client";

import { use } from "react";
import Link from "next/link";
import { getTenderById } from "@/data/tenders";
import { getBidsByTender } from "@/data/bids";
import { getComplianceByTender } from "@/data/compliance";
import { riskAssessments } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowRight, Users, Brain,
} from "lucide-react";

export default function TenderEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tender = getTenderById(id);
  const bids = getBidsByTender(id);
  const compliance = getComplianceByTender(id);

  if (!tender) return <div className="p-6">Tender not found.</div>;

  const bidRows = bids.map((bid) => {
    const comp = compliance.find((c) => c.bidderId === bid.bidderId);
    const risk = riskAssessments.find((r) => r.bidderId === bid.bidderId);
    return { bid, comp, risk };
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">Bid Evaluation</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground font-medium">{tender.id}</span>
          <StatusBadge status={tender.status} size="sm" showIcon={false} />
          <Badge variant="outline" className="text-[10px]">Prototype Tender Data</Badge>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold leading-snug">Bid Evaluation — {tender.id}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{tender.title}</p>
      </div>

      {/* Tender Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Estimated Value</p>
            <p className="text-base sm:text-lg font-bold truncate">{tender.estimatedValueFormatted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Bids Received</p>
            <p className="text-base sm:text-lg font-bold">{bids.length} Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Requirements</p>
            <p className="text-base sm:text-lg font-bold">{tender.requirements.length} Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="text-base sm:text-lg font-bold">
              {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bidder Comparison Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="font-semibold text-sm sm:text-base">Bidder Comparison</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span className="text-xs text-muted-foreground">AI Compliance Analysis</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[170px]">Bidder</TableHead>
                <TableHead className="w-[100px]">Compliance</TableHead>
                <TableHead className="w-[90px]">Risk</TableHead>
                <TableHead className="w-[80px]">Technical</TableHead>
                <TableHead className="w-[110px]">Commercial</TableHead>
                <TableHead className="min-w-[130px]">Mandatory Docs</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[70px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidRows.map(({ bid, comp, risk }) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium leading-snug">{bid.bidder.shortName}</p>
                      <p className="text-[11px] text-muted-foreground">{bid.bidder.state}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`text-xs sm:text-sm font-bold ${
                        (comp?.complianceScore ?? 0) >= 90 ? "text-emerald-700" :
                        (comp?.complianceScore ?? 0) >= 80 ? "text-amber-700" :
                        "text-red-700"
                      }`}>
                        {comp?.complianceScore ?? 0}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk?.riskLevel ?? 'LOW'} size="sm" showIcon={false} />
                  </TableCell>
                  <TableCell>
                    {comp?.items.find(i => i.requirementId === 'REQ-008')?.status === 'PASS' ? (
                      <StatusBadge status="PASS" size="sm" />
                    ) : comp?.items.find(i => i.requirementId === 'REQ-008')?.status === 'REVIEW' ? (
                      <StatusBadge status="REVIEW" size="sm" />
                    ) : (
                      <StatusBadge status="FAIL" size="sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{bid.commercial.totalAmountFormatted}</span>
                  </TableCell>
                  <TableCell>
                    {(comp?.failedRequirements ?? 0) > 0 ? (
                      <span className="text-xs text-red-700 font-medium">
                        {comp?.items.find(i => i.status === 'FAIL')?.requirementName === 'OEM Authorization Certificate' ? 'Missing OEM' : 
                         comp?.items.find(i => i.status === 'FAIL')?.requirementName === 'Minimum Turnover' ? 'Turnover below' :
                         `${comp?.failedRequirements} Failed`}
                      </span>
                    ) : (comp?.reviewRequirements ?? 0) > 0 ? (
                      <span className="text-xs text-amber-700 font-medium">GST mismatch</span>
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium">Complete</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={comp?.overallStatus ?? 'PASS'} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/officer/tenders/${id}/bidders/${bid.bidderId}`}>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/10">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
