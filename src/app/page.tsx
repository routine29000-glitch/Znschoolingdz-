"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  BookOpen, Brain, Heart, Star, Trophy, Zap, ArrowLeft,
  CheckCircle, Users, Award, Clock, ChevronDown, Sparkles,
  GraduationCap, Target, TrendingUp,
} from "lucide-react";

const floatingOrbs = [
  { cx: "10%", cy: "20%", r: 200, color: "rgba(74,124,89,0.06)", duration: 8 },
  { cx: "80%", cy: "10%", r: 300, color: "rgba(143,203,129,0.05)", duration: 10 },
  { cx: "50%", cy: "80%", r: 250, color: "rgba(74,124,89,0.04)", duration: 12 },
  { cx: "90%", cy: "70%", r: 180, color: "rgba(74,124,89,0.05)", duration: 9 },
];

const stats = [
  { value: "58", label: "ولاية جزائرية", icon: <Star size={20} /> },
  { value: "100%", label: "مدعوم بالذكاء الاصطناعي", icon: <Brain size={20} /> },
  { value: "3", label: "أدوار في واحد", icon: <Heart size={20} /> },
  { value: "∞", label: "دروس غير محدودة", icon: <BookOpen size={20} /> },
];

const features = [
  {
    icon: <Brain size={28} />,
    title: "معلم ذكي متكيف",
    desc: "يشرح كل درس بأسلوب مخصص لك. يستخدم Gemini 1.5 Pro لفهم أسئلتك والإجابة عليها بطريقة واضحة تتبع المنهاج الجزائري.",
    color: "from-olive/10 to-olive/5",
    border: "border-olive/20",
  },
  {
    icon: <Heart size={28} />,
    title: "مربٍّ نفسي حنون",
    desc: "يسألك كيف تشعر، يشجعك بالعبارات الجزائرية، ويدعمك نفسياً في الأوقات الصعبة. أنت لست وحدك.",
    color: "from-error/10 to-error/5",
    border: "border-error/20",
  },
  {
    icon: <Target size={28} />,
    title: "مرشد أكاديمي",
    desc: "يضع لك جدولاً دراسياً، يذكرك بالراحة والنوم، ويطبق نظام التكرار الذكي للمعلومات الصعبة.",
    color: "from-blue-calm/10 to-blue-calm/5",
    border: "border-blue-calm/20",
  },
  {
    icon: <Trophy size={28} />,
    title: "استعداد الامتحانات",
    desc: "خطط مكثفة لـ BEM وBAC. اختبارات تجريبية يومية، تصحيح آلي مع شرح، ونصائح نفسية للامتحان.",
    color: "from-success/10 to-success/5",
    border: "border-success/20",
  },
  {
    icon: <Zap size={28} />,
    title: "تكرار ذكي للدروس",
    desc: "الأسئلة التي تخطئ فيها تعود تلقائياً بعد يوم، 3 أيام، أسبوع، 30 يوماً. علم معتمد لترسيخ المعلومات.",
    color: "from-olive/10 to-olive/5",
    border: "border-olive/20",
  },
  {
    icon: <Award size={28} />,
    title: "نظام المكافآت",
    desc: "اكسب نقاط XP على كل درس وامتحان. احتفل بإنجازاتك وشاهد تقدمك يومياً.",
    color: "from-error/10 to-error/5",
    border: "border-error/20",
  },
];

