import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Zn Schooling Dz — معلمك الذكي في الجزائر",
  description: "منصة تعليمية جزائرية احترافية مدعومة بالذكاء الاصطناعي. معلم + مربي + مرشد نفسي. استعد لـ BEM وBAC مع Zn Schooling Dz.",
  keywords: "تعليم, جزائر, BEM, BAC, ذكاء اصطناعي, معلم, دروس خصوصية",
  authors: [{ name: "Zn Schooling Dz" }],
  openGraph: {
    title: "Zn Schooling Dz — معلمك الذكي",
    description: "منصة تعليمية جزائرية مدعومة بالذكاء الاصطناعي",
    locale: "ar_DZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        />
      </head>
      <body className="font-arabic bg-cream text-ink antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "Cairo, sans-serif",
              direction: "rtl",
              background: "#FCFCFA",
              color: "#2C3E2F",
              border: "1px solid #4A7C59",
              borderRadius: "12px",
            },
            success: {
              iconTheme: { primary: "#4A7C59", secondary: "#FCFCFA" },
            },
            error: {
              iconTheme: { primary: "#C77D7D", secondary: "#FCFCFA" },
            },
          }}
        />
      </body>
    </html>
  );
}
