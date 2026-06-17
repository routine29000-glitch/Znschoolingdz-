here"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        setUser(data as User);
      } catch {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // مهم: لا نستدعي أي طلب Supabase async مباشرة هنا
    // هذا يسبب deadlock معروف في supabase-js (GoTrueClient _acquireLock)
    // الحل: تأجيل الاستدعاء بـ setTimeout لإخراجه من الـ handler الداخلي
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const userId = session.user.id;
          setTimeout(() => {
            fetchUserProfile(userId);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
