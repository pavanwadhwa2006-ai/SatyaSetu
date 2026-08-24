"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getDocumentsByBidder } from "@/data/documents";
import { getVerificationsByBidder } from "@/data/verification";
import { Card, CardContent } from "@/components/ui/card";
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
  FileSearch, ArrowLeft, AlertTriangle, CheckCircle2, Brain,
} from "lucide-react";
import { BidDocument, VerificationRecord } from "@/types";

export default function DocumentVerificationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const documents = getDocumentsByBidder(bidderId);
  const verifications = getVerificationsByBidder(bidderId);
  const [selectedDoc, setSelectedDoc] = useState<BidDocument | null>(null);

  if (!bidder) return <div className="p-6">Bidder not found.</div>;

  const getVerification = (doc: BidDocument): VerificationRecord | undefined => {
    if (doc.type === "GST_CERTIFICATE") return verifications.find(v => v.verificationType === "GST");
    if (doc.type === "PAN_CERTIFICATE") return verifications.find(v => v.verificationType === "PAN");
    if (doc.type === "UDYAM_CERTIFICATE") return verifications.find(v => v.verificationType === "UDYAM");
    return undefined;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}`} className="text-muted-foreground hover:text-foreground">Evaluation</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Documents</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-[#1e3a5f]" />
            Document Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground">AI Document Analysis</span>
        </div>
      </div>

      {/* Document Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead className="w-[100px]">Extraction</TableHead>
              <TableHead className="w-[100px]">Verification</TableHead>
              <TableHead className="w-[80px]">Confidence</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className={doc.verificationStatus === "REVIEW" ? "bg-amber-50/50" : doc.verificationStatus === "FAIL" ? "bg-red-50/30" : ""}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{doc.typeName}</p>
                    <p className="text-xs text-muted-foreground">{doc.fileName} · {doc.pageCount} page{doc.pageCount > 1 ? "s" : ""}</p>
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={doc.extractionStatus} size="sm" showIcon={false} /></TableCell>
                <TableCell><StatusBadge status={doc.verificationStatus} size="sm" /></TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold ${doc.confidence >= 95 ? "text-emerald-700" : doc.confidence >= 85 ? "text-amber-700" : "text-red-700"}`}>
                    {doc.confidence}%
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedDoc(doc)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Document Detail Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedDoc && (() => {
            const ver = getVerification(selectedDoc);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base">{selectedDoc.typeName}</DialogTitle>
                  <p className="text-xs text-muted-foreground">{selectedDoc.fileName}</p>
                </DialogHeader>

                {/* Extracted Data */}
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Brain className="h-3 w-3" /> Document Extracted Data
                  </h3>
                  <div className="rounded-md border p-3 space-y-2">
                    {selectedDoc.extractedFields.map((field) => (
                      <div key={field.fieldName} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{field.fieldName}</span>
                        <span className="font-medium">{field.extractedValue}</span>
                      </div>
                    ))}
                    {selectedDoc.extractedFields.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No structured fields extracted</p>
                    )}
                  </div>
                </div>

                {/* Verification Data */}
                {ver && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" /> {ver.sourceLabel}
                      </h3>
                      <Badge variant="outline" className="text-[9px] mb-2 bg-amber-50 text-amber-700 border-amber-200">
                        {ver.verificationSource}
                      </Badge>
                      <div className="rounded-md border p-3 space-y-2">
                        {Object.entries(ver.verificationData).map(([key, value]) => {
                          const submitted = ver.submittedData[key];
                          const mismatch = submitted && submitted !== value;
                          return (
                            <div key={key} className={`flex justify-between text-sm ${mismatch ? "bg-red-50 -mx-2 px-2 py-1 rounded" : ""}`}>
                              <span className="text-muted-foreground">{key}</span>
                              <span className={`font-medium ${mismatch ? "text-red-700" : ""}`}>{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Discrepancies */}
                    {ver.discrepancies.length > 0 && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3">
                        <p className="text-xs font-semibold text-red-800 mb-1">Detected Issues</p>
                        {ver.discrepancies.map((d, i) => (
                          <p key={i} className="text-xs text-red-700">{d}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Result */}
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">Verification Result</span>
                  <StatusBadge status={selectedDoc.verificationStatus} size="md" />
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
