"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, GraduationCap, Crown, Zap, BookOpen, Star, ArrowLeft } from "lucide-react";
import { PLANS } from "@/data/plans";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const categoryIcons: Record<string, React.ReactNode> = {
  monthly: <BookOpen size={24} />,
  yearly: <Crown size={24} />,
  bem: <Star size={24} />,
  bac: <Zap size={24} />,
  context: <CheckCircle size={24} />,
};

const categoryColors: Record<string, { card: string; badge: string; btn: string; icon: string }> = {
  monthly: {
    card: "border-olive/20 bg-white",
    badge: "bg-olive/10 text-olive",
    btn: "bg-olive hover:bg-olive-dark text-white",
    icon: "bg-olive/10 text-olive",
  },
  yearly: {
    card: "border-olive bg-gradient-to-br from-white to-olive/5 shadow-xl shadow-olive/10",
    badge: "bg-olive text-white",
    btn: "bg-gradient-to-r from-olive to-olive-dark text-white shadow-lg shadow-olive/30",
    icon: "bg-olive text-white",
  },
  bem: {
    card: "border-blue-calm/20 bg-white",
    badge: "bg-blue-calm/10 text-blue-calm",
    btn: "bg-blue-calm hover:bg-blue-700 text-white",
    icon: "bg-blue-calm/10 text-blue-calm",
  },
  bac: {
    card: "border-success/30 bg-gradient-to-br from-white to-success/5 shadow-xl shadow-success/10",
    badge: "bg-success/20 text-green-700",
    btn: "bg-gradient-to-r from-success to-green-600 text-white shadow-lg shadow-success/30",
    icon: "bg-success/20 text-green-700",
  },
  context: {
    card: "border-olive/20 bg-white",
    badge: "bg-olive/10 text-olive",
    btn: "bg-olive hover:bg-olive-dark text-white",
    icon: "bg-olive/10 text-olive",
  },
};

export default function PricingPage() {
  const { user } = useAuthStore();
  const basePlans = PLANS.filter((p) => p.category === "base");
  const examPlans = PLANS.filter((p) => p.category === "exam");

  const getLink = (planId: string) => {
    if (!user) return "/signup";
    return `/payment/${planId}`;
  };

  return (
    <div className="min-h-screen bg-beige" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-olive/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-olive to-olive-dark rounded-xl flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-display font-black text-xl text-ink">
              Zn <span className="gradient-text">Schooling</span> Dz
            </span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-sm font-semibold text-olive hover:underline">
              لوحة التحكم ←
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-sm font-semibold text-ink-light hover:text-olive px-4 py-2">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="bg-olive text-white text-sm font-bold px-4 py-2 rounded-xl">
                سجل مجاناً
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-olive/10 border border-olive/20 text-olive rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <Crown size={14} />
            <span>منصة مدفوعة بالكامل — جودة لا تقبل المساومة</span>
          </div>
          <h1 className="text-5xl font-display font-black text-ink mb-4">
            اختر باقتك
          </h1>
          <p className="text-xl text-ink-light max-w-2xl mx-auto">
            استثمر في مستقبلك. كل باقة مصممة لتضمن لك النجاح والتفوق.
          </p>
        </motion.div>

        {/* Notice: No free plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-olive/5 border border-olive/20 rounded-2xl p-4 text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-ink font-semibold text-sm">
            💎 جميع الباقات مدفوعة — لا توجد نسخة مجانية. نحن نؤمن بالجودة الحقيقية.
          </p>
        </motion.div>

        {/* Base Plans */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-display font-bold text-ink mb-8 text-center"
          >
            📚 الاشتراك الأساسي
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {basePlans.map((plan, i) => {
              const colors = categoryColors[plan.id];
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`relative border-2 ${colors.card} rounded-3xl p-6 card-hover`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-olive text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        ⭐ الأفضل قيمة
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 ${colors.icon} rounded-2xl flex items-center justify-center mb-4`}>
                    {categoryIcons[plan.id]}
                  </div>

                  <h3 className="text-xl font-display font-black text-ink mb-1">{plan.nameAr}</h3>
                  <p className="text-muted text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-black text-ink">{formatCurrency(plan.price)}</span>
                    <span className="text-muted text-sm mr-1">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-ink-light">
                        <CheckCircle size={14} className="text-olive flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={getLink(plan.id)}
                    className={`block w-full ${colors.btn} text-center font-bold py-3 rounded-xl transition-all hover:shadow-lg`}
                  >
                    اشتري الآن
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Exam Plans */}
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-display font-bold text-ink mb-4 text-center"
          >
            🎯 باقات الامتحانات المصيرية
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted mb-8 text-sm"
          >
            * تضاف بعد الاشتراك الأساسي
          </motion.p>
          <div className="grid sm:grid-cols-3 gap-6">
            {examPlans.map((plan, i) => {
              const colors = categoryColors[plan.id];
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative border-2 ${colors.card} rounded-3xl p-6 card-hover`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-success text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        🏆 الأكثر طلباً
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 ${colors.icon} rounded-2xl flex items-center justify-center mb-4`}>
                    {categoryIcons[plan.id]}
                  </div>

                  <h3 className="text-xl font-display font-black text-ink mb-1">{plan.nameAr}</h3>
                  <p className="text-muted text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-ink">{formatCurrency(plan.price)}</span>
                    <span className="text-muted text-sm mr-1">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-ink-light">
                        <CheckCircle size={12} className="text-olive flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={getLink(plan.id)}
                    className={`block w-full ${colors.btn} text-center font-bold py-3 rounded-xl transition-all hover:shadow-lg text-sm`}
                  >
                    اشتري الآن
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CCP Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-ink text-white rounded-3xl p-8 max-w-2xl mx-auto text-center"
        >
          <h3 className="text-xl font-bold mb-4">💳 طريقة الدفع</h3>
          <p className="text-white/70 mb-4 text-sm">
            ادفع عبر CCP وأرسل صورة الوصل للتفعيل الفوري
          </p>
          <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-white/60">رقم CCP:</span>
              <span className="font-bold font-mono">00799999004423597809</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">المستفيد:</span>
              <span className="font-bold">محمد بن أحمد</span>
            </div>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-olive hover:bg-olive-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            ابدأ الآن <ArrowLeft size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
