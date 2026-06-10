# 🎓 Zn Schooling Dz

**أقوى منصة تعليمية جزائرية — مدعومة بـ Gemini 1.5 Pro**

معلم ذكي + مربٍّ نفسي + مرشد أكاديمي، مخصص لطلاب الجزائر من الابتدائي حتى الجامعة.

---

## 🚀 طريقة التشغيل

### 1. رفع الملفات على GitHub
ارفع كل الملفات على GitHub Repository جديد باسم `zn-schooling-dz`.

### 2. إعداد Supabase

#### أ. إنشاء المشروع
1. اذهب إلى [supabase.com](https://supabase.com) → New Project
2. احفظ: **Project URL** و**Anon Key** و**Service Role Key**

#### ب. تشغيل SQL Schema
1. من القائمة الجانبية → **SQL Editor**
2. انسخ محتوى ملف `supabase-schema.sql`
3. اضغط **Run**

#### ج. إنشاء Storage Buckets
1. من القائمة → **Storage** → **New bucket**
2. أنشئ:
   - `receipts` → **Private** ✅
   - `avatars` → **Public** ✅

#### د. إعداد Authentication
1. من **Authentication** → **URL Configuration**
2. ضع Site URL: `https://your-app.vercel.app`
3. أضف Redirect URLs: `https://your-app.vercel.app/**`

### 3. إعداد متغيرات البيئة في `.env.local`

```env
GEMINI_API_KEY=AQ.Ab8RN6JgZyipfEX-VM0EIDNKFkvDZs70TDj3rG-TdL4yvMSVCw
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
CCP_NUMBER=00799999004423597809
CCP_OWNER_NAME="محمد بن أحمد"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. تشغيل محلي

```bash
npm install
npm run dev
```

افتح: http://localhost:3000

### 5. النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com) → Import Project من GitHub
2. أضف كل متغيرات البيئة في **Environment Variables**
3. اضغط **Deploy**

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── page.tsx              ← الصفحة الرئيسية
│   ├── signup/               ← التسجيل
│   ├── login/                ← الدخول
│   ├── pricing/              ← الأسعار
│   ├── payment/[plan]/       ← الدفع
│   ├── dashboard/            ← لوحة الطالب
│   │   ├── page.tsx          ← الرئيسية
│   │   ├── chat/             ← المحادثة
│   │   ├── quizzes/          ← الاختبارات
│   │   ├── exam-prep/        ← الدروس الخصوصية
│   │   ├── achievements/     ← الإنجازات
│   │   └── settings/         ← الإعدادات
│   ├── admin/                ← الإدارة
│   └── api/
│       ├── chat/             ← Streaming API
│       ├── quiz/generate/    ← توليد الاختبارات
│       └── study-plan/       ← توليد الخطة الدراسية
├── components/
│   ├── auth/AuthProvider.tsx
│   ├── dashboard/DashboardSidebar.tsx
│   └── chat/ChatMessage.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── gemini.ts
│   └── utils.ts
├── store/
│   ├── authStore.ts
│   └── chatStore.ts
├── types/index.ts
└── data/plans.ts
```

---

## 💰 نظام الاشتراكات

| الباقة | السعر |
|--------|-------|
| شهري | 2,000 دج |
| سنوي | 15,000 دج |
| BEM | 5,000 دج |
| BAC | 10,000 دج |
| سياق | 2,000 دج |

**الدفع:** CCP رقم `00799999004423597809` باسم محمد بن أحمد

---

## 🛠️ التقنيات

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + تصميم مخصص
- **Supabase** Auth + PostgreSQL + Storage + RLS
- **Gemini 1.5 Pro** معلم ذكي + Streaming
- **Framer Motion** تأثيرات بصرية
- **Zustand** إدارة الحالة
- **React Hook Form + Zod** التحقق من النماذج

---

## 🔐 إنشاء حساب الأدمن

في Supabase SQL Editor:
```sql
UPDATE public.users SET is_admin = TRUE WHERE email = 'your-admin@email.com';
```

---

## 📞 الدعم
- المنصة تعمل على الجوال والحاسوب
- الدفع عبر CCP فقط
- التفعيل خلال 24 ساعة بعد إرسال الوصل
