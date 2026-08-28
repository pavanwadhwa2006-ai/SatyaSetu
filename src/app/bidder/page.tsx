"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTenders, fetchBidSubmissionsForBidder } from "@/lib/mock-api";
import { useAuth } from "@/contexts/auth-context";
import { Tender } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  FileText, Send, Clock, AlertCircle, Building2,
  Calendar, IndianRupee, ArrowRight, Loader2, CheckCircle2, ShieldCheck
} from "lucide-react";

export default function BidderDashboard() {
  const { linkedVendor } = useAuth();
  const [tenderList, setTenderList] = useState<Tender[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchTenders(),
      fetchBidSubmissionsForBidder(linkedVendor?.id),
    ]).then(([tendersData, appsData]) => {
      if (isMounted) {
        setTenderList(tendersData);
        setMyApplications(appsData);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [linkedVendor?.id]);

  const vendorName = linkedVendor?.display_name || "Apex Creative Solutions";
  const appCount = myApplications.length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Welcome, <span className="text-[#1e3a5f]">{vendorName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Bidder Portal · Participate in tenders & track AI compliance evaluations
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 self-start sm:self-auto">
          Live Supabase Integration
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f]">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{tenderList.length}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Available Tenders</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">{appCount}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">My Applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">
                {myApplications.filter((a) => a.status === "UNDER_EVALUATION" || a.status === "SUBMITTED").length}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Under Evaluation</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold leading-tight">
                {myApplications.filter((a) => a.status === "QUALIFIED").length}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Qualified Bids</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Submitted Applications Section */}
      {myApplications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-[#1e3a5f]">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> My Submitted Applications ({myApplications.length})
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {myApplications.map((app) => {
              const tenderObj = app.tenders || {};
              return (
                <Card key={app.id} className="border-l-4 border-l-[#1e3a5f] hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-medium text-muted-foreground">
                            Sub ID: {app.id.slice(0, 18)}...
                          </span>
                          <StatusBadge status={app.status || "UNDER_EVALUATION"} size="sm" />
                          {app.ai_score && (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300">
                              AI Score: {app.ai_score}%
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-slate-900">
                          {tenderObj.title || `GeM Tender ${tenderObj.tender_number || app.tender_id}`}
                        </h3>
                        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          <span>Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : "Recent"}</span>
                          {app.ai_verification_status && <span>AI Status: <strong>{app.ai_verification_status}</strong></span>}
                        </p>
                      </div>
                      <Link href={`/bidder/bids/${app.id}/success`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1 self-start sm:self-auto shrink-0">
                          View Application <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tenders */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">Available Open Tenders</h2>
          <Link href="/bidder/tenders">
            <Button variant="ghost" size="sm" className="text-xs text-[#1e3a5f] hover:text-[#152a45]">
              View All Tenders <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading tenders...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {tenderList.map((tender) => (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono text-muted-foreground font-medium">
                          {tender.id}
                        </span>
                        <StatusBadge status={tender.status} size="sm" showIcon={false} />
                      </div>
                      <h3 className="font-semibold text-sm leading-snug">
                        {tender.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tender.organization}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Deadline: {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                          {tender.estimatedValueFormatted}
                        </span>
                      </div>
                    </div>
                    <Link href={`/bidder/tenders/${tender.id}/apply`} className="w-full sm:w-auto">
                      <Button size="sm" className="w-full sm:w-auto shrink-0 bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1 mt-1 sm:mt-0">
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
