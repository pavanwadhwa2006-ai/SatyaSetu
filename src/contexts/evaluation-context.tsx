"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { OfficerDecision } from "@/types";

interface EvaluationContextType {
  decisions: Record<string, OfficerDecision>;
  makeDecision: (bidderId: string, decision: OfficerDecision) => void;
  getDecision: (bidderId: string) => OfficerDecision | null;
  hasDecision: (bidderId: string) => boolean;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, OfficerDecision>>({});

  const makeDecision = useCallback((bidderId: string, decision: OfficerDecision) => {
    setDecisions((prev) => ({ ...prev, [bidderId]: decision }));
  }, []);

  const getDecision = useCallback(
    (bidderId: string) => decisions[bidderId] || null,
    [decisions]
  );

  const hasDecision = useCallback(
    (bidderId: string) => !!decisions[bidderId],
    [decisions]
  );

  return (
    <EvaluationContext.Provider value={{ decisions, makeDecision, getDecision, hasDecision }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error("useEvaluation must be used within an EvaluationProvider");
  }
  return context;
}
