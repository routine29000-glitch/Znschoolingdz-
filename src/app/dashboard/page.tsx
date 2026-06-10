"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare, Zap, Target, BookOpen, Clock, Star,
  TrendingUp, CalendarDays, Sun, Moon, Sunrise,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTheme, GRADE_LABELS, getRandomMotivation } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { differenceInDays, parseISO } from "date-fns";

interface DashboardStats {
  chatsCount: number;
  quizzesCount: number;
  avgScore: number;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "صباح النور", icon: <Sunrise size={20} /> };
  if (h < 17) return { text: "مرحباً", icon: <Sun size={20} /> };
  return { text: "مساء الخير", icon: <Moon size={20} /> };
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ chatsCount: 0, quizzesCount: 0, avgScore: 0 });
  const [motivation] = useState(getRandomMotivation);
  const greeting = getGreeting();

  const theme = getTheme(user?.gender ?? "not_specified");
  const daysLeft = user?.subscription_expires_at
    ? Math.max(0, differenceInDays(parseISO(user.subscription_expires_at), new Date()))
    : 0;

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const supabase = createClient();
      const [chatsRes, quizzesRes] = await Promise.all([
        supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("quizzes").select("score").eq("user_id", user.id).not("score", "is", null),
      ]);
      const scores = quizzesRes.data?.map((q) => q.score).filter(Boolean) as number[];
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      setStats({
        chatsCount: chatsRes.count ?? 0,
        quizzesCount: scores.length,
        avgScore: avg,
      });
    };
    fetchStats();
  }, [user]);

  if (!user) return null;

  const quickActions = [
    {
      href: "/dashboard/chat",
      icon: <MessageSquare size={24} />,
      label: "اسأل معلمك",
      desc: "ابدأ محادثة تعليمية",
      color: theme.accent,
      bgLight: theme.accentLight,
    },
    {
      href: "/dashboard/quizzes",
      icon: <Zap size={24} />,
      label: "ابدأ اختباراً",
      desc: "اختبر معلوماتك",
      color: "#8FCB81",
      bgLight: "#E8F5E4",
    },
    {
      href: "/dashboard/exam-prep",
      icon: <Target size={24} />,
      label: "الامتحانات",
      desc: "استعد لـ BEM & BAC",
      color: "#4A6FA5",
      bgLight: "#EEF2F8",
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto" dir="rtl">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-muted text-sm mb-1">
          {greeting.icon}
          <span>{greeting.text}</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-display font-black mb-2"
          style={{ color: theme.text }}
        >
          {user.first_name} 👋
        </h1>
        <p className="text-ink-light text-lg">{motivation}</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "أيام متبقية", value: daysLeft, icon: <CalendarDays size={18} />, suffix: "يوم" },
          { label: "محادثات", value: stats.chatsCount, icon: <MessageSquare size={18} />, suffix: "" },
          { label: "اختبارات", value: stats.quizzesCount, icon: <BookOpen size={18} />, suffix: "" },
          { label: "متوسط النتيجة", value: stats.avgScore, icon: <TrendingUp size={18} />, suffix: "%" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 border border-olive/10 shadow-sm"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-white"
              style={{ background: theme.accent }}
            >
              {stat.icon}
            </div>
            <div className="text-2xl font-black text-ink">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted mr-1">{stat.suffix}</span>}
            </div>
            <div className="text-xs text-muted mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-display font-bold text-ink mb-4">البدء السريع</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="card-hover bg-white border border-olive/10 rounded-2xl p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: action.bgLight, color: action.color }}
              >
                {action.icon}
              </div>
              <div>
                <p className="font-bold text-ink text-sm">{action.label}</p>
                <p className="text-xs text-muted">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Study Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-display font-bold text-ink mb-4">💡 نصائح اليوم</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "⏱️", title: "تقنية بومودورو", text: "ادرس 45 دقيقة ثم خذ راحة 10 دقائق. الدماغ يعمل بشكل أفضل مع الفواصل." },
            { icon: "🌙", title: "النوم المبكر", text: "النوم الساعة 22:00 يساعد على ترسيخ المعلومات. الدماغ يراجع ما تعلمته أثناء النوم." },
            { icon: "💧", title: "اشرب ماء كافياً", text: "الجفاف يؤثر سلباً على التركيز. اشرب 8 أكواب من الماء يومياً." },
          ].map((tip, i) => (
            <div key={i} className="bg-white border border-olive/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h3 className="font-bold text-ink text-sm mb-1">{tip.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grade & subscription info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between"
        style={{ background: theme.accentLight }}
      >
        <div className="flex items-center gap-3">
          <Star size={18} style={{ color: theme.accent }} />
          <div>
            <p className="text-xs text-muted">مستواك الدراسي</p>
            <p className="font-bold text-sm" style={{ color: theme.text }}>
              {GRADE_LABELS[user.grade_level] ?? user.grade_level}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={18} style={{ color: theme.accent }} />
          <div>
            <p className="text-xs text-muted">الاشتراك</p>
            <p className="font-bold text-sm" style={{ color: theme.text }}>
              {user.subscription_tier === "monthly" ? "شهري" :
               user.subscription_tier === "yearly" ? "سنوي" : "غير محدد"}
              {daysLeft > 0 && <span className="text-xs mr-1">({daysLeft} يوم)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp size={18} style={{ color: theme.accent }} />
          <div>
            <p className="text-xs text-muted">نقاط XP</p>
            <p className="font-bold text-sm" style={{ color: theme.text }}>{user.total_xp} نقطة</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
