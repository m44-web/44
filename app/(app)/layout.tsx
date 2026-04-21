"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppBottomNav } from "@/components/app/AppBottomNav";
import { AppHeader, initTheme } from "@/components/app/AppHeader";
import { OfflineIndicator } from "@/components/app/OfflineIndicator";
import { CommandPalette } from "@/components/app/CommandPalette";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-primary">
      <OfflineIndicator />
      <CommandPalette />
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-60">
        <AppHeader />
        <main className="flex-1 p-4 pb-20 md:pb-4 md:p-6 overflow-auto">
          {children}
        </main>
        <AppBottomNav />
      </div>
    </div>
  );
}
