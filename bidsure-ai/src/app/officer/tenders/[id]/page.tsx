"use client";

import { use } from "react";
import Link from "next/link";
import { getTenderById } from "@/data/tenders";
import { getBidsByTender } from "@/data/bids";
import { getComplianceByTender } from "@/data/compliance";
import { riskAssessments } from "@/data/risk-and-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, IndianRupee, ArrowRight, Users, Brain,
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
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Bid Evaluation</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground">{tender.id}</span>
          <StatusBadge status={tender.status} size="sm" showIcon={false} />
          <Badge variant="outline" className="text-[10px]">Prototype Tender Data</Badge>
        </div>
        <h1 className="text-xl font-semibold">Bid Evaluation — {tender.id}</h1>
        <p className="text-sm text-muted-foreground">{tender.title}</p>
      </div>

      {/* Tender Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Estimated Value</p>
            <p className="text-lg font-bold">{tender.estimatedValueFormatted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bids Received</p>
            <p className="text-lg font-bold">{bids.length} Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Requirements</p>
            <p className="text-lg font-bold">{tender.requirements.length} Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="text-lg font-bold">
              {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bidder Comparison Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="font-semibold text-sm">Bidder Comparison</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span className="text-xs text-muted-foreground">AI Compliance Analysis</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bidder</TableHead>
              <TableHead className="w-[100px]">Compliance</TableHead>
              <TableHead className="w-[90px]">Risk</TableHead>
              <TableHead className="w-[80px]">Technical</TableHead>
              <TableHead className="w-[110px]">Commercial</TableHead>
              <TableHead className="w-[140px]">Mandatory Docs</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bidRows.map(({ bid, comp, risk }) => (
              <TableRow key={bid.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{bid.bidder.shortName}</p>
                    <p className="text-xs text-muted-foreground">{bid.bidder.state}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-bold ${
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
                  <span className="text-sm font-medium">{bid.commercial.totalAmountFormatted}</span>
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
                <TableCell>
                  <Link href={`/officer/tenders/${id}/bidders/${bid.bidderId}`}>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
