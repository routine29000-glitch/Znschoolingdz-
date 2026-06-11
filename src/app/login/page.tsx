"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { GraduationCap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

const schema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setIsLoading(false);
        return;
      }

      // جلب بيانات المستخدم
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        toast.error("فشل جلب بيانات الحساب");
        setIsLoading(false);
        return;
      }

      if (profile.is_banned) {
        await supabase.auth.signOut();
        toast.error("تم حظر حسابك. تواصل مع الإدارة.");
        setIsLoading(false);
        return;
      }

      // حفظ المستخدم في الـ store
      setUser(profile as User);
      toast.success(`مرحباً بعودتك ${profile.first_name}! 👋`);

      // التوجيه الصحيح
      if (profile.is_admin) {
        router.push("/admin");
      } else if (!profile.subscription_tier || profile.subscription_tier === "none") {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      toast.error("حدث خطأ غير متوقع، حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
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
        className="relative w-full max-w-md"
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
          <h1 className="text-3xl font-display font-black text-ink mb-2">مرحباً بعودتك!</h1>
          <p className="text-ink-light">سجل الدخول لمتابعة تقدمك 📚</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-ink/5 p-8 border border-olive/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">البريد الإلكتروني</label>
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

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">كلمة المرور</label>
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

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-olive to-olive-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-olive/25 hover:shadow-xl hover:shadow-olive/35 transition-all duration-200 disabled:opacity-60 text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الدخول...
                </span>
              ) : (
                "تسجيل الدخول 👋"
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="text-olive font-semibold hover:underline">
              سجل الآن
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
