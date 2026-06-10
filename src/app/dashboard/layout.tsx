"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { getTheme } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && user.subscription_tier === "none") {
      router.push("/pricing");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-light font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const theme = getTheme(user.gender);

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{ background: theme.bgLight }}
    >
      <DashboardSidebar theme={theme} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
