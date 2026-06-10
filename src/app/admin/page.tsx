"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Shield, Users, CreditCard, CheckCircle, XCircle,
  Eye, Ban, TrendingUp, DollarSign, RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { PaymentRequest, User } from "@/types";
import { formatCurrency, GRADE_LABELS } from "@/lib/utils";
import { PLANS } from "@/data/plans";

type Tab = "requests" | "users" | "stats";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, totalRevenue: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_admin) { router.push("/dashboard"); return; }
    fetchAll();
  }, [user, router]);

  const fetchAll = async () => {
    setLoading(true);
    const supabase = createClient();
    const [reqRes, usersRes, paymentsRes] = await Promise.all([
      supabase.from("payment_requests").select("*, user:users(*)").order("created_at", { ascending: false }),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_requests").select("amount, status"),
    ]);

    setRequests(reqRes.data as PaymentRequest[] ?? []);
    setUsers(usersRes.data as User[] ?? []);

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
    const plan = PLANS.find((p) => p.id === req.plan);
    const expiresAt = new Date();
    if (req.plan === "monthly") expiresAt.setDate(expiresAt.getDate() + 30);
    else if (req.plan === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setDate(expiresAt.getDate() + 90);

    const isExamPlan = ["bem", "bac", "context"].includes(req.plan);
    const baseUpdate: Record<string, unknown> = {};
    if (isExamPlan) {
      baseUpdate.exam_package = req.plan;
    } else {
      baseUpdate.subscription_tier = req.plan;
      baseUpdate.subscription_expires_at = expiresAt.toISOString();
    }

    await supabase.from("users").update(baseUpdate).eq("id", req.user_id);
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
    toast.success(isBanned ? "تم رفع الحظر" : "تم حظر المستخدم");
    fetchAll();
  };

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-beige" dir="rtl">
      <div className="bg-ink text-white px-6 py-4 flex items-center gap-3">
        <Shield size={24} className="text-olive" />
        <div>
          <h1 className="font-display font-black text-xl">لوحة الإدارة</h1>
          <p className="text-white/50 text-xs">Zn Schooling Dz — Admin Panel</p>
        </div>
        <button onClick={fetchAll} className="mr-auto p-2 hover:bg-white/10 rounded-xl transition-colors">
          <RefreshCw size={16} className="text-white/60" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {[
          { label: "المستخدمون", value: stats.totalUsers, icon: <Users size={20} />, color: "bg-blue-calm/10 text-blue-calm" },
          { label: "مشتركون نشطون", value: stats.activeSubscriptions, icon: <CheckCircle size={20} />, color: "bg-success/10 text-green-700" },
          { label: "الإيرادات", value: formatCurrency(stats.totalRevenue), icon: <DollarSign size={20} />, color: "bg-olive/10 text-olive" },
          { label: "طلبات معلقة", value: stats.pendingRequests, icon: <CreditCard size={20} />, color: "bg-error/10 text-error" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-olive/10"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-black text-ink">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex gap-2">
        {([
          { id: "requests" as Tab, label: "طلبات الاشتراك" },
          { id: "users" as Tab, label: "المستخدمون" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id ? "bg-olive text-white" : "bg-white border border-olive/20 text-ink hover:border-olive/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 pb-10">
        {/* Payment Requests */}
        {tab === "requests" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-muted">جاري التحميل...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-muted">لا توجد طلبات</div>
            ) : requests.map((req) => {
              const u = req.user as User | undefined;
              const plan = PLANS.find((p) => p.id === req.plan);
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-olive/10 p-4">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-ink">{u?.first_name} {u?.last_name}</p>
                      <p className="text-xs text-muted">{u?.email} — {GRADE_LABELS[u?.grade_level ?? ""] ?? u?.grade_level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-olive">{formatCurrency(req.amount)}</p>
                      <p className="text-xs font-semibold text-ink">{plan?.nameAr ?? req.plan}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      req.status === "pending" ? "bg-amber-100 text-amber-700" :
                      req.status === "approved" ? "bg-success/20 text-green-700" :
                      "bg-error/10 text-error"
                    }`}>
                      {req.status === "pending" ? "⏳ قيد الانتظار" :
                       req.status === "approved" ? "✅ مقبول" : "❌ مرفوض"}
                    </span>

                    {req.receipt_url && (
                      <button
                        onClick={() => setPreviewUrl(req.receipt_url)}
                        className="flex items-center gap-1 text-xs text-olive hover:underline"
                      >
                        <Eye size={12} />
                        عرض الوصل
                      </button>
                    )}

                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveRequest(req)}
                          className="flex items-center gap-1 text-xs bg-success/20 text-green-700 font-bold px-3 py-1.5 rounded-lg hover:bg-success/30 transition-colors"
                        >
                          <CheckCircle size={12} />
                          قبول وتفعيل
                        </button>
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="flex items-center gap-1 text-xs bg-error/10 text-error font-bold px-3 py-1.5 rounded-lg hover:bg-error/20 transition-colors"
                        >
                          <XCircle size={12} />
                          رفض
                        </button>
                      </>
                    )}
                  </div>

                  {req.notes && (
                    <p className="mt-2 text-xs text-muted bg-beige rounded-lg p-2">📝 {req.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl border border-olive/10 p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink">{u.first_name} {u.last_name}</p>
                    {u.is_admin && <span className="bg-olive/10 text-olive text-xs font-bold px-2 py-0.5 rounded-full">أدمن</span>}
                    {u.is_banned && <span className="bg-error/10 text-error text-xs font-bold px-2 py-0.5 rounded-full">محظور</span>}
                  </div>
                  <p className="text-xs text-muted">{u.email} — {GRADE_LABELS[u.grade_level] ?? u.grade_level}</p>
                  <p className="text-xs text-muted mt-0.5">
                    اشتراك: {u.subscription_tier === "none" ? "لا يوجد" : u.subscription_tier} — {u.total_xp} XP
                  </p>
                </div>
                {!u.is_admin && (
                  <button
                    onClick={() => toggleBan(u.id, u.is_banned)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      u.is_banned
                        ? "bg-success/10 text-green-700 hover:bg-success/20"
                        : "bg-error/10 text-error hover:bg-error/20"
                    }`}
                  >
                    <Ban size={12} />
                    {u.is_banned ? "رفع الحظر" : "حظر"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-lg w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-olive/10">
              <h3 className="font-bold text-ink">وصل التحويل</h3>
              <button onClick={() => setPreviewUrl(null)} className="text-muted hover:text-ink">✕</button>
            </div>
            <div className="p-4">
              {previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img src={previewUrl} alt="receipt" className="w-full rounded-xl max-h-96 object-contain" />
              ) : (
                <a href={previewUrl} target="_blank" rel="noreferrer" className="block text-center text-olive hover:underline">
                  فتح الملف في تبويب جديد →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