const testimonials = [
  {
    name: "أمينة بن علي",
    grade: "BAC 2024 — ثانوية تلمسان",
    text: "بفضل Zn Schooling Dz نجحت في البكالوريا بـ 14.5! المعلم الذكي كان معي في كل لحظة صعبة.",
    avatar: "أ",
    stars: 5,
    gender: "female",
  },
  {
    name: "يوسف حمدي",
    grade: "BEM 2024 — متوسطة الجزائر",
    text: "الاختبارات التجريبية ساعدتني كثيراً. التصحيح التلقائي مع الشرح أحسن من أي مدرس خصوصي!",
    avatar: "ي",
    stars: 5,
    gender: "male",
  },
  {
    name: "سارة مزيان",
    grade: "5 ابتدائي — وهران",
    text: "ابنتي تحب المعلم الذكي أكثر من الدراسة العادية. يشجعها ويحفزها بطريقة رائعة.",
    avatar: "س",
    stars: 5,
    gender: "female",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-olive to-olive-dark rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-800 text-xl text-ink">
              Zn <span className="gradient-text">Schooling</span> Dz
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-ink-light hover:text-olive transition-colors px-4 py-2"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className="bg-olive hover:bg-olive-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-olive/25"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 particles-bg">
        {/* Floating SVG orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingOrbs.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: orb.cx,
                top: orb.cy,
                width: orb.r * 2,
                height: orb.r * 2,
                background: `radial-gradient(circle, ${orb.color}, transparent)`,
                transform: "translate(-50%, -50%)",
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-olive/10 border border-olive/20 text-olive rounded-full px-4 py-2 text-sm font-semibold mb-8"
          >
            <Sparkles size={14} />
            <span>مدعوم بـ Gemini 1.5 Pro — الأذكى في الجزائر</span>
            <Sparkles size={14} />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-ink leading-tight mb-6"
          >
            معلمك الذكي
            <br />
            <span className="gradient-text">في كل لحظة</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-ink-light max-w-3xl mx-auto leading-relaxed mb-4"
          >
            أول منصة تعليمية جزائرية يجمع فيها الذكاء الاصطناعي بين ثلاثة أدوار:
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-olive mb-10"
          >
            معلم · مربٍّ نفسي · مرشد أكاديمي
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-3 bg-gradient-to-r from-olive to-olive-dark text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-olive/30 hover:shadow-2xl hover:shadow-olive/40 transition-all duration-300 hover:-translate-y-1"
            >
              <span>ابدأ رحلتك الآن</span>
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 bg-white/80 backdrop-blur border border-olive/20 text-olive text-lg font-semibold px-8 py-4 rounded-2xl hover:border-olive/40 hover:bg-white transition-all duration-200"
            >
              <span>عرض الأسعار</span>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted"
          >
            {["منهاج وزارة التربية الوطنية", "BEM & BAC", "كل الولايات الـ 58", "دعم نفسي يومي"].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-olive" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted"
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white/60 backdrop-blur border-y border-olive/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-olive/10 rounded-2xl flex items-center justify-center text-olive mx-auto mb-3">
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-ink mb-1">{stat.value}</div>
              <div className="text-sm text-muted font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-black text-ink mb-4">
              لماذا <span className="gradient-text">Zn Schooling Dz</span>؟
            </h2>
            <p className="text-xl text-ink-light max-w-2xl mx-auto">
              منصة مصممة خصيصاً للطالب الجزائري، تفهم احتياجاته وتتكيف معه
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`card-hover bg-gradient-to-br ${feature.color} border ${feature.border} rounded-3xl p-6`}
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-olive shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">{feature.title}</h3>
                <p className="text-ink-light leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Prep Section */}
      <section className="py-24 bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-olive/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-olive/20 border border-olive/30 text-olive rounded-full px-4 py-2 text-sm font-semibold mb-8">
              <Trophy size={14} />
              <span>الاستعداد للامتحانات المصيرية</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-black mb-6">
              BEM أو BAC؟
              <br />
              <span className="text-olive">نحن هنا معك</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
              خطط دراسية مكثفة، اختبارات تجريبية يومية، ودعم نفسي متخصص للامتحانات المصيرية
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                {
                  title: "باقة BEM",
                  price: "5,000 دج",
                  period: "لمدة 3 أشهر",
                  features: ["خطة دراسية مكثفة", "اختبارات تجريبية يومية", "تصحيح آلي مع شرح", "متابعة نفسية"],
                  color: "border-olive/40 bg-olive/10",
                  btn: "bg-olive hover:bg-olive-dark",
                },
                {
                  title: "باقة BAC",
                  price: "10,000 دج",
                  period: "لمدة 3 أشهر",
                  features: ["كل مميزات BEM", "جلسات أسبوعية مع AI", "توقعات الامتحان", "تقارير للأهل"],
                  color: "border-success/40 bg-success/10",
                  btn: "bg-success hover:bg-green-600",
                },
              ].map((pkg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`border ${pkg.color} rounded-3xl p-6 text-right`}
                >
                  <h3 className="text-2xl font-black mb-1">{pkg.title}</h3>
                  <div className="text-3xl font-black text-olive mb-1">{pkg.price}</div>
                  <div className="text-sm text-white/50 mb-4">{pkg.period}</div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle size={14} className="text-olive flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`block w-full ${pkg.btn} text-white text-center font-bold py-3 rounded-xl transition-colors`}
                  >
                    اشتري الآن
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-black text-ink mb-4">
              ماذا يقول <span className="gradient-text">طلابنا</span>؟
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-olive/10 rounded-3xl p-6 card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-ink-light leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${t.gender === "female" ? "bg-peach-warm" : "bg-blue-calm"}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-ink text-sm">{t.name}</div>
                    <div className="text-xs text-muted">{t.grade}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-olive/5 via-cream to-success/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-6">🎓</div>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-ink mb-4">
              جاهز تبدأ؟
            </h2>
            <p className="text-xl text-ink-light mb-8">
              انضم الآن وابدأ رحلتك نحو التفوق مع معلمك الذكي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-olive to-olive-dark text-white text-lg font-bold px-10 py-4 rounded-2xl shadow-xl shadow-olive/30 hover:shadow-2xl hover:shadow-olive/40 transition-all duration-300 hover:-translate-y-1"
              >
                <span>سجّل الآن</span>
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 border-2 border-olive text-olive text-lg font-semibold px-10 py-4 rounded-2xl hover:bg-olive hover:text-white transition-all duration-200"
              >
                <TrendingUp size={18} />
                <span>الأسعار</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white/60 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <GraduationCap size={16} className="text-olive" />
            <span className="font-bold text-white">Zn Schooling Dz</span>
          </div>
          <p>© 2024 Zn Schooling Dz — جميع الحقوق محفوظة | منصة تعليمية جزائرية</p>
          <p className="mt-1 text-xs">يتبع منهاج وزارة التربية الوطنية الجزائرية</p>
        </div>
      </footer>
    </div>
  );
}
