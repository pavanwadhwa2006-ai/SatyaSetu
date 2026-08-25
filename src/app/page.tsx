"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, LayoutDashboard } from "lucide-react";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      {/* Branding */}
      <div className="mb-6 sm:mb-8 text-center max-w-sm sm:max-w-md">
        <div className="relative mx-auto mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20">
          <Image
            src="/satyaseetu-logo.png"
            alt="Satyaseetu Logo"
            fill
            sizes="80px"
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1e3a5f]">
          SatyaSetu
        </h1>
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground px-2">
          AI-Powered Bid Compliance Verification Platform
        </p>
      </div>

      {/* Login Options */}
      <div className="w-full max-w-md space-y-3">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">
          Select your role to continue
        </p>

        <Card
          className="cursor-pointer border-2 border-transparent transition-all hover:border-[#1e3a5f]/30 hover:shadow-md active:scale-[0.99]"
          onClick={() => handleLogin("officer")}
        >
          <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f]/10">
              <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-[#1e3a5f]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-[#1e3a5f]">Procurement Officer</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                Evaluate bids, review compliance, and make procurement decisions
              </p>
            </div>
            <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] shrink-0 text-xs sm:text-sm">
              Enter
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 border-transparent transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
          onClick={() => handleLogin("bidder")}
        >
          <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-emerald-800">Bidder</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                Browse tenders, submit bids, and upload compliance documents
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0 text-xs sm:text-sm">
              Enter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 sm:mt-8 max-w-md text-center px-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 leading-relaxed">
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
