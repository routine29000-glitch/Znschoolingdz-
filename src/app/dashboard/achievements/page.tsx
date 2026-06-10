"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Zap, BookOpen, MessageSquare, Target, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTheme } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Achievement } from "@/types";

const ACHIEVEMENT_DEFS = [
  { type: "first_chat", icon: "💬", title: "المحادثة الأولى", desc: "أجريت أول محادثة مع المعلم", xp: 50, threshold: 1 },
  { type: "chat_10", icon: "🗣️", title: "محادث نشط", desc: "10 محادثات مع المعلم", xp: 100, threshold: 10 },
  { type: "quiz_1", icon: "⚡", title: "أول اختبار", desc: "أكملت أول اختبار", xp: 50, threshold: 1 },
  { type: "quiz_10", icon: "🧠", title: "ذكاء حاد", desc: "أكملت 10 اختبارات", xp: 150, threshold: 10 },
  { type: "perfect_score", icon: "🏆", title: "درجة كاملة", desc: "حصلت على 100% في اختبار", xp: 200, threshold: 1 },
  { type: "xp_100", icon: "⭐", title: "مئة نقطة", desc: "جمعت 100 نقطة XP", xp: 50, threshold: 100 },
  { type: "xp_500", icon: "🌟", title: "خمسمئة نقطة", desc: "جمعت 500 نقطة XP", xp: 100, threshold: 500 },
  { type: "xp_1000", icon: "💫", title: "ألف نقطة", desc: "جمعت 1000 نقطة XP", xp: 200, threshold: 1000 },
  { type: "streak_3", icon: "🔥", title: "3 أيام متتالية", desc: "درست 3 أيام متتالية", xp: 75, threshold: 3 },
  { type: "streak_7", icon: "🔥🔥", title: "أسبوع متكامل", desc: "درست 7 أيام متتالية", xp: 200, threshold: 7 },
  { type: "exam_ready", icon: "🎯", title: "مستعد للامتحان", desc: "فعّلت باقة الامتحانات", xp: 100, threshold: 1 },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const theme = getTheme(user?.gender ?? "not_specified");
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch_ = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id);
      setEarned(data ?? []);
      setLoading(false);
    };
    fetch_();
  }, [user]);

  const earnedTypes = earned.map((a) => a.type);
  const totalXP = earned.reduce((sum, a) => sum + (a.xp_reward ?? 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black text-ink mb-2">الإنجازات 🏆</h1>
          <p className="text-ink-light">اجمع الإنجازات واكسب نقاط XP</p>
        </div>

        {/* XP Summary */}
        <div
          className="rounded-3xl p-6 mb-8 flex items-center justify-between"
          style={{ background: theme.accentLight }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: theme.accent }}>إجمالي نقاطك</p>
            <p className="text-4xl font-black" style={{ color: theme.text }}>{user?.total_xp ?? 0} XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: theme.accent }}>{earned.length} / {ACHIEVEMENT_DEFS.length}</p>
            <p className="text-xs text-muted">إنجاز مكتسب</p>
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: theme.accent }}
          >
            <Trophy size={28} className="text-white" />
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-beige rounded-2xl h-36 shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ACHIEVEMENT_DEFS.map((ach, i) => {
              const isEarned = earnedTypes.includes(ach.type);
              return (
                <motion.div
                  key={ach.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-4 text-center border-2 transition-all ${
                    isEarned
                      ? "border-olive/30 bg-white shadow-sm"
                      : "border-olive/10 bg-beige/50"
                  }`}
                >
                  <div className={`text-3xl mb-2 ${!isEarned ? "grayscale opacity-40" : ""}`}>
                    {isEarned ? ach.icon : <Lock size={24} className="mx-auto text-muted" />}
                  </div>
                  <p className={`font-bold text-xs mb-1 ${isEarned ? "text-ink" : "text-muted"}`}>
                    {ach.title}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">{ach.desc}</p>
                  <div className={`mt-2 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    isEarned ? "bg-olive/10 text-olive" : "bg-beige text-muted"
                  }`}>
                    <Star size={10} />
                    +{ach.xp} XP
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
