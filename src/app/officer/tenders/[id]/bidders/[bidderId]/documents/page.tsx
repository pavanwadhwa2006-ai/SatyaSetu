"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileSearch, AlertTriangle, Brain, Loader2, AlertCircle,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthDocuments,
} from "@/lib/api-client";

export default function DocumentVerificationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, biddersData, docsData] = await Promise.all([
          fetchBackendTenderById(decodedId).catch(() => null),
          fetchGroundTruthBidders(),
          fetchGroundTruthDocuments(),
        ]);

        setTender(tenderData);
        const bList = biddersData.items || [];
        const matchedBidder = bList.find(
          (b: any) => b.id === decodedBidderId || b.bidderCode === decodedBidderId
        ) || bList[0];
        setBidder(matchedBidder);

        if (matchedBidder) {
          const bidderDocs = (docsData.items || []).filter((d: any) => d.bidderId === matchedBidder.id);
          setDocuments(bidderDocs);
        }
      } catch (err: any) {
        console.error("Failed to load bidder documents:", err);
        setError(err.message || "Failed to load documents from backend.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedId, decodedBidderId]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading documents from backend...</p>
      </div>
    );
  }

  if (error || !bidder) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(decodedId)}/bidders/${encodeURIComponent(decodedBidderId)}`} />
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || "Bidder entity not found."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}`} className="text-muted-foreground hover:text-foreground">
            Evaluation
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} className="text-muted-foreground hover:text-foreground">
            {bidder.shortName}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Documents</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#1e3a5f]" />
            Document Intelligence &amp; Evidence Packages
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Brain className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground">Phase 4 Synthetic PDF Dataset</span>
        </div>
      </div>

      {/* Document Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Document</TableHead>
                <TableHead className="w-[140px]">Document Type</TableHead>
                <TableHead className="w-[100px]">Pages</TableHead>
                <TableHead className="w-[100px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium leading-snug">{doc.documentName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{doc.filename || doc.documentName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      {doc.documentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{doc.pageCount} page{doc.pageCount > 1 ? "s" : ""}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-[#1e3a5f]" onClick={() => setSelectedDoc(doc)}>
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">{selectedDoc?.documentName}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Document Type</span>
                <span className="font-mono">{selectedDoc.documentType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Filename</span>
                <span className="font-mono">{selectedDoc.filename || selectedDoc.documentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Pages</span>
                <span>{selectedDoc.pageCount}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border text-slate-700">
                Watermarked with <code>*** SYNTHETIC DATA — FOR HACKATHON DEMONSTRATION ONLY ***</code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
