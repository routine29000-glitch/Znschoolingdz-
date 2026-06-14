"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { GraduationCap, Eye, EyeOff, User, Mail, Lock, BookOpen, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { GRADE_LABELS } from "@/lib/utils";
import { User as UserType } from "@/types";

const schema = z.object({
  first_name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  last_name: z.string().min(2, "اللقب يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  grade_level: z.string().min(1, "اختر المستوى الدراسي"),
  gender: z.enum(["male", "female", "not_specified"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "not_specified" },
  });

  const selectedGender = watch("gender");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // 1. إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("البريد الإلكتروني مسجل مسبقاً");
        } else {
          toast.error(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("فشل إنشاء الحساب، حاول مرة أخرى");
        setIsLoading(false);
        return;
      }

      // 2. إضافة بيانات المستخدم في جدول users
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        grade_level: data.grade_level,
        gender: data.gender,
        subscription_tier: "none",
        total_xp: 0,
        is_banned: false,
        is_admin: false,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
      }

      // 3. حفظ بيانات المستخدم مباشرة بدون انتظار جلبها
      const userProfile: UserType = {
        id: authData.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        grade_level: data.grade_level,
        gender: data.gender,
        subscription_tier: "none",
        subscription_expires_at: null,
        exam_package: null,
        total_xp: 0,
        is_banned: false,
        is_admin: false,
        created_at: new Date().toISOString(),
      };

      setUser(userProfile);
      toast.success(`مرحباً ${data.first_name}! تم إنشاء حسابك بنجاح 🎉`);

      // 4. الانتقال لصفحة الأسعار
      router.push("/pricing");

    } catch (error: unknown) {
      console.error("Signup error:", error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      toast.error(`خطأ: ${msg}`, { duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  const genderColors = {
    male: "bg-blue-light border-blue-calm/40 text-blue-calm",
    female: "bg-pink-soft border-peach-warm/40 text-peach-warm",
    not_specified: "bg-olive/10 border-olive/30 text-olive",
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-olive/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-olive to-olive-dark rounded-2xl flex items-center justify-center shadow-xl shadow-olive/25">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="font-display font-black text-2xl text-ink">
              Zn <span className="gradient-text">Schooling</span> Dz
            </span>
          </Link>
          <h1 className="text-3xl font-display font-black text-ink mb-2">إنشاء حساب جديد</h1>
          <p className="text-ink-light">أول خطوة نحو التفوق 🚀</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-ink/5 p-8 border border-olive/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">الاسم *</label>
                <div className="relative">
                  <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    {...register("first_name")}
                    placeholder="محمد"
                    className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 pr-9 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all"
                  />
                </div>
                {errors.first_name && (
                  <p className="text-error text-xs mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">اللقب *</label>
                <input
                  {...register("last_name")}
                  placeholder="بن علي"
                  className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all"
                />
                {errors.last_name && (
                  <p className="text-error text-xs mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="example@gmail.com"
                  dir="ltr"
                  className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 pr-9 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all text-right"
                />
              </div>
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">كلمة المرور *</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 pr-9 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">تأكيد المرور *</label>
                <input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                <BookOpen size={14} className="inline ml-1" />
                المستوى الدراسي *
              </label>
              <select
                {...register("grade_level")}
                className="w-full bg-beige border border-olive/20 rounded-xl px-4 py-3 text-ink focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all"
              >
                <option value="">اختر مستواك الدراسي</option>
                <optgroup label="المرحلة الابتدائية">
                  {["1ap", "2ap", "3ap", "4ap", "5ap"].map((g) => (
                    <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                  ))}
                </optgroup>
                <optgroup label="المرحلة المتوسطة">
                  {["1am", "2am", "3am", "4am"].map((g) => (
                    <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                  ))}
                </optgroup>
                <optgroup label="المرحلة الثانوية">
                  {["1as", "2as", "3as"].map((g) => (
                    <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                  ))}
                </optgroup>
                <option value="university">الجامعة</option>
              </select>
              {errors.grade_level && (
                <p className="text-error text-xs mt-1">{errors.grade_level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-3">
                <Users size={14} className="inline ml-1" />
                الجنس (يؤثر على ألوان الواجهة)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "male", label: "ذكر", icon: "👦" },
                  { value: "female", label: "أنثى", icon: "👧" },
                  { value: "not_specified", label: "لا أرغب", icon: "✨" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${
                      selectedGender === opt.value
                        ? genderColors[opt.value as keyof typeof genderColors]
                        : "border-olive/10 bg-beige text-ink-light hover:border-olive/30"
                    }`}
                  >
                    <input
                      {...register("gender")}
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                    />
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                  </label>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-olive to-olive-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-olive/25 hover:shadow-xl hover:shadow-olive/35 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإنشاء...
                </span>
              ) : (
                "إنشاء الحساب 🚀"
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-olive font-semibold hover:underline">
              سجل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
