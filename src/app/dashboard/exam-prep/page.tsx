"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { Target, Lock, Sparkles, Calendar, Brain, Heart, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTheme } from "@/lib/utils";

const examTips = {
  bem: [
    { icon: "🧘", title: "التنفس قبل الامتحان", text: "خذ 5 أنفاس عميقة بطيئة قبل بدء الامتحان. تنفس من الأنف 4 ثوان، احبس 4 ثوان، أخرج من الفم 4 ثوان." },
    { icon: "⏱️", title: "إدارة الوقت", text: "اقرأ جميع الأسئلة أولاً، ابدأ بالأسهل، لا تقضِ أكثر من 5 دقائق على سؤال واحد." },
    { icon: "✍️", title: "الكتابة الواضحة", text: "اكتب بخط واضح ومنظم. الممتحن يقيّم ما يراه. نظّم إجاباتك في فقرات." },
    { icon: "💧", title: "الطاقة والتغذية", text: "نم 8 ساعات قبل الامتحان، اشرب ماءً، لا تأكل أكلاً ثقيلاً صباح الامتحان." },
    { icon: "🎯", title: "ثق بنفسك", text: "راجعت وذاكرت. الذعر يؤثر سلباً. ذكّر نفسك بكل ما أنجزته." },
  ],
  bac: [
    { icon: "📋", title: "استراتيجية الكتابة", text: "في مادة الفلسفة والعربية: مقدمة قوية + حجج مدعومة بأمثلة + خاتمة تلخص الفكرة الرئيسية." },
    { icon: "🔢", title: "الرياضيات والفيزياء", text: "اكتب المعطيات والمطلوب أولاً. ثم المنهجية خطوة بخطوة. لا تتخطَ خطوات حتى لو تبدو واضحة." },
    { icon: "🧠", title: "مراجعة يوم الامتحان", text: "لا تراجع مواد جديدة يوم الامتحان. فقط مراجعة خفيفة للمحاور الرئيسية." },
    { icon: "💪", title: "التحكم في العواطف", text: "إذا شعرت بالقلق أثناء الامتحان: توقف، خذ نفساً، اغمض عينيك ثانيتين، ثم واصل." },
    { icon: "🎉", title: "ما بعد الامتحان", text: "بعد كل امتحان، استرح ولا تناقش الأجوبة كثيراً. ركّز على الامتحان القادم." },
  ],
};

const weeklySchedule = [
  { day: "السبت", subjects: ["الرياضيات", "الفيزياء"], hours: 4, type: "intensive" },
  { day: "الأحد", subjects: ["اللغة العربية", "الفلسفة"], hours: 3, type: "normal" },
  { day: "الاثنين", subjects: ["الإنجليزية", "الفرنسية"], hours: 3, type: "normal" },
  { day: "الثلاثاء", subjects: ["العلوم الطبيعية", "التاريخ والجغرافيا"], hours: 4, type: "intensive" },
  { day: "الأربعاء", subjects: ["مراجعة عامة + اختبار تجريبي"], hours: 5, type: "exam" },
  { day: "الخميس", subjects: ["الرياضيات", "الفيزياء"], hours: 4, type: "intensive" },
  { day: "الجمعة", subjects: ["راحة + قراءة خفيفة"], hours: 1, type: "rest" },
];

