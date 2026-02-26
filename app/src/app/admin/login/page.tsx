"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import Link from "next/link";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">テニスコート予約</h1>
          <p className="text-on-background/70 text-sm">管理画面</p>
        </div>
        <AdminLoginForm redirectTo={redirectTo} />
        <p className="mt-6 text-center text-sm text-on-background/60">
          <Link href="/" className="text-primary hover:underline">
            トップページへ
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
