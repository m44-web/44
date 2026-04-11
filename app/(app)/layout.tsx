"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppBottomNav } from "@/components/app/AppBottomNav";
import { AppHeader } from "@/components/app/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-accent text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-primary">
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
