"use client";

import { use } from "react";
import Link from "next/link";
import { getTenderById } from "@/data/tenders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  FileText, IndianRupee, CheckCircle2,
  Send, Shield,
} from "lucide-react";

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tender = getTenderById(id);

  if (!tender) {
    return <div className="p-6">Tender not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/bidder" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/bidder/tenders" className="text-muted-foreground hover:text-foreground">Tenders</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{tender.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground font-medium">{tender.id}</span>
            <StatusBadge status={tender.status} size="sm" showIcon={false} />
            <Badge variant="outline" className="text-[10px]">Prototype Tender Data</Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold leading-snug">{tender.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tender.description}</p>
        </div>
        <Link href={`/bidder/tenders/${tender.id}/bid`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45] gap-2 shrink-0">
            <Send className="h-4 w-4" />
            Participate in Tender
          </Button>
        </Link>
      </div>

      {/* Tender Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1e3a5f]" />
              Tender Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Tender ID", value: tender.id },
              { label: "Organization", value: tender.organization },
              { label: "Department", value: tender.department },
              { label: "Category", value: tender.category },
              { label: "Evaluation Type", value: tender.evaluationType },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[#1e3a5f]" />
              Commercial & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Estimated Value", value: tender.estimatedValueFormatted },
              { label: "EMD Amount", value: tender.emdAmountFormatted },
              { label: "Submission Deadline", value: new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: "Bid Validity", value: `${tender.bidValidityDays} days` },
              { label: "Delivery Period", value: `${tender.deliveryPeriodDays} days` },
              { label: "Warranty Required", value: `${tender.warrantyMonths} months` },
              { label: "Delivery Location", value: tender.deliveryLocation },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Requirements Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1e3a5f]" />
            Eligibility &amp; Required Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All mandatory requirements must be satisfied for bid qualification.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tender.requirements.map((req) => (
              <div key={req.id} className="flex items-start gap-2.5 rounded-md border p-3 bg-card">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">{req.name}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{req.description}</p>
                  <div className="mt-1.5">
                    {req.isMandatory ? (
                      <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200">MANDATORY</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">{req.category}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
