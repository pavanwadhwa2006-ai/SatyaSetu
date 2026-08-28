"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBidSubmissionsForBidder } from "@/lib/mock-api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Send } from "lucide-react";

export default function MyBidsPage() {
  const { linkedVendor } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchBidSubmissionsForBidder(linkedVendor?.id).then((data) => {
      if (isMounted) {
        setBids(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [linkedVendor?.id]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f]">My Submitted Applications</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Track submitted bids, document verification status, and AI compliance results from Supabase
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
          <span className="text-xs">Loading submitted applications...</span>
        </div>
      ) : bids.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-[#1e3a5f]">
            <Send className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No applications submitted yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Browse open government tenders and apply with your company compliance documents.
          </p>
          <Link href="/bidder/tenders">
            <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1.5 mt-2">
              Browse Available Tenders <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const tenderObj = bid.tenders || {};
            const tenderId = tenderObj.id || bid.tender_id;
            const tenderTitle = tenderObj.title || `GeM Tender ${tenderObj.tender_number || tenderId}`;
            const submittedDate = bid.submitted_at ? new Date(bid.submitted_at).toLocaleDateString('en-IN') : "Recent";

            return (
              <Card key={bid.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground font-medium">
                          ID: {bid.id.slice(0, 16)}...
                        </span>
                        <StatusBadge status={bid.status || "UNDER_EVALUATION"} size="sm" />
                        {bid.ai_score && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300">
                            AI Score: {bid.ai_score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{tenderTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {submittedDate} {bid.ai_verification_status ? `· AI Status: ${bid.ai_verification_status}` : ""}
                      </p>
                    </div>
                    <Link href={`/bidder/bids/${bid.id}/success`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1 text-xs">
                        View Application <ArrowRight className="h-3.5 w-3.5" />
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
