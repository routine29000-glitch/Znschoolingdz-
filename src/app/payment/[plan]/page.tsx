"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { GraduationCap, Upload, CheckCircle, ArrowRight, Copy } from "lucide-react";
import { PLANS, CCP_INFO } from "@/data/plans";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const planId = params.plan as string;
  const plan = PLANS.find((p) => p.id === planId);

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-ink-light mb-4">الباقة غير موجودة</p>
          <Link href="/pricing" className="text-olive font-bold hover:underline">
            ← العودة للأسعار
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("يرجى رفع صورة (JPG, PNG, WEBP) أو ملف PDF");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("يرجى رفع صورة وصل التحويل");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Upload receipt to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // Save payment request
      const { error: paymentError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          plan: planId,
          amount: plan.price,
          receipt_url: publicUrl || uploadData.path,
          notes: notes || null,
          status: "pending",
        });

      if (paymentError) throw paymentError;

      setUploaded(true);
      toast.success("تم إرسال طلبك بنجاح! سيتم التفعيل خلال ساعات ✅");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-display font-black text-ink mb-3">تم إرسال طلبك!</h2>
          <p className="text-ink-light mb-6 leading-relaxed">
            شكراً لك. سيتم مراجعة وصل التحويل وتفعيل اشتراكك خلال <strong>24 ساعة</strong> على الأكثر.
          </p>
          <div className="bg-olive/5 rounded-2xl p-4 mb-6 text-sm text-ink-light">
            <strong>الباقة:</strong> {plan.nameAr}<br />
            <strong>المبلغ:</strong> {formatCurrency(plan.price)}
          </div>
          <Link
            href="/dashboard"
            className="block w-full bg-olive hover:bg-olive-dark text-white font-bold py-3 rounded-xl transition-colors"
          >
            انتقل للوحة التحكم
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige py-12 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/pricing" className="text-muted hover:text-ink transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-olive to-olive-dark rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-black text-lg text-ink">
              Zn <span className="gradient-text">Schooling</span> Dz
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-black text-ink mb-2">إتمام الدفع</h1>
          <p className="text-ink-light mb-8">ادفع عبر CCP وأرفق صورة الوصل</p>

          {/* Plan summary */}
          <div className="bg-white border border-olive/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-ink">{plan.nameAr}</h3>
                <p className="text-sm text-muted">{plan.period}</p>
              </div>
              <div className="text-2xl font-black text-olive">{formatCurrency(plan.price)}</div>
            </div>
          </div>

          {/* CCP Info */}
          <div className="bg-ink text-white rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">💳 معلومات التحويل عبر CCP</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                <div>
                  <p className="text-white/60 text-xs mb-1">رقم CCP</p>
                  <p className="font-mono font-bold text-lg">{CCP_INFO.number}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(CCP_INFO.number)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-white/60" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                <div>
                  <p className="text-white/60 text-xs mb-1">اسم المستفيد</p>
                  <p className="font-bold">{CCP_INFO.owner}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(CCP_INFO.owner)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-white/60" />
                </button>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">المبلغ المطلوب</p>
                <p className="font-black text-xl text-olive">{formatCurrency(plan.price)}</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/50 bg-white/5 rounded-xl p-3">
              📌 قم بالتحويل من أي مكتب بريد أو عبر تطبيق Barid Mob
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="bg-white border border-olive/20 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-ink mb-4">📎 رفع صورة الوصل</h3>

            <label
              htmlFor="receipt"
              className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                file ? "border-olive bg-olive/5" : "border-olive/30 hover:border-olive/60 bg-beige"
              }`}
            >
              {file ? (
                <div>
                  <CheckCircle size={32} className="text-olive mx-auto mb-2" />
                  <p className="font-semibold text-olive">{file.name}</p>
                  <p className="text-xs text-muted mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} className="text-muted mx-auto mb-3" />
                  <p className="font-semibold text-ink">اضغط لرفع صورة الوصل</p>
                  <p className="text-sm text-muted mt-1">JPG, PNG, PDF — بحد أقصى 5MB</p>
                </div>
              )}
              <input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-ink mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات للإدارة..."
                rows={3}
                className="w-full bg-beige border border-olive/20 rounded-xl p-3 text-ink placeholder:text-muted focus:border-olive focus:ring-2 focus:ring-olive/20 transition-all resize-none text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className="w-full bg-gradient-to-r from-olive to-olive-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-olive/25 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </span>
            ) : (
              "إرسال طلب الاشتراك ✅"
            )}
          </motion.button>

          <p className="text-center text-xs text-muted mt-4">
            سيتم مراجعة طلبك وتفعيل الاشتراك خلال 24 ساعة
          </p>
        </motion.div>
      </div>
    </div>
  );
}
