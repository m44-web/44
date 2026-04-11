"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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

  function login(email: string, password: string): boolean {
    const found = storeLogin(email, password);
    if (found) {
      setUser(found);
      setCurrentUser(found);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext value={{ user, loading, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
