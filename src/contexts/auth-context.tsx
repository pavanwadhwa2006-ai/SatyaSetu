"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<UserRole, User> = {
  bidder: {
    id: "USR-001",
    name: "Rajesh Kumar Sharma",
    role: "bidder",
    organization: "ABC Engineering Pvt. Ltd.",
    designation: "Authorized Representative",
  },
  officer: {
    id: "USR-002",
    name: "Ananya Mehta",
    role: "officer",
    organization: "Government Procurement Department",
    designation: "Senior Procurement Officer",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
