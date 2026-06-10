"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Zap, Clock, RefreshCw, CheckCircle, XCircle, BookOpen, ChevronRight, Trophy } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTheme, getSubjectsByGrade } from "@/lib/utils";
import { QuizQuestion } from "@/types";
import { createClient } from "@/lib/supabase/client";

type Difficulty = "easy" | "medium" | "hard";
type QuizState = "setup" | "running" | "results";

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const theme = getTheme(user?.gender ?? "not_specified");
  const subjects = getSubjectsByGrade(user?.grade_level ?? "3as");

  const [state, setQuizState] = useState<QuizState>("setup");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] ?? "الرياضيات");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: user?.grade_level,
          difficulty,
          count: questionCount,
        }),
      });
      if (!res.ok) throw new Error("فشل التوليد");
      const data: GeneratedQuiz = await res.json();
      if (!data.questions?.length) throw new Error("لا توجد أسئلة");

      setQuestions(data.questions.map((q, i) => ({ ...q, id: `q_${i}` })));
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuizState("running");
    } catch {
      toast.error("فشل توليد الاختبار، حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    // Award XP
    if (answerIndex === questions[currentIndex].correct_answer) {
      toast.success("إجابة صحيحة! +10 XP 🎉");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const score = Math.round(
      (userAnswers.filter((a, i) => a === questions[i]?.correct_answer).length / questions.length) * 100
    );

    setQuizState("results");

    // Save to DB
    if (user) {
      const supabase = createClient();
      await supabase.from("quizzes").insert({
        user_id: user.id,
        subject: selectedSubject,
        grade_level: user.grade_level,
        difficulty,
        questions: questions.map((q, i) => ({ ...q, user_answer: userAnswers[i] })),
        score,
        completed_at: new Date().toISOString(),
      });

      // XP
      const xpEarned = Math.round(score / 10) * 5;
      await supabase.from("users").update({
        total_xp: (user.total_xp ?? 0) + xpEarned,
      }).eq("id", user.id);

      // Save wrong answers for spaced repetition
      const wrongQuestions = questions.filter((q, i) => userAnswers[i] !== q.correct_answer);
      if (wrongQuestions.length > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await supabase.from("spaced_repetition").insert(
          wrongQuestions.map((q) => ({
            user_id: user.id,
            question_id: q.id,
            question: q.question,
            subject: selectedSubject,
            next_review: tomorrow.toISOString(),
            interval_days: 1,
            ease_factor: 2.5,
            repetitions: 0,
          }))
        );
      }
    }
  };

  const correctCount = userAnswers.filter((a, i) => a === questions[i]?.correct_answer).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  // ======================== SETUP ========================
  if (state === "setup") {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-black text-ink mb-2">الاختبارات</h1>
          <p className="text-ink-light mb-8">اختبر معلوماتك مع معلمك الذكي 🧠</p>

          <div className="bg-white rounded-3xl border border-olive/10 p-6 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-ink mb-3">المادة</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`p-2.5 rounded-xl border text-sm font-medium transition-all text-right ${
                      selectedSubject === sub
                        ? "border-olive bg-olive/10 text-olive font-bold"
                        : "border-olive/10 hover:border-olive/30 text-ink-light"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold text-ink mb-3">مستوى الصعوبة</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "easy", label: "سهل", emoji: "😊", color: "border-success/40 bg-success/10 text-green-700" },
                  { value: "medium", label: "متوسط", emoji: "🤔", color: "border-olive/40 bg-olive/10 text-olive" },
                  { value: "hard", label: "صعب", emoji: "🔥", color: "border-error/40 bg-error/10 text-error" },
                ] as const).map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`py-3 rounded-xl border-2 text-center transition-all ${
                      difficulty === d.value ? d.color : "border-olive/10 text-ink-light hover:border-olive/20"
                    }`}
                  >
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="text-xs font-semibold">{d.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-bold text-ink mb-3">عدد الأسئلة: {questionCount}</label>
              <input
                type="range" min={3} max={20} value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-olive"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>3</span><span>20</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={generateQuiz}
              disabled={isLoading}
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-60 text-lg flex items-center justify-center gap-2"
              style={{ background: theme.accent }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري توليد الاختبار...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  ابدأ الاختبار
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ======================== RUNNING ========================
  if (state === "running" && questions.length > 0) {
    const q = questions[currentIndex];
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto" dir="rtl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
            <span className="text-sm text-muted">{selectedSubject} — {difficulty === "easy" ? "سهل" : difficulty === "medium" ? "متوسط" : "صعب"}</span>
          </div>
          <div className="w-full bg-olive/10 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full transition-all"
              style={{ background: theme.accent, width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-3xl border border-olive/10 p-6"
          >
            <p className="text-lg font-bold text-ink mb-6 leading-relaxed">{q.question}</p>

            <div className="space-y-3 mb-6">
              {q.options.map((option, i) => {
                let btnStyle = "border-olive/20 bg-beige text-ink hover:border-olive/40";
                if (selectedAnswer !== null) {
                  if (i === q.correct_answer) btnStyle = "border-success bg-success/10 text-green-700";
                  else if (i === selectedAnswer && i !== q.correct_answer) btnStyle = "border-error bg-error/10 text-error";
                  else btnStyle = "border-olive/10 bg-beige/50 text-ink-light";
                }

                return (
                  <motion.button
                    key={i}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-right p-4 rounded-2xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${btnStyle}`}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white/80">
                      {["أ", "ب", "ج", "د"][i]}
                    </span>
                    {option}
                    {selectedAnswer !== null && i === q.correct_answer && (
                      <CheckCircle size={16} className="text-success mr-auto" />
                    )}
                    {selectedAnswer !== null && i === selectedAnswer && i !== q.correct_answer && (
                      <XCircle size={16} className="text-error mr-auto" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-olive/5 border border-olive/20 rounded-2xl p-4 mb-4"
                >
                  <p className="text-sm font-bold text-olive mb-1">💡 الشرح:</p>
                  <p className="text-sm text-ink-light leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedAnswer !== null && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: theme.accent }}
              >
                {currentIndex < questions.length - 1 ? (
                  <><span>السؤال التالي</span><ChevronRight size={18} /></>
                ) : (
                  <><Trophy size={18} /><span>عرض النتيجة</span></>
                )}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ======================== RESULTS ========================
  if (state === "results") {
    const emoji = score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪";
    const message = score >= 80 ? "ممتاز! أنت متفوق بالفعل!" : score >= 60 ? "جيد! واصل التحسن" : "لا تيأس! التكرار هو مفتاح النجاح";

    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-white rounded-3xl border border-olive/10 p-8 text-center">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-3xl font-display font-black text-ink mb-2">نتيجتك: {score}%</h2>
            <p className="text-ink-light mb-6">{message}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-success/10 rounded-2xl p-3">
                <div className="text-2xl font-black text-green-700">{correctCount}</div>
                <div className="text-xs text-muted">صحيحة</div>
              </div>
              <div className="bg-error/10 rounded-2xl p-3">
                <div className="text-2xl font-black text-error">{questions.length - correctCount}</div>
                <div className="text-xs text-muted">خاطئة</div>
              </div>
              <div className="bg-olive/10 rounded-2xl p-3">
                <div className="text-2xl font-black text-olive">{questions.length}</div>
                <div className="text-xs text-muted">المجموع</div>
              </div>
            </div>

            {questions.length - correctCount > 0 && (
              <div className="bg-beige rounded-2xl p-4 mb-6 text-sm text-ink-light text-right">
                <BookOpen size={14} className="inline ml-1 text-olive" />
                الأسئلة الخاطئة ({questions.length - correctCount}) ستُعاد عليك تلقائياً غداً وبعد 3 أيام وأسبوع (نظام التكرار الذكي) ✨
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setQuizState("setup"); setQuestions([]); }}
                className="flex-1 border-2 border-olive text-olive font-bold py-3 rounded-xl hover:bg-olive hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                اختبار جديد
              </button>
              <button
                onClick={generateQuiz}
                disabled={isLoading}
                className="flex-1 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ background: theme.accent }}
              >
                <Zap size={16} />
                نفس الإعدادات
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
