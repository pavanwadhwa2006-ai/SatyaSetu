"use client";

import { useState, useEffect } from "react";
import { useAuth, PRESET_ACCOUNTS, StaticUserAccount } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2, LayoutDashboard, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Key
} from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, role, loginWithAccount } = useAuth();
  const router = useRouter();

  const [selectedRoleTab, setSelectedRoleTab] = useState<"officer" | "bidder">("officer");
  const [selectedEmail, setSelectedEmail] = useState<string>("officer@satyasetu.com");
  const [password, setPassword] = useState<string>("Password123!");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role) {
      router.push(role === "officer" ? "/officer" : "/bidder");
    }
  }, [isAuthenticated, role, router]);

  const handleQuickSelect = (account: StaticUserAccount) => {
    setSelectedEmail(account.email);
    setPassword("Password123!");
    setSelectedRoleTab(account.role);
    setErrorMsg(null);
  };

  const handleTabChange = (val: string) => {
    const roleVal = val as "officer" | "bidder";
    setSelectedRoleTab(roleVal);
    setErrorMsg(null);
    setPassword("Password123!");
    if (roleVal === "officer") {
      setSelectedEmail("officer@satyasetu.com");
    } else {
      setSelectedEmail("apex@satyasetu.com");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginWithAccount(selectedEmail, password);
      if (res.success) {
        router.push(res.role === "officer" ? "/officer" : "/bidder");
      } else {
        setErrorMsg(res.error || "Invalid authentication credentials.");
      }
    } catch {
      setErrorMsg("Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const officerAccount = PRESET_ACCOUNTS.find((a) => a.role === "officer")!;
  const bidderAccounts = PRESET_ACCOUNTS.filter((a) => a.role === "bidder");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 sm:p-6">
      {/* Background Gradient Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-center">
            <Image
              src="/satyaseetu-logo.png"
              alt="SatyaSetu Logo"
              fill
              sizes="80px"
              priority
              className="object-contain p-1"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            SatyaSetu <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">SIH 2026</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            AI-Powered Transparent Procurement & Bid Verification Platform
          </p>
        </div>

        {/* Auth Container Card */}
        <Card className="bg-slate-800/90 border-slate-700 text-slate-100 shadow-2xl backdrop-blur-md">
          <CardHeader className="pb-4 border-b border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" /> Pre-Created Account Login
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Sign in with 9 pre-created accounts (1 Officer, 8 Bidders)
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] bg-slate-900 text-amber-400 border-amber-500/30">
                Signup Disabled
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-5">
            {/* Role Tabs */}
            <Tabs value={selectedRoleTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 bg-slate-900/80 p-1 border border-slate-700">
                <TabsTrigger value="officer" className="text-xs sm:text-sm data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Officer Account (1)
                </TabsTrigger>
                <TabsTrigger value="bidder" className="text-xs sm:text-sm data-[state=active]:bg-emerald-700 data-[state=active]:text-white gap-2">
                  <Building2 className="h-4 w-4" /> Bidder Accounts (8)
                </TabsTrigger>
              </TabsList>

              {/* Officer Account Quick Preset */}
              <TabsContent value="officer" className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Officer Account:
                </p>
                <div
                  onClick={() => handleQuickSelect(officerAccount)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedEmail === officerAccount.email
                      ? "bg-[#1e3a5f]/40 border-blue-400 text-white shadow"
                      : "bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-xs">
                      PO
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">{officerAccount.name}</p>
                      <p className="text-[11px] text-slate-400">{officerAccount.email} • {officerAccount.organization}</p>
                    </div>
                  </div>
                  {selectedEmail === officerAccount.email && (
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  )}
                </div>
              </TabsContent>

              {/* Bidder Accounts Quick Presets Grid */}
              <TabsContent value="bidder" className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Bidder Account (Company):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {bidderAccounts.map((account, idx) => (
                    <div
                      key={account.id}
                      onClick={() => handleQuickSelect(account)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                        selectedEmail === account.email
                          ? "bg-emerald-950/40 border-emerald-400 text-white shadow"
                          : "bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">#0{idx + 1}</span>
                          <p className="text-xs font-semibold truncate text-white">{account.vendorDisplayName}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{account.email}</p>
                        <p className="text-[10px] text-slate-500 truncate">{account.name}</p>
                      </div>
                      {selectedEmail === account.email && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-700/60">
              {errorMsg && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-300 text-xs rounded-md">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-400" /> Account Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  placeholder="name@satyasetu.com"
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-blue-400" /> Account Password
                  </Label>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Key className="h-3 w-3 text-amber-400" /> Password123!
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-9 text-xs sm:text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-medium text-xs sm:text-sm h-10 gap-2 ${
                  selectedRoleTab === "officer"
                    ? "bg-[#1e3a5f] hover:bg-[#152a45]"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Pre-Created Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Login to {selectedRoleTab === "officer" ? "Officer Dashboard" : "Bidder Dashboard"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prototype Footer */}
        <div className="text-center text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
          Smart India Hackathon 2026 · Problem Statement SIH26100
          <br />
          Static Authentication System Enabled · Signup Disabled · Exactly 9 Pre-Created Accounts Supported
        </div>
      </div>
    </div>
  );
}
