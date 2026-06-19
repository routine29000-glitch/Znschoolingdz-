"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, Mic, BookOpen, Brain, Heart, Star, Sparkles, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getSubjectsByGrade, GRADE_LABELS } from "@/lib/utils";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";

// =====================
// ONBOARDING QUESTIONS
// =====================
type OnboardingStep = {
  id: string;
  question: string;
  subtitle?: string;
  options?: { label: string; value: string; emoji: string; color: string }[];
  type: "choice" | "mood" | "confirm";
  scene: "night" | "dawn" | "golden" | "deep";
};

const SCENES = {
  night: {
    bg: "radial-gradient(ellipse at 20% 50%, #1A1A2E 0%, #0A0A0F 60%, #0D0D1A 100%)",
    accent: "#C9A84C",
    particle: "#C9A84C20",
    orb1: "#1A1A4E",
    orb2: "#0A0A2E",
  },
  dawn: {
    bg: "radial-gradient(ellipse at 80% 20%, #2D1B4E 0%, #0A0A0F 50%, #1A0A2E 100%)",
    accent: "#E8A87C",
    particle: "#E8A87C20",
    orb1: "#3D1B3E",
    orb2: "#1A0A2E",
  },
  golden: {
    bg: "radial-gradient(ellipse at 50% 80%, #2A1A0E 0%, #0A0A0F 50%, #1A0D00 100%)",
    accent: "#F0CC6A",
    particle: "#F0CC6A20",
    orb1: "#3A2A0E",
    orb2: "#1A0D00",
  },
  deep: {
    bg: "radial-gradient(ellipse at 30% 30%, #0A1A2E 0%, #0A0A0F 60%, #001A1A 100%)",
    accent: "#4AC9B0",
    particle: "#4AC9B020",
    orb1: "#0A1A2E",
    orb2: "#001A1A",
  },
};

