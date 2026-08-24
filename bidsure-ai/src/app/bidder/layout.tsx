"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { EvaluationProvider } from "@/contexts/evaluation-context";

export default function BidderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
