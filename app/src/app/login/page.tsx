"use client";

import AuthForm from "@/components/AuthForm";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  // メール確認・パスワードリセットメールのリンクから戻ってきた場合を処理
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "") || "";
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error_code = params.get("error_code");
    const error_description = params.get("error_description");

    // エラー時: パスワードリセット関連（otp_expired）→ /forgot-password へリダイレクト
    // ※直接 /login に来た場合のフォールバック
    if (error_code) {
      if (error_code === "otp_expired" || /expired|invalid/i.test(error_description || "")) {
        window.location.replace(`/forgot-password?error=expired${window.location.search ? "&" + window.location.search.slice(1) : ""}`);
        return;
      }
      setSetPasswordError("認証に失敗しました。もう一度お試しください。");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }


    // パスワードリセット（type=recovery）→ /forgot-password へリダイレクト
    if (type === "recovery" && access_token && refresh_token) {
      window.location.replace(`/forgot-password${window.location.search || ""}#${hash}`);
      return;
    }

    // メール確認（type=signup）
    if (type === "signup" && access_token && refresh_token) {
      setRecovering(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(async () => {
          // セッション設定後、ダッシュボードへリダイレクト
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          router.push("/dashboard");
        })
        .catch((err: unknown) => {
          console.error("signup setSession:", err);
          setSetPasswordError("メール確認に失敗しました。リンクの有効期限が切れている可能性があります。");
          setRecovering(false);
        });
    }
    
    // メールアドレス変更確認（type=email_change）
    if (type === "email_change" && access_token && refresh_token) {
      setRecovering(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(async () => {
          // セッション設定後、profilesテーブルのemailも更新
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser && currentUser.email) {
              const { updateProfile } = await import("@/lib/supabase");
              await updateProfile(currentUser.id, {
                email: currentUser.email,
              });
            }
          } catch (err) {
            console.error("Failed to update profile email:", err);
          }
          // プロフィールページへリダイレクト
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          router.push("/member/profile");
        })
        .catch((err: unknown) => {
          console.error("email_change setSession:", err);
          setSetPasswordError("メールアドレス変更の確認に失敗しました。リンクの有効期限が切れている可能性があります。");
          setRecovering(false);
        });
    }
  }, [router]);

  // 既にログインしており、パスワード設定不要な場合はダッシュボードへ（signup/email_change 処理中は待機）
  // ※type=recovery の場合は /forgot-password へリダイレクトするため、ここではダッシュボードへ飛ばさない
  useEffect(() => {
    if (recovering) return;
    const hash = typeof window !== "undefined" ? window.location.hash?.replace("#", "") || "" : "";
    const params = new URLSearchParams(hash);
    if (params.get("type") === "recovery") return; // パスワードリセット中はスキップ
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    });
  }, [router, recovering, redirectTo]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {setPasswordError && (
            <div className="mb-4 bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">
              {setPasswordError}
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              テニスコート予約
            </h1>
            <p className="text-on-background/70">
              ログインまたは新規登録して予約を開始
            </p>
          </div>
          <AuthForm redirectTo={redirectTo ?? undefined} />
        </div>
      </div>
    </div>
  );
}