const getOnboardingSteps = (isReturning: boolean, subscriptionTier: string): OnboardingStep[] => {
  if (isReturning) {
    return [
      {
        id: "welcome_back",
        question: "أهلاً بعودتك 👋",
        subtitle: "دعنا نعرف كيف حالك اليوم قبل أن نبدأ",
        type: "confirm",
        scene: "night",
        options: [{ label: "تمام، هيا نبدأ", value: "ready", emoji: "✨", color: "#C9A84C" }],
      },
      {
        id: "sleep",
        question: "هل نمت جيداً الليلة الماضية؟",
        subtitle: "النوم يؤثر مباشرة على قدرتك على التعلم",
        type: "choice",
        scene: "night",
        options: [
          { label: "نمت ممتاز", value: "great", emoji: "😴", color: "#4AC9B0" },
          { label: "نمت عادي", value: "ok", emoji: "😌", color: "#C9A84C" },
          { label: "لم أنم جيداً", value: "bad", emoji: "😪", color: "#E8A87C" },
        ],
      },
      {
        id: "exercise",
        question: "هل تمرنت اليوم؟",
        subtitle: "الحركة تنشّط الدماغ وتحسن التركيز",
        type: "choice",
        scene: "dawn",
        options: [
          { label: "نعم تمرنت", value: "yes", emoji: "💪", color: "#4AC9B0" },
          { label: "مشيت قليلاً", value: "walk", emoji: "🚶", color: "#C9A84C" },
          { label: "لم أتمرن", value: "no", emoji: "🪑", color: "#E8A87C" },
        ],
      },
      {
        id: "mood",
        question: "كيف تشعر الآن؟",
        subtitle: "نفسيتك هي أهم أداة في يدك",
        type: "mood",
        scene: "golden",
        options: [
          { label: "ممتاز ومتحمس", value: "excellent", emoji: "🔥", color: "#F0CC6A" },
          { label: "جيد وهادئ", value: "good", emoji: "😊", color: "#4AC9B0" },
          { label: "متعب قليلاً", value: "tired", emoji: "😮‍💨", color: "#C9A84C" },
          { label: "قلق من الدراسة", value: "anxious", emoji: "😰", color: "#E8A87C" },
        ],
      },
      {
        id: "ready",
        question: "هل أنت مستعد لنبدأ درسنا اليوم؟",
        type: "confirm",
        scene: "deep",
        options: [
          { label: "نعم، هيا نتعلم!", value: "yes", emoji: "📚", color: "#4AC9B0" },
          { label: "أريد أن أسأل سؤالاً أولاً", value: "question", emoji: "❓", color: "#C9A84C" },
        ],
      },
    ];
  }

  const semesterOptions = subscriptionTier === "yearly"
    ? [
        { label: "الفصل الأول", value: "semester1", emoji: "🌱", color: "#4AC9B0" },
        { label: "الفصل الثاني", value: "semester2", emoji: "🌿", color: "#C9A84C" },
        { label: "الفصل الثالث", value: "semester3", emoji: "🌳", color: "#F0CC6A" },
      ]
    : [
        { label: "الفصل الأول", value: "semester1", emoji: "🌱", color: "#4AC9B0" },
        { label: "الفصل الثاني", value: "semester2", emoji: "🌿", color: "#C9A84C" },
        { label: "الفصل الثالث", value: "semester3", emoji: "🌳", color: "#F0CC6A" },
      ];

  return [
    {
      id: "welcome",
      question: "أهلاً بك في رحلتك نحو التفوق ✨",
      subtitle: "أنا زن المعلم، رفيقك في كل درس ولحظة",
      type: "confirm",
      scene: "night",
      options: [{ label: "لنبدأ", value: "start", emoji: "🚀", color: "#C9A84C" }],
    },
    {
      id: "semester",
      question: "في أي فصل دراسي أنت الآن؟",
      subtitle: "سأبني معك خطة مخصصة لفصلك",
      type: "choice",
      scene: "dawn",
      options: semesterOptions,
    },
    {
      id: "mood",
      question: "كيف تشعر في هذه اللحظة؟",
      subtitle: "صدقني، هذا يهمني أكثر من أي درس",
      type: "mood",
      scene: "golden",
      options: [
        { label: "متحمس ومستعد", value: "excited", emoji: "🔥", color: "#F0CC6A" },
        { label: "هادئ ومركّز", value: "calm", emoji: "🌙", color: "#4AC9B0" },
        { label: "متعب لكن مصمم", value: "tired", emoji: "💪", color: "#C9A84C" },
        { label: "قلق من المواد", value: "anxious", emoji: "💭", color: "#E8A87C" },
      ],
    },
    {
      id: "ready",
      question: "رائع! هل أنت مستعد لنبدأ؟",
      type: "confirm",
      scene: "deep",
      options: [
        { label: "نعم، هيا بنا!", value: "yes", emoji: "📖", color: "#4AC9B0" },
        { label: "عندي سؤال أولاً", value: "question", emoji: "💬", color: "#C9A84C" },
      ],
    },
  ];
};

// =====================
// AUDIO ENGINE
// =====================
function useAudio() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = "sine", gain = 0.08) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [muted, getCtx]);

  const playWelcome = useCallback(() => {
    playTone(440, 0.3);
    setTimeout(() => playTone(554, 0.3), 150);
    setTimeout(() => playTone(659, 0.5), 300);
  }, [playTone]);

  const playChoice = useCallback(() => {
    playTone(523, 0.15, "sine", 0.05);
  }, [playTone]);

  const playMessage = useCallback(() => {
    playTone(880, 0.1, "sine", 0.04);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(659, 0.2);
    setTimeout(() => playTone(783, 0.2), 100);
    setTimeout(() => playTone(987, 0.4), 200);
  }, [playTone]);

  return { muted, setMuted, playWelcome, playChoice, playMessage, playSuccess };
}

