"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function BidSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSubmission() {
      try {
        const { data } = await supabase
          .from("bid_submissions")
          .select("*, tenders(*)")
          .eq("id", id)
          .maybeSingle();

        if (isMounted && data) {
          setSubmission(data);
        }
      } catch (err) {
        console.warn("Could not load bid submission detail from Supabase:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSubmission();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
        <span className="text-xs">Loading submission summary...</span>
      </div>
    );
  }

  const tenderObj = submission?.tenders || {};
  const tenderNum = tenderObj.tender_number || tenderObj.id || "GeM Tender";

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-5 sm:p-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-emerald-800">Bid Application Submitted</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-5 sm:mb-6">
            Your bid application and documents have been uploaded to Supabase & sent for AI compliance verification.
          </p>

          <div className="space-y-2.5 text-left bg-slate-50 rounded-lg p-3.5 sm:p-4 mb-5 sm:mb-6 text-xs sm:text-sm border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Submission ID</span>
              <span className="font-mono font-medium text-slate-800 truncate max-w-[180px]">{id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tender Number</span>
              <span className="font-mono font-medium text-slate-800">{tenderNum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Evaluation Status</span>
              <span className={`inline-flex items-center gap-1 font-bold ${
                submission?.status === "DISQUALIFIED" || (submission?.ai_score && submission.ai_score < 75)
                  ? "text-red-600"
                  : submission?.status === "CLARIFICATION_REQUESTED"
                  ? "text-amber-600"
                  : "text-emerald-700"
              }`}>
                {submission?.status === "DISQUALIFIED" || (submission?.ai_score && submission.ai_score < 75) ? (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[11px] uppercase font-bold">
                    DISQUALIFIED
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {submission?.status || "UNDER_EVALUATION"}
                  </>
                )}
              </span>
            </div>
            {submission?.ai_score !== undefined && submission?.ai_score !== null && (
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-muted-foreground font-medium">AI Verification Score</span>
                <span className={`font-bold ${
                  submission.ai_score < 75 ? "text-red-600" : "text-emerald-700"
                }`}>{submission.ai_score}%</span>
              </div>
            )}
          </div>

          <Link href="/bidder" className="block w-full">
            <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] gap-2 text-xs sm:text-sm">
              Return to Bidder Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
