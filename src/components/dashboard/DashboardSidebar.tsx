"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Home, MessageSquare, BookOpen, Trophy,
  Settings, LogOut, Star, Menu, X, Target, Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { ThemeColors } from "@/types";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/dashboard/chat", label: "اسأل معلمك", icon: MessageSquare },
  { href: "/dashboard/quizzes", label: "الاختبارات", icon: Zap },
  { href: "/dashboard/exam-prep", label: "الدروس الخصوصية", icon: Target },
  { href: "/dashboard/achievements", label: "الإنجازات", icon: Trophy },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

interface Props {
  theme: ThemeColors;
}

export function DashboardSidebar({ theme }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    logout();
    router.push("/");
    toast.success("تم تسجيل الخروج");
  };

  const SidebarContent = () => (
    <div
      className="h-full flex flex-col py-6"
      style={{ background: theme.bg }}
    >
      {/* Logo */}
      <div className="px-5 mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme.accent }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-display font-black text-lg" style={{ color: theme.text }}>
            Zn Schooling
          </span>
        </Link>
      </div>

      {/* User info */}
      <div
        className="mx-4 mb-6 p-4 rounded-2xl"
        style={{ background: theme.accentLight }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: theme.accent }}
          >
            {user?.first_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: theme.text }}>
              {user?.first_name} {user?.last_name}
            </p>
            <div className="flex items-center gap-1">
              <Star size={11} style={{ color: theme.accent }} />
              <span className="text-xs" style={{ color: theme.accent }}>
                {user?.total_xp ?? 0} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold"
              style={{
                background: isActive ? theme.accentLight : "transparent",
                color: isActive ? theme.accent : theme.text,
                fontWeight: isActive ? "700" : "500",
              }}
            >
              <Icon size={18} />
              {item.label}
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full ml-auto"
                  style={{ background: theme.accent }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-xl shadow-lg lg:hidden"
      >
        <Menu size={20} className="text-ink" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-l border-olive/10 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 border-l border-olive/10 overflow-y-auto lg:hidden"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X size={18} className="text-ink" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