// =====================
// FLOATING PARTICLES
// =====================
function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// =====================
// MAIN COMPONENT
// =====================
export default function ChatPage() {
  const { user } = useAuthStore();
  const {
    messages, addMessage, updateLastMessage, isStreaming, setIsStreaming,
    selectedSubject, setSelectedSubject, selectedGrade, setSelectedGrade,
    currentConversation, setCurrentConversation,
  } = useChatStore();

  const [phase, setPhase] = useState<"onboarding" | "subject" | "chat">("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const [currentScene, setCurrentScene] = useState<keyof typeof SCENES>("night");
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isReturning] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("zn_visited");
    }
    return false;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audio = useAudio();

  const steps = getOnboardingSteps(isReturning, user?.subscription_tier ?? "monthly");
  const currentStep = steps[onboardingStep];
  const scene = SCENES[currentScene];
  const subjects = getSubjectsByGrade(selectedGrade || user?.grade_level || "3as");

  useEffect(() => {
    if (!selectedGrade && user?.grade_level) setSelectedGrade(user.grade_level);
    if (!selectedSubject && subjects.length) setSelectedSubject(subjects[0]);
  }, [user, subjects, selectedGrade, selectedSubject, setSelectedGrade, setSelectedSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentStep) {
      setCurrentScene(currentStep.scene);
    }
  }, [onboardingStep, currentStep]);

  useEffect(() => {
    audio.playWelcome();
  }, []);

  const handleOnboardingAnswer = (value: string) => {
    audio.playChoice();
    const newAnswers = { ...onboardingAnswers, [currentStep.id]: value };
    setOnboardingAnswers(newAnswers);

    if (onboardingStep < steps.length - 1) {
      setTimeout(() => setOnboardingStep(onboardingStep + 1), 400);
    } else {
      audio.playSuccess();
      if (typeof window !== "undefined") {
        localStorage.setItem("zn_visited", "true");
      }
      setTimeout(() => setPhase("subject"), 600);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    audio.playChoice();
    setSelectedSubject(subject);
    setTimeout(() => {
      setPhase("chat");
      // Add welcome message
      const mood = onboardingAnswers.mood ?? "good";
      const moodMessages: Record<string, string> = {
        excellent: "ما شاء الله عليك! طاقتك اليوم عالية — هذا هو الوقت المثالي للتعلم! 🔥",
        excited: "تبارك الله! حماسك يسعدني — راك طاير يا بطل! 🚀",
        calm: "ممتاز. الهدوء هو أساس التركيز الحقيقي. 🌙",
        good: "أحسنت! نفسيتك الجيدة ستساعدك كثيراً اليوم. 😊",
        tired: "الله يعطيك الصحة — حتى في التعب أنت هنا تتعلم. هذا شجاعة حقيقية. 💪",
        anxious: "أفهمك تماماً. القلق طبيعي، لكن معي ستتحكم فيه. خطوة بخطوة، معاً. 🤝",
        bad: "لا بأس. أحياناً يكون يومنا صعباً. لكن أنت هنا، وهذا يكفي. 🌟",
      };
      const welcomeText = `${moodMessages[mood] ?? "أهلاً بك!"}\n\nاخترت مادة **${subject}**. هيا نبدأ — ماذا تريد أن تتعلم اليوم؟`;
      const welcomeMsg: Message = {
        id: "welcome_" + Date.now(),
        conversation_id: "temp",
        role: "assistant",
        content: welcomeText,
        created_at: new Date().toISOString(),
      };
      addMessage(welcomeMsg);
      audio.playSuccess();
    }, 500);
  };

  const createOrGetConversation = async (): Promise<string> => {
    if (currentConversation) return currentConversation.id;
    const supabase = createClient();
    const title = `${selectedSubject} — ${new Date().toLocaleDateString("ar-DZ")}`;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user!.id, title, subject: selectedSubject, grade_level: selectedGrade || user!.grade_level })
      .select().single();
    if (error) throw error;
    setCurrentConversation(data);
    return data.id;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !imageFile) return;
    if (isStreaming) return;
    setInput("");
    setIsStreaming(true);
    audio.playMessage();

    const userMsg: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversation?.id ?? "temp",
      role: "user",
      content: text,
      image_url: imagePreview ?? undefined,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      conversation_id: currentConversation?.id ?? "temp",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    addMessage(assistantMsg);

    try {
      const convId = await createOrGetConversation();
      const body: Record<string, unknown> = {
        conversationId: convId,
        message: text,
        subject: selectedSubject,
        grade: selectedGrade || user!.grade_level,
        studentName: `${user!.first_name} ${user!.last_name}`,
        gender: user!.gender,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      };

      if (imageFile) {
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(imageFile);
        });
        body.image = imageData;
        body.imageMimeType = imageFile.type;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("فشل الاتصال");
      if (!response.body) throw new Error("لا توجد استجابة");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              fullText += parsed.text || "";
              updateLastMessage(fullText);
            } catch {}
          }
        }
      }

      const supabase = createClient();
      await supabase.from("messages").insert([
        { conversation_id: convId, role: "user", content: text, image_url: imagePreview },
        { conversation_id: convId, role: "assistant", content: fullText },
      ]);
      await supabase.from("users").update({ total_xp: (user!.total_xp ?? 0) + 5 }).eq("id", user!.id);
      audio.playMessage();
    } catch {
      updateLastMessage("عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.");
      toast.error("فشل الاتصال بالمعلم");
    } finally {
      setIsStreaming(false);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // =====================
  // ONBOARDING PHASE
  // =====================
  if (phase === "onboarding" && currentStep) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          className="fixed inset-0 flex items-center justify-center overflow-hidden"
          style={{ background: scene.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          dir="rtl"
        >
          <Particles color={scene.particle} />

          {/* Ambient orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: scene.orb1, top: "10%", right: "10%" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: scene.orb2, bottom: "10%", left: "10%" }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Sound toggle */}
          <button
            onClick={() => audio.setMuted(!audio.muted)}
            className="absolute top-4 left-4 p-2 rounded-full"
            style={{ color: scene.accent + "80" }}
          >
            {audio.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Progress dots */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ background: i <= onboardingStep ? scene.accent : scene.accent + "30" }}
                animate={{ width: i === onboardingStep ? 24 : 8, height: 8 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Main card */}
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            {/* Question */}
            <div className="text-center mb-10">
              <motion.h2
                className="text-3xl sm:text-4xl font-black mb-3 leading-tight"
                style={{
                  color: scene.accent,
                  fontFamily: "'Amiri', 'Cairo', serif",
                  textShadow: `0 0 40px ${scene.accent}40`,
                }}
              >
                {currentStep.question}
              </motion.h2>
              {currentStep.subtitle && (
                <p className="text-lg" style={{ color: "#E8D5A3", opacity: 0.7 }}>
                  {currentStep.subtitle}
                </p>
              )}
            </div>

            {/* Options */}
            <div className={`grid gap-3 ${currentStep.options && currentStep.options.length > 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {currentStep.options?.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOnboardingAnswer(opt.value)}
                  className="relative overflow-hidden rounded-2xl p-4 text-right border transition-all duration-300"
                  style={{
                    background: `${opt.color}10`,
                    borderColor: `${opt.color}30`,
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = opt.color;
                    (e.currentTarget as HTMLButtonElement).style.background = `${opt.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${opt.color}30`;
                    (e.currentTarget as HTMLButtonElement).style.background = `${opt.color}10`;
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-bold text-sm" style={{ color: "#E8D5A3" }}>
                      {opt.label}
                    </span>
                  </div>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${opt.color}20, transparent)` }}
                    whileHover={{ opacity: 1, x: ["-100%", "100%"] }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Decorative line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-20"
            style={{ background: `linear-gradient(90deg, transparent, ${scene.accent}, transparent)` }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // =====================
  // SUBJECT SELECTION PHASE
  // =====================
  if (phase === "subject") {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{ background: SCENES.deep.bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        dir="rtl"
      >
        <Particles color={SCENES.deep.particle} />
        <div className="relative z-10 w-full max-w-2xl mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: SCENES.deep.accent, fontFamily: "'Amiri', serif", textShadow: `0 0 30px ${SCENES.deep.accent}40` }}
            >
              ماذا نتعلم اليوم؟
            </h2>
            <p style={{ color: "#E8D5A3", opacity: 0.6 }}>اختر المادة التي تريد أن تبدأ بها</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject, i) => (
              <motion.button
                key={subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubjectSelect(subject)}
                className="rounded-2xl p-4 text-center border transition-all duration-300"
                style={{
                  background: "#4AC9B010",
                  borderColor: "#4AC9B030",
                  backdropFilter: "blur(10px)",
                  color: "#E8D5A3",
                }}
              >
                <div className="text-2xl mb-2">📚</div>
                <p className="font-bold text-sm">{subject}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // =====================
  // CHAT PHASE
  // =====================
  const chatScene = SCENES.night;
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: chatScene.bg }}
      dir="rtl"
    >
      <Particles color={chatScene.particle} />

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: `${chatScene.accent}20`, backdropFilter: "blur(20px)", background: "#0A0A0F90" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${chatScene.accent}20`, border: `1px solid ${chatScene.accent}40` }}
          >
            <Brain size={18} style={{ color: chatScene.accent }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#E8D5A3" }}>زن المعلم</p>
            <p className="text-xs" style={{ color: chatScene.accent, opacity: 0.7 }}>
              {selectedSubject} — {GRADE_LABELS[selectedGrade || user?.grade_level || ""] ?? ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhase("subject")}
            className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1"
            style={{ borderColor: `${chatScene.accent}30`, color: chatScene.accent }}
          >
            <BookOpen size={12} />
            <span>تغيير المادة</span>
          </button>
          <button
            onClick={() => audio.setMuted(!audio.muted)}
            className="p-2 rounded-lg"
            style={{ color: `${chatScene.accent}80` }}
          >
            {audio.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10">
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            userName={user?.first_name ?? ""}
            theme={{
              bg: "#1A1A2E",
              bgLight: "#0A0A0F",
              accent: chatScene.accent,
              accentLight: `${chatScene.accent}20`,
              text: "#E8D5A3",
            }}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="relative z-10 px-4 pb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 w-auto rounded-xl object-cover" style={{ border: `1px solid ${chatScene.accent}40` }} />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
              style={{ background: "#C77D7D", color: "white" }}
            >×</button>
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="relative z-10 px-4 py-4 flex-shrink-0 border-t"
        style={{ borderColor: `${chatScene.accent}20`, backdropFilter: "blur(20px)", background: "#0A0A0F90" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl p-3 border"
          style={{ background: "#1A1A2E60", borderColor: `${chatScene.accent}30` }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl flex-shrink-0 transition-colors"
            style={{ color: `${chatScene.accent}80` }}
          >
            <Image size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setImageFile(f);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(f);
              }
            }}
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`اسأل عن ${selectedSubject || "أي شيء"}...`}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
            style={{ color: "#E8D5A3", caretColor: chatScene.accent }}
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isStreaming || (!input.trim() && !imageFile)}
            className="p-2.5 rounded-xl flex-shrink-0 disabled:opacity-30 transition-all"
            style={{ background: `${chatScene.accent}20`, color: chatScene.accent, border: `1px solid ${chatScene.accent}40` }}
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${chatScene.accent}30`, borderTopColor: chatScene.accent }} />
            ) : (
              <Send size={16} />
            )}
          </motion.button>
        </div>

        <p className="text-center text-xs mt-2" style={{ color: `${chatScene.accent}40` }}>
          Enter للإرسال • Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
