"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") {
        router.replace(redirectTo);
        return;
      }
      setChecking(false);
    };
    checkAdmin();
  }, [router, redirectTo]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">テニスコート予約</h1>
          <p className="text-on-background/70 text-sm">管理画面</p>
        </div>
        <AdminLoginForm redirectTo={redirectTo} />
        <p className="mt-6 text-center text-sm text-on-background/60">
          <Link href="/admin" className="text-primary hover:underline">
            管理者トップページへ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-on-background/70">読み込み中...</div>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
