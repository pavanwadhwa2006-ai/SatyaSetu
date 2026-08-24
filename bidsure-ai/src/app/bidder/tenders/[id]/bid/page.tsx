"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getTenderById } from "@/data/tenders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2, FileText, IndianRupee, Upload, CheckCircle2, AlertCircle,
  ArrowLeft, ArrowRight, Send, Loader2,
} from "lucide-react";
import Link from "next/link";

const STEPS = ["Company Details", "Technical Response", "Commercial Bid", "Required Documents", "Review & Submit"];

const documentTypes = [
  "PAN Certificate", "GST Certificate", "Udyam Certificate", "Company Registration",
  "Turnover Certificate", "Experience Certificate", "OEM Authorization",
  "Technical Compliance Sheet", "Product Datasheet", "Warranty Declaration",
  "Delivery Undertaking", "MII Declaration",
];

export default function BidSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tender = getTenderById(id);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    legalName: "ABC Engineering Pvt. Ltd.",
    pan: "AABCA1234B",
    gstin: "07AABCA1234B1ZP",
    udyam: "UDYAM-DL-07-0012345",
    regNumber: "U29100DL2010PTC123456",
    address: "42, Industrial Area Phase II, Okhla",
    state: "Delhi",
    representative: "Rajesh Kumar Sharma",
    productModel: "ThermoTrack Pro X500",
    specifications: "Industrial RTD sensors, -200°C to +850°C, ±0.1°C accuracy, IP67 rated",
    deliveryPeriod: "90",
    warranty: "36",
    experience: "14 years with 45+ completed projects for NTPC, BHEL, IOCL, SAIL",
    quotedAmount: "15400000",
    taxPercentage: "18",
  });

  if (!tender) return <div className="p-6">Tender not found.</div>;

  const handleUpload = (docType: string) => {
    setUploading(docType);
    setTimeout(() => {
      setUploadedDocs((prev) => new Set(prev).add(docType));
      setUploading(null);
    }, 800);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      router.push(`/bidder/bids/BID-DEMO-001/success`);
    }, 1200);
  };

  const taxAmount = Math.round(Number(form.quotedAmount) * Number(form.taxPercentage) / 100);
  const totalAmount = Number(form.quotedAmount) + taxAmount;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/bidder" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/bidder/tenders/${id}`} className="text-muted-foreground hover:text-foreground">{id}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Submit Bid</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold">Bid Submission</h1>
        <p className="text-sm text-muted-foreground">{tender.title}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === step ? "bg-[#1e3a5f] text-white" :
                i < step ? "bg-emerald-100 text-emerald-700" :
                "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <CheckCircle2 className="h-3 w-3" /> : <span className="w-4 text-center">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Legal Name</Label><Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="mt-1" /></div>
              <div><Label>PAN</Label><Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} className="mt-1" /></div>
              <div><Label>GSTIN</Label><Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} className="mt-1" /></div>
              <div><Label>Udyam Number</Label><Input value={form.udyam} onChange={(e) => setForm({ ...form, udyam: e.target.value })} className="mt-1" /></div>
              <div><Label>Registration Number</Label><Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} className="mt-1" /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
              <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1" /></div>
              <div><Label>Authorized Representative</Label><Input value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} className="mt-1" /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div><Label>Product Model</Label><Input value={form.productModel} onChange={(e) => setForm({ ...form, productModel: e.target.value })} className="mt-1" /></div>
              <div><Label>Technical Specifications</Label><Textarea value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} className="mt-1" rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Delivery Period (days)</Label><Input value={form.deliveryPeriod} onChange={(e) => setForm({ ...form, deliveryPeriod: e.target.value })} className="mt-1" /></div>
                <div><Label>Warranty (months)</Label><Input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Relevant Experience</Label><Textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="mt-1" rows={2} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Quoted Amount (₹)</Label><Input value={form.quotedAmount} onChange={(e) => setForm({ ...form, quotedAmount: e.target.value })} className="mt-1" /></div>
                <div><Label>Tax (%)</Label><Input value={form.taxPercentage} onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })} className="mt-1" /></div>
                <div>
                  <Label>Total Amount (₹)</Label>
                  <div className="mt-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-semibold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Quoted amount should be exclusive of taxes. GST will be calculated separately as per applicable rates.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Upload all required documents. Each document will be processed by Document Intelligence for extraction and verification.
              </p>
              {documentTypes.map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc}</span>
                  </div>
                  {uploadedDocs.has(doc) ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Uploaded
                    </Badge>
                  ) : uploading === doc ? (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleUpload(doc)}>
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Review Your Bid</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{form.legalName}</p>
                    <p className="text-xs text-muted-foreground">PAN: {form.pan} · GSTIN: {form.gstin}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Commercial</p>
                    <p className="text-sm font-medium">Total: ₹{totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">Quoted: ₹{Number(form.quotedAmount).toLocaleString('en-IN')} + {form.taxPercentage}% GST</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Technical</p>
                    <p className="text-sm font-medium">{form.productModel}</p>
                    <p className="text-xs text-muted-foreground">Delivery: {form.deliveryPeriod} days · Warranty: {form.warranty} months</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Documents</p>
                    <p className="text-sm font-medium">{uploadedDocs.size} / {documentTypes.length} uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedDocs.size === documentTypes.length ? "All documents uploaded" : `${documentTypes.length - uploadedDocs.size} remaining`}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Submitting..." : "Submit Bid"}
          </Button>
        )}
      </div>
    </div>
  );
}