export default function ExamPrepPage() {
  const { user } = useAuthStore();
  const theme = getTheme(user?.gender ?? "not_specified");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [availableHours, setAvailableHours] = useState(3);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  const hasExamPackage = user?.exam_package === "bem" || user?.exam_package === "bac";
  const examType = user?.exam_package as "bem" | "bac" | null;

  const allSubjects = ["الرياضيات", "الفيزياء", "العربية", "الفرنسية", "الإنجليزية", "العلوم", "التاريخ", "الفلسفة"];

  const toggleWeakSubject = (sub: string) => {
    setWeakSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const generatePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: `${user?.first_name} ${user?.last_name}`,
          grade: user?.grade_level,
          examType: examType ?? "bem",
          weakSubjects,
          availableHoursPerDay: availableHours,
        }),
      });
      const data = await res.json();
      setStudyPlan(data.plan);
      toast.success("تم توليد خطتك الدراسية! 📚");
    } catch {
      toast.error("فشل توليد الخطة، حاول مرة أخرى");
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Not subscribed to exam package
  if (!hasExamPackage) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-olive/10 p-8 text-center"
        >
          <div className="w-20 h-20 bg-olive/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={36} className="text-olive" />
          </div>
          <h2 className="text-2xl font-display font-black text-ink mb-3">
            الدروس الخصوصية للامتحانات
          </h2>
          <p className="text-ink-light mb-6 leading-relaxed">
            هذه الصفحة مخصصة لحاملي باقة <strong>BEM</strong> أو <strong>BAC</strong>.
            اشترِ الباقة المناسبة للحصول على خطة دراسية مكثفة ودعم نفسي يومي.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/payment/bem"
              className="bg-blue-calm text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              باقة BEM — 5,000 دج
            </Link>
            <Link
              href="/payment/bac"
              className="bg-gradient-to-r from-olive to-olive-dark text-white font-bold px-6 py-3 rounded-xl shadow-lg"
            >
              باقة BAC — 10,000 دج
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const tips = examTips[examType!] ?? examTips.bac;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-3"
            style={{ background: theme.accentLight, color: theme.accent }}
          >
            <Target size={12} />
            باقة {examType?.toUpperCase()} المفعّلة
          </div>
          <h1 className="text-3xl font-display font-black text-ink mb-2">
            استعداد الامتحان
          </h1>
          <p className="text-ink-light">خطة مكثفة + نصائح نفسية + جدول أسبوعي مخصص لك</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Study Plan Generator */}
          <div className="bg-white rounded-3xl border border-olive/10 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: theme.accentLight, color: theme.accent }}>
                <Sparkles size={16} />
              </div>
              <h2 className="font-display font-bold text-ink">توليد خطة دراسية بالذكاء الاصطناعي</h2>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  ساعات الدراسة اليومية: {availableHours}
                </label>
                <input
                  type="range" min={1} max={8} value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full accent-olive"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">المواد الضعيفة (اختر)</label>
                <div className="flex flex-wrap gap-2">
                  {allSubjects.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => toggleWeakSubject(sub)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        weakSubjects.includes(sub)
                          ? "border-error bg-error/10 text-error font-bold"
                          : "border-olive/20 text-ink-light hover:border-olive/40"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={generatingPlan}
              className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: theme.accent }}
            >
              {generatingPlan ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التوليد...</>
              ) : (
                <><Sparkles size={16} />اصنع خطتي الدراسية</>
              )}
            </button>

            {studyPlan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-beige rounded-2xl p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto"
              >
                {studyPlan}
              </motion.div>
            )}
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white rounded-3xl border border-olive/10 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center text-green-700">
                <Calendar size={16} />
              </div>
              <h2 className="font-display font-bold text-ink">الجدول الأسبوعي المقترح</h2>
            </div>

            <div className="space-y-2">
              {weeklySchedule.map((day, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                    day.type === "exam" ? "bg-olive/10 border border-olive/20" :
                    day.type === "rest" ? "bg-success/10 border border-success/20" :
                    day.type === "intensive" ? "bg-blue-50 border border-blue-100" :
                    "bg-beige"
                  }`}
                >
                  <div>
                    <p className="font-bold text-ink">{day.day}</p>
                    <p className="text-xs text-muted">{day.subjects.join("، ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm" style={{ color: theme.accent }}>{day.hours}س</p>
                    <p className="text-xs text-muted">{day.type === "rest" ? "راحة" : day.type === "exam" ? "اختبار" : "دراسة"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Psychological Tips */}
        <div className="mt-6 bg-white rounded-3xl border border-olive/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-error/10 rounded-xl flex items-center justify-center text-error">
              <Heart size={16} />
            </div>
            <h2 className="font-display font-bold text-ink">نصائح نفسية للامتحان</h2>
          </div>

          <div className="space-y-3">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                className="border border-olive/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-right hover:bg-beige transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tip.icon}</span>
                    <span className="font-semibold text-sm text-ink">{tip.title}</span>
                  </div>
                  {expandedTip === i ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </button>
                {expandedTip === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-4 pb-4 text-sm text-ink-light leading-relaxed border-t border-olive/10 pt-3"
                  >
                    {tip.text}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Prep Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.text})` }}
        >
          <Brain size={32} className="mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-display font-black mb-2">محادثة تحضيرية مع المعلم</h3>
          <p className="text-white/70 text-sm mb-4">
            أخبر معلمك الذكي بالامتحان القادم وسيساعدك على الاستعداد المثالي
          </p>
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-xl"
            style={{ color: theme.accent }}
          >
            <Sparkles size={16} />
            تحدث مع معلمك الآن
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
