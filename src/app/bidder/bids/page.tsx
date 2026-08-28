"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, FileText, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchBidSubmissions, StoredBidSubmission } from "@/lib/api-client";

export default function MyBidsPage() {
  const [submissions, setSubmissions] = useState<StoredBidSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBids() {
      try {
        const data = await fetchBidSubmissions();
        if (data && data.items) {
          setSubmissions(data.items);
        }
      } catch (err) {
        console.warn("Failed to load live bid submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBids();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">My Bid Submissions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track and manage your submitted bids and draft proposals
          </p>
        </div>
        <Link href="/bidder/tenders">
          <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] text-white gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Browse Open Tenders
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
          <p className="text-sm text-muted-foreground">Loading your bid submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-sm text-slate-800">No bid submissions found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You have not created any bid submissions yet. Browse active government tenders and submit your bid package.
            </p>
            <Link href="/bidder/tenders">
              <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs mt-2">
                Browse Tenders
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const tenderNumber = sub.tender?.tender_number || sub.tender_id;
            const tenderTitle = sub.tender?.title || "Procurement Tender";
            const buyer = sub.tender?.organization || "Government Buyer";
            const vendorName = sub.vendor?.legal_name || "Authorized Vendor";
            const isSubmitted = sub.status === "SUBMITTED";

            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tenderNumber}
                        </span>
                        {isSubmitted ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[10px]">
                            Draft
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {sub.documents_count || sub.documents?.length || 0} Documents
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{tenderTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Buyer: {buyer} · Vendor: <strong>{vendorName}</strong>
                      </p>
                      {sub.submitted_at && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Submitted on: {new Date(sub.submitted_at).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/bidder/tenders/${encodeURIComponent(tenderNumber)}/bid?submission_id=${sub.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1 text-xs">
                        {isSubmitted ? "View Submission" : "Continue Draft"} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
