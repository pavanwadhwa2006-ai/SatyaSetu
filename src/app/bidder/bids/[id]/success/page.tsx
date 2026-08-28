"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { fetchBidSubmissionById, StoredBidSubmission } from "@/lib/api-client";

export default function BidSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submission, setSubmission] = useState<StoredBidSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmission() {
      try {
        const data = await fetchBidSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        console.warn("Could not fetch submission details on success page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubmission();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-6">
      <Card className="max-w-md w-full shadow-md">
        <CardContent className="p-5 sm:p-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-emerald-800">Bid Submitted Successfully</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-5 sm:mb-6">
            Your bid package and attached documentary evidence have been persisted in the database for procurement evaluation.
          </p>

          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2.5 text-left bg-muted/50 rounded-lg p-3.5 sm:p-4 mb-5 sm:mb-6 text-xs sm:text-sm border">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Submission ID</span>
                <span className="font-mono font-semibold text-[11px] truncate max-w-[200px]">
                  {submission?.id || id}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Tender</span>
                <span className="font-mono font-semibold text-slate-900">
                  {submission?.tender?.tender_number || submission?.tender_id || "GeM Procurement"}
                </span>
              </div>
              {submission?.vendor && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Bidding Entity</span>
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">
                    {submission.vendor.legal_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {submission?.status || "SUBMITTED"}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Link href="/bidder/bids" className="block w-full">
              <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] gap-2 text-xs sm:text-sm">
                View My Bids <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/bidder" className="block w-full">
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
