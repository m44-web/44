"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { User } from "./types";
import { getCurrentUser, setCurrentUser, login as storeLogin, initializeStore } from "./store";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStore();
    const saved = getCurrentUser();
    setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const found = storeLogin(email, password);
    if (found) {
      setUser(found);
      setCurrentUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentUser(null);
    // Clean up any in-progress drafts and UI state keys that are tied to the session
    if (typeof window !== "undefined") {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith("lsecurity_report_draft_")) localStorage.removeItem(key);
        }
      } catch {}
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
