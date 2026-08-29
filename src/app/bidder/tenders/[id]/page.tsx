"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { fetchTenderById } from "@/lib/mock-api";
import { getDynamicTenderRequirements } from "@/lib/tender-requirements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  FileText, IndianRupee, CheckCircle2,
  Send, Shield, Sparkles, Building, Calendar, Clock, DollarSign, Loader2, FileCheck
} from "lucide-react";

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tender, setTender] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTenderById(id).then((t) => {
      if (isMounted) {
        setTender(t);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading tender requirement summary...</span>
      </div>
    );
  }

  if (!tender) {
    return <div className="p-6">Tender not found.</div>;
  }

  const dynamicReqs = getDynamicTenderRequirements(tender);
  const req = tender.extractedRequirements || tender.extracted_requirements || {};
  const minTurnover = req.minimum_turnover || tender.estimatedValue * 2.5 || 50000000;
  const emdVal = req.emd_amount || tender.emdAmount || 370000;
  const deadlineStr = req.submission_deadline
    ? String(req.submission_deadline).split('T')[0]
    : new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

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
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#1e3a5f] border-blue-200">
              Live Supabase Integration
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold leading-snug">{req.tender_title || tender.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span>{req.organization || tender.organization}</span>
            {req.department && <span>• {req.department}</span>}
          </p>
        </div>
        <Link href={`/bidder/tenders/${tender.id}/apply`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45] gap-2 shrink-0">
            <Send className="h-4 w-4" />
            Apply for Tender
          </Button>
        </Link>
      </div>

      {/* AI Requirement Extraction Banner */}
      <Card className="p-4 bg-slate-900 text-white border-[#1e3a5f] space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
          <Sparkles className="h-4 w-4" />
          <span>AI-Generated Tender Requirement Summary</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {req.description || tender.description}
        </p>
      </Card>

      {/* Overview Grid */}
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
              { label: "Tender ID / Number", value: req.tender_number || tender.id },
              { label: "Organization", value: req.organization || tender.organization },
              { label: "Department", value: req.department || tender.department },
              { label: "Category", value: req.category || tender.category },
              { label: "Evaluation Type", value: tender.evaluationType || "QCBS" },
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
              { label: "Estimated Value", value: `₹${Number(req.estimated_value || tender.estimatedValue).toLocaleString('en-IN')}` },
              { label: "EMD Amount", value: `₹${Number(emdVal).toLocaleString('en-IN')}` },
              { label: "Submission Deadline", value: deadlineStr },
              { label: "Delivery Period", value: `${req.delivery_period_days || tender.deliveryPeriodDays} days` },
              { label: "Warranty Required", value: `${req.warranty_months || tender.warrantyMonths} months` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Required Documents Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            Required Documents Checklist ({dynamicReqs.length})
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Bidders must upload valid copies of the following documents extracted directly from the published tender terms.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dynamicReqs.map((reqItem) => (
              <div key={reqItem.id} className="flex items-start gap-2.5 rounded-md border p-3.5 bg-card hover:border-[#1e3a5f]/40 transition-colors space-y-1">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{reqItem.title}</p>
                    <Badge variant="outline" className={`text-[9px] ${reqItem.mandatory ? 'bg-red-50 text-red-700 border-red-200 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {reqItem.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-blue-900 bg-blue-50/70 border border-blue-100 rounded px-2 py-1">
                    <span className="text-slate-500 font-medium">Expected Document: </span>
                    <strong className="text-[#1e3a5f] font-semibold">{reqItem.expectedDocument}</strong>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{reqItem.tooltip || reqItem.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1e3a5f]" />
            Eligibility & Compliance Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Minimum Financial Turnover
              </span>
              <p className="text-base font-bold text-slate-800">₹{Number(minTurnover).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-blue-600" /> Max Delivery Period
              </span>
              <p className="text-base font-bold text-slate-800">{req.delivery_period_days || tender.deliveryPeriodDays} Days</p>
            </div>
            <div className="p-3 bg-slate-50 rounded border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Required Warranty
              </span>
              <p className="text-base font-bold text-slate-800">{req.warranty_months || tender.warrantyMonths} Months</p>
            </div>
          </div>

          {req.eligibility_conditions?.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                Technical Qualification Standards:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {req.eligibility_conditions.map((cond: string, idx: number) => (
                  <li key={idx}>{cond}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Participation Callout */}
      <Card className="p-4 bg-blue-50/50 border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-[#1e3a5f]">Ready to Submit Your Bid?</p>
          <p className="text-muted-foreground">Upload required document checklist and complete bid participation.</p>
        </div>
        <Link href={`/bidder/tenders/${tender.id}/apply`}>
          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1.5 text-xs whitespace-nowrap">
            <Send className="h-3.5 w-3.5" /> Submit Application
          </Button>
        </Link>
      </Card>
    </div>
  );
}
