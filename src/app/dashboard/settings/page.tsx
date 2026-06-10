"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Lock, Trash2, Save, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTheme, GRADE_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  first_name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  last_name: z.string().min(2, "اللقب يجب أن يكون حرفين على الأقل"),
  grade_level: z.string().min(1, "اختر المستوى الدراسي"),
  gender: z.enum(["male", "female", "not_specified"]),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const theme = getTheme(user?.gender ?? "not_specified");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "danger">("profile");

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      grade_level: user?.grade_level ?? "",
      gender: user?.gender ?? "not_specified",
    },
  });

  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSave = async (data: ProfileData) => {
    const supabase = createClient();
    const { error } = await supabase.from("users").update(data).eq("id", user!.id);
    if (error) { toast.error("فشل الحفظ"); return; }
    setUser({ ...user!, ...data });
    toast.success("تم حفظ التعديلات ✅");
  };

  const onPasswordChange = async (data: PasswordData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) { toast.error("فشل تغيير كلمة المرور"); return; }
    toast.success("تم تغيير كلمة المرور ✅");
    passwordForm.reset();
  };

  const onDeleteAccount = async () => {
    const supabase = createClient();
    await supabase.from("users").delete().eq("id", user!.id);
    await supabase.auth.signOut();
    logout();
    router.push("/");
    toast.success("تم حذف الحساب");
  };

  if (!user) return null;

  const tabs = [
    { id: "profile" as const, label: "الملف الشخصي", icon: <User size={16} /> },
    { id: "security" as const, label: "الأمان", icon: <Lock size={16} /> },
    { id: "danger" as const, label: "منطقة الخطر", icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-black text-ink mb-2">الإعدادات</h1>
        <p className="text-ink-light mb-8">إدارة حسابك وبياناتك</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-beige rounded-2xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl border border-olive/10 p-6">
              <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">الاسم</label>
                    <input
                      {...profileForm.register("first_name")}
                      className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive transition-all"
                    />
                    {profileForm.formState.errors.first_name && (
                      <p className="text-error text-xs mt-1">{profileForm.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">اللقب</label>
                    <input
                      {...profileForm.register("last_name")}
                      className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">المستوى الدراسي</label>
                  <select
                    {...profileForm.register("grade_level")}
                    className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive transition-all"
                  >
                    {Object.entries(GRADE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-3">الجنس</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "male", label: "ذكر", emoji: "👦" },
                      { value: "female", label: "أنثى", emoji: "👧" },
                      { value: "not_specified", label: "لا أرغب", emoji: "✨" },
                    ].map((opt) => (
                      <label key={opt.value} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${
                        profileForm.watch("gender") === opt.value
                          ? "border-olive bg-olive/10 text-olive"
                          : "border-olive/10 bg-beige text-ink-light"
                      }`}>
                        <input {...profileForm.register("gender")} type="radio" value={opt.value} className="sr-only" />
                        <div className="text-xl mb-1">{opt.emoji}</div>
                        <div className="text-xs font-semibold">{opt.label}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-beige rounded-xl p-3 text-sm text-muted">
                  <strong className="text-ink">البريد الإلكتروني:</strong> {user.email}
                  <p className="text-xs mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                </div>

                <button
                  type="submit"
                  className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{ background: theme.accent }}
                >
                  <Save size={16} />
                  حفظ التعديلات
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl border border-olive/10 p-6">
              <h3 className="font-bold text-ink mb-4">تغيير كلمة المرور</h3>
              <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">كلمة المرور الجديدة</label>
                  <input
                    {...passwordForm.register("newPassword")}
                    type="password"
                    placeholder="••••••"
                    className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive transition-all"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-error text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">تأكيد كلمة المرور</label>
                  <input
                    {...passwordForm.register("confirmPassword")}
                    type="password"
                    placeholder="••••••"
                    className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive transition-all"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-error text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: theme.accent }}
                >
                  <Lock size={16} />
                  تغيير كلمة المرور
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl border border-error/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-error" />
                <h3 className="font-bold text-error">منطقة الخطر</h3>
              </div>
              <p className="text-sm text-ink-light mb-6">
                حذف الحساب يعني فقدان جميع بياناتك ومحادثاتك ونتائجك بشكل نهائي لا يمكن التراجع عنه.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full border-2 border-error text-error font-bold py-3 rounded-xl hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف الحساب نهائياً
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-error/10 rounded-xl p-4 text-sm text-error text-center">
                    هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه!
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 border-2 border-olive text-olive font-bold py-3 rounded-xl hover:bg-olive hover:text-white transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={onDeleteAccount}
                      className="flex-1 bg-error text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all"
                    >
                      نعم، احذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
