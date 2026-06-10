"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Shield, Users, CreditCard, CheckCircle, XCircle,
  Eye, Ban, RefreshCw, Lock, EyeOff, LogOut,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { PaymentRequest, User } from "@/types";
import { formatCurrency, GRADE_LABELS } from "@/lib/utils";
import { PLANS } from "@/data/plans";

// ============================================================
// كلمة السر الثابتة — لا تشاركها مع أحد
// ============================================================
const ADMIN_PASSWORD = "Zabzabikk@29";
const SESSION_KEY = "zn_admin_auth";

type Tab = "requests" | "users";

// ============================================================
// شاشة إدخال كلمة السر
// ============================================================
function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (!password.trim()) {
      toast.error("أدخل كلمة السر");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "true");
        toast.success("مرحباً بك في لوحة الإدارة ✅");
        onSuccess();
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        toast.error("كلمة السر غير صحيحة ❌");
        setPassword("");
      }
      setIsLoading(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0F4C3A 0%, #1a6b52 50%, #0F4C3A 100%)",
      }}
      dir="rtl"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #D4AF37, #f0cc6a)" }}
            >
              <Lock size={36} className="text-white drop-shadow" />
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">
              🔐 دخول الأدمن
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              أدخل كلمة السر للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Password input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••••••••••"
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all text-center text-xl tracking-widest"
                style={{ letterSpacing: password && !showPassword ? "0.3em" : "0.05em" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full font-black py-4 rounded-2xl text-lg transition-all disabled:opacity-60 shadow-xl flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #f0cc6a)",
              color: "#0F4C3A",
              boxShadow: "0 8px 32px rgba(212, 175, 55, 0.3)",
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-green-900/30 border-t-green-900 rounded-full animate-spin" />
            ) : (
              <>
                <Shield size={18} />
                تأكيد
              </>
            )}
          </motion.button>

          {/* Footer */}
          <p className="text-center text-white/30 text-xs mt-6">
            Zn Schooling Dz — Admin Panel
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================
// لوحة الأدمن الكاملة
// ============================================================
export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // حالة المصادقة بكلمة السر
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // حالة البيانات
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // تحقق من session عند تحميل الصفحة
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved === "true") setIsAuthenticated(true);
    setCheckingSession(false);
  }, []);

  // جلب البيانات بعد المصادقة
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAll();
  }, [isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    const supabase = createClient();
    const [reqRes, usersRes, paymentsRes] = await Promise.all([
      supabase
        .from("payment_requests")
        .select("*, user:users(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("payment_requests").select("amount, status"),
    ]);

    setRequests((reqRes.data as PaymentRequest[]) ?? []);
    setUsers((usersRes.data as User[]) ?? []);

    const approved = paymentsRes.data?.filter((p) => p.status === "approved") ?? [];
    const revenue = approved.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const activeUsers = usersRes.data?.filter((u) => u.subscription_tier !== "none") ?? [];
    const pending = reqRes.data?.filter((r) => r.status === "pending") ?? [];

    setStats({
      totalUsers: usersRes.data?.length ?? 0,
      activeSubscriptions: activeUsers.length,
      totalRevenue: revenue,
      pendingRequests: pending.length,
    });
    setLoading(false);
  };

  const approveRequest = async (req: PaymentRequest) => {
    const supabase = createClient();
    const expiresAt = new Date();
    if (req.plan === "monthly") expiresAt.setDate(expiresAt.getDate() + 30);
    else if (req.plan === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setDate(expiresAt.getDate() + 90);

    const isExamPlan = ["bem", "bac", "context"].includes(req.plan);
    const update: Record<string, unknown> = isExamPlan
      ? { exam_package: req.plan }
      : { subscription_tier: req.plan, subscription_expires_at: expiresAt.toISOString() };

    await supabase.from("users").update(update).eq("id", req.user_id);
    await supabase.from("payment_requests").update({ status: "approved" }).eq("id", req.id);

    toast.success(`تم تفعيل اشتراك ${(req.user as User)?.first_name} ✅`);
    fetchAll();
  };

  const rejectRequest = async (id: string) => {
    const supabase = createClient();
    await supabase.from("payment_requests").update({ status: "rejected" }).eq("id", id);
    toast.error("تم رفض الطلب");
    fetchAll();
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    const supabase = createClient();
    await supabase.from("users").update({ is_banned: !isBanned }).eq("id", userId);
    toast.success(isBanned ? "تم رفع الحظر ✅" : "تم حظر المستخدم 🚫");
    fetchAll();
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    toast.success("تم تسجيل الخروج");
  };

  // ======= تحميل التحقق من الجلسة =======
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F4C3A]">
        <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ======= شاشة كلمة السر =======
  if (!isAuthenticated) {
    return <AdminLoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // ======= لوحة الأدمن =======
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#f5f0e8]"
        dir="rtl"
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #0F4C3A, #1a6b52)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #D4AF37, #f0cc6a)" }}
          >
            <Shield size={20} className="text-[#0F4C3A]" />
          </div>
          <div className="flex-1">
            <h1 className="font-black text-xl text-white">لوحة الإدارة</h1>
            <p className="text-white/50 text-xs">Zn Schooling Dz — Admin Panel</p>
          </div>
          <button
            onClick={fetchAll}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={16} className="text-white/60" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white/70 text-xs font-semibold"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {[
            {
              label: "المستخدمون",
              value: stats.totalUsers,
              icon: <Users size={20} />,
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "مشتركون نشطون",
              value: stats.activeSubscriptions,
              icon: <CheckCircle size={20} />,
              color: "bg-green-50 text-green-600",
            },
            {
              label: "الإيرادات",
              value: formatCurrency(stats.totalRevenue),
              icon: <DollarSign size={20} />,
              color: "bg-yellow-50 text-yellow-600",
            },
            {
              label: "طلبات معلقة",
              value: stats.pendingRequests,
              icon: <CreditCard size={20} />,
              color: "bg-red-50 text-red-500",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-[#0F4C3A]">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-6 mb-4 flex gap-2">
          {(
            [
              { id: "requests" as Tab, label: "طلبات الاشتراك" },
              { id: "users" as Tab, label: "المستخدمون" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "text-white shadow-lg"
                  : "bg-white border border-black/10 text-gray-600 hover:border-[#0F4C3A]/30"
              }`}
              style={tab === t.id ? { background: "#0F4C3A" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-10">
          {/* ===== طلبات الاشتراك ===== */}
          {tab === "requests" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-10 text-gray-400">جاري التحميل...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-black/5">
                  لا توجد طلبات
                </div>
              ) : (
                requests.map((req) => {
                  const u = req.user as User | undefined;
                  const plan = PLANS.find((p) => p.id === req.plan);
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-[#0F4C3A]">
                            {u?.first_name} {u?.last_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {u?.email} —{" "}
                            {GRADE_LABELS[u?.grade_level ?? ""] ?? u?.grade_level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#D4AF37]">
                            {formatCurrency(req.amount)}
                          </p>
                          <p className="text-xs font-semibold text-gray-600">
                            {plan?.nameAr ?? req.plan}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            req.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {req.status === "pending"
                            ? "⏳ قيد الانتظار"
                            : req.status === "approved"
                            ? "✅ مقبول"
                            : "❌ مرفوض"}
                        </span>

                        {req.receipt_url && (
                          <button
                            onClick={() => setPreviewUrl(req.receipt_url)}
                            className="flex items-center gap-1 text-xs text-[#0F4C3A] hover:underline"
                          >
                            <Eye size={12} />
                            عرض الوصل
                          </button>
                        )}

                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveRequest(req)}
                              className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle size={12} />
                              قبول وتفعيل
                            </button>
                            <button
                              onClick={() => rejectRequest(req.id)}
                              className="flex items-center gap-1 text-xs bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <XCircle size={12} />
                              رفض
                            </button>
                          </>
                        )}
                      </div>

                      {req.notes && (
                        <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                          📝 {req.notes}
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* ===== المستخدمون ===== */}
          {tab === "users" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-10 text-gray-400">جاري التحميل...</div>
              ) : (
                users.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#0F4C3A]">
                          {u.first_name} {u.last_name}
                        </p>
                        {u.is_admin && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            أدمن
                          </span>
                        )}
                        {u.is_banned && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            محظور
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {GRADE_LABELS[u.grade_level] ?? u.grade_level} —{" "}
                        {u.subscription_tier === "none" ? "بدون اشتراك" : u.subscription_tier} —{" "}
                        {u.total_xp} XP
                      </p>
                    </div>

                    {!u.is_admin && (
                      <button
                        onClick={() => toggleBan(u.id, u.is_banned)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                          u.is_banned
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        <Ban size={12} />
                        {u.is_banned ? "رفع الحظر" : "حظر"}
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Receipt Preview Modal */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewUrl(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-w-lg w-full bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-black/5">
                  <h3 className="font-bold text-[#0F4C3A]">وصل التحويل</h3>
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  {previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <img
                      src={previewUrl}
                      alt="receipt"
                      className="w-full rounded-xl max-h-96 object-contain"
                    />
                  ) : (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-[#0F4C3A] hover:underline py-4"
                    >
                      فتح الملف في تبويب جديد →
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
