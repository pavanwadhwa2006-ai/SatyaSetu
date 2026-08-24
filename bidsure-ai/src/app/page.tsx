"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building2, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && role) {
      router.push(role === "officer" ? "/officer" : "/bidder");
    }
  }, [isAuthenticated, role, router]);

  const handleLogin = (selectedRole: "bidder" | "officer") => {
    login(selectedRole);
    router.push(selectedRole === "officer" ? "/officer" : "/bidder");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a5f] shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5f]">
          BidSure AI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          AI-Powered Bid Compliance Verification Platform
        </p>
      </div>

      {/* Login Options */}
      <div className="w-full max-w-md space-y-3">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Select your role to continue
        </p>

        <Card
          className="cursor-pointer border-2 border-transparent transition-all hover:border-[#1e3a5f]/30 hover:shadow-md"
          onClick={() => handleLogin("officer")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f]/10">
              <LayoutDashboard className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1e3a5f]">Procurement Officer</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluate bids, review compliance, and make procurement decisions
              </p>
            </div>
            <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45]">
              Enter
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 border-transparent transition-all hover:border-emerald-300 hover:shadow-md"
          onClick={() => handleLogin("bidder")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Building2 className="h-6 w-6 text-emerald-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">Bidder</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse tenders, submit bids, and upload compliance documents
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Enter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 max-w-md text-center">
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          Prototype for Smart India Hackathon 2026 · Problem Statement SIH26100
          <br />
          All data shown is synthetic and for demonstration purposes only.
          <br />
          Government verification sources are mock/prototype implementations.
        </p>
      </div>
    </div>
  );
}
