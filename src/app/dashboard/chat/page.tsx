"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, Image, Paperclip, ChevronDown, BookOpen,
  Sparkles, Bot, User as UserIcon, FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getTheme, getSubjectsByGrade, GRADE_LABELS } from "@/lib/utils";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";

export default function ChatPage() {
  const { user } = useAuthStore();
  const {
    messages, addMessage, updateLastMessage, isStreaming, setIsStreaming,
    selectedSubject, setSelectedSubject, selectedGrade, setSelectedGrade,
    currentConversation, setCurrentConversation,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = getTheme(user?.gender ?? "not_specified");

  const gradeForSubjects = selectedGrade || user?.grade_level || "3as";
  const subjects = getSubjectsByGrade(gradeForSubjects);

  useEffect(() => {
    if (!selectedGrade && user?.grade_level) setSelectedGrade(user.grade_level);
    if (!selectedSubject && subjects.length) setSelectedSubject(subjects[0]);
  }, [user, subjects, selectedGrade, selectedSubject, setSelectedGrade, setSelectedSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة فقط");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createOrGetConversation = async (): Promise<string> => {
    if (currentConversation) return currentConversation.id;
    const supabase = createClient();
    const title = `${selectedSubject} — ${new Date().toLocaleDateString("ar-DZ")}`;
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user!.id,
        title,
        subject: selectedSubject,
        grade_level: selectedGrade || user!.grade_level,
      })
      .select()
      .single();
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

      // Build request body
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

      if (!response.ok) throw new Error("فشل الاتصال بالمعلم");
      if (!response.body) throw new Error("لا توجد استجابة");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
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

      // Save to DB
      const supabase = createClient();
      await supabase.from("messages").insert([
        { conversation_id: convId, role: "user", content: text, image_url: imagePreview },
        { conversation_id: convId, role: "assistant", content: fullText },
      ]);

      // Award XP
      await supabase.from("users").update({
        total_xp: (user!.total_xp ?? 0) + 5,
      }).eq("id", user!.id);

    } catch (err) {
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResearch = () => {
    setInput(`اكتب لي بحثاً كاملاً عن موضوع في مادة ${selectedSubject} (مقدمة، فقرات رئيسية، خاتمة، مراجع)`);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen" dir="rtl">
      {/* Top bar */}
      <div
        className="border-b border-olive/10 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: theme.accentLight }}
          >
            <Bot size={18} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="font-bold text-sm text-ink">زن المعلم</p>
            <p className="text-xs text-muted">معلم · مربٍّ · مرشد</p>
          </div>
        </div>

        {/* Subject + Grade picker */}
        <div className="flex items-center gap-2">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs bg-beige border border-olive/20 rounded-lg px-2 py-1.5 text-ink focus:border-olive focus:outline-none"
          >
            {Object.entries(GRADE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button
            onClick={() => setShowSubjectPicker(!showSubjectPicker)}
            className="flex items-center gap-1.5 text-xs bg-beige border border-olive/20 rounded-lg px-3 py-1.5 hover:border-olive/40 transition-colors"
            style={{ color: theme.accent }}
          >
            <BookOpen size={12} />
            {selectedSubject || "المادة"}
            <ChevronDown size={12} />
          </button>

          <button
            onClick={handleResearch}
            className="hidden sm:flex items-center gap-1.5 text-xs border border-olive/30 rounded-lg px-3 py-1.5 hover:bg-olive/5 transition-colors text-olive"
          >
            <FileText size={12} />
            اطلب بحثاً
          </button>
        </div>
      </div>

      {/* Subject dropdown */}
      <AnimatePresence>
        {showSubjectPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-4 right-4 lg:right-auto lg:left-auto z-30 bg-white border border-olive/20 rounded-2xl shadow-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-sm ml-auto"
          >
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => { setSelectedSubject(sub); setShowSubjectPicker(false); }}
                className={`text-xs px-3 py-2 rounded-xl border transition-all text-right ${
                  selectedSubject === sub
                    ? "border-olive bg-olive/10 text-olive font-bold"
                    : "border-olive/10 hover:border-olive/30 text-ink-light"
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: theme.accentLight }}
            >
              <Sparkles size={36} style={{ color: theme.accent }} />
            </div>
            <h3 className="text-2xl font-display font-black text-ink mb-2">
              أهلاً {user?.first_name}! 👋
            </h3>
            <p className="text-ink-light mb-6">
              أنا زن المعلم. كيف تشعر اليوم؟ هل أنت جاهز للدراسة؟
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                `اشرح لي درس في ${selectedSubject || "الرياضيات"}`,
                "أريد اختباراً قصيراً",
                "كيف أنظم وقت دراستي؟",
                "أشعر بالقلق من الامتحان",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-sm px-4 py-2 rounded-xl border border-olive/20 hover:border-olive/40 hover:bg-olive/5 transition-all text-ink-light"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            userName={user?.first_name ?? ""}
            theme={theme}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 lg:px-8 pb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 w-auto rounded-xl border border-olive/20 object-cover" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 lg:px-8 py-4 border-t border-olive/10 bg-white/80 backdrop-blur flex-shrink-0">
        <div
          className="flex items-end gap-3 bg-beige rounded-2xl border-2 p-3 transition-colors focus-within:border-olive/40"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl hover:bg-white transition-colors flex-shrink-0"
            style={{ color: theme.accent }}
          >
            <Image size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageSelect} />

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`اسأل عن ${selectedSubject || "أي مادة"}...`}
            rows={1}
            className="flex-1 bg-transparent text-ink placeholder:text-muted text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
            style={{ minHeight: "40px" }}
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isStreaming || (!input.trim() && !imageFile)}
            className="p-2.5 rounded-xl text-white flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: theme.accent }}
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </motion.button>
        </div>
        <p className="text-center text-xs text-muted mt-2">
          اضغط Enter للإرسال، Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
