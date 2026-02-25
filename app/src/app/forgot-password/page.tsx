"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { EMAIL_IPARK_PORTAL_NOTICE } from "@/lib/constants";
import {
  validatePassword,
  PASSWORD_REQUIREMENTS_LABEL,
  PASSWORD_REQUIREMENTS_ITEMS,
} from "@/lib/passwordValidation";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const expiredError = searchParams.get("error") === "expired";

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [processingHash, setProcessingHash] = useState(true);

  // メール内リンク（type=recovery）から来た場合: セッション設定 → 新パスワード設定フォーム
  // エラー（error_code）の場合は ?error=expired でリダイレクトしてこのページで表示
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "") || "";
    if (!hash) {
      setProcessingHash(false);
      return;
    }
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error_code = params.get("error_code");
    const error_description = params.get("error_description");

    // エラー時（リンク期限切れなど）: ?error=expired にして hash を削除
    if (error_code) {
      if (error_code === "otp_expired" || /expired|invalid/i.test(error_description || "")) {
        window.location.replace(`/forgot-password?error=expired${window.location.search ? "&" + window.location.search.slice(1) : ""}`);
      } else {
        setSetPasswordError("リンクが無効です。メールアドレスを入力して、再度リセット用のメールを送信してください。");
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      setProcessingHash(false);
      return;
    }

    // パスワードリセット（type=recovery）成功時
    if (type === "recovery" && access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => {
          setShowSetPassword(true);
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        })
        .catch((err: unknown) => {
          console.error("recovery setSession:", err);
          setSetPasswordError("リンクの有効期限が切れている可能性があります。メールアドレスを入力して、再度リセット用のメールを送信してください。");
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        })
        .finally(() => setProcessingHash(false));
      return;
    }

    setProcessingHash(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    try {
      // ※profilesのRLSにより未ログイン時は検索不可のため、事前チェックは行わない
      // auth.users に存在すれば Supabase がリセットメールを送信する
      const redirectTo =
        process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`
          : (typeof window !== "undefined" ? window.location.origin : "") + "/forgot-password";
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      let errorMessage = err?.message || "送信に失敗しました";
      if (/rate.*limit|too many requests|email rate limit exceeded/i.test(errorMessage)) {
        errorMessage = "送信回数が多すぎます。1時間待ってから再度お試しください。";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("newPassword") as HTMLInputElement)?.value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value;
    if (!password) {
      setSetPasswordError("パスワードを入力してください。");
      return;
    }
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      setSetPasswordError(passwordResult.errors.join(" "));
      return;
    }
    if (password !== confirm) {
      setSetPasswordError("パスワードが一致しません。");
      return;
    }
    setSetPasswordLoading(true);
    setSetPasswordError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setSetPasswordError(err.message || "パスワードの更新に失敗しました。");
    } finally {
      setSetPasswordLoading(false);
    }
  };

  // 新パスワード設定フォーム（メール内リンクから来た場合）
  if (showSetPassword) {
    return (
      <div className="min-h-screen bg-background">
        <Header hideNav />
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="card">
              <h1 className="text-xl font-bold text-primary mb-2">新しいパスワードを設定</h1>
              <p className="text-sm text-on-background/70 mb-6">
                パスワードリセット用のリンクからお越しいただきました。新しいパスワードを入力してください。
              </p>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-background mb-2">新しいパスワード</label>
                  <p className="text-xs text-on-background/70 mb-1.5">{PASSWORD_REQUIREMENTS_LABEL}</p>
                  <ul className="text-xs text-on-background/70 mb-2 space-y-1">
                    {PASSWORD_REQUIREMENTS_ITEMS.map((item) => (
                      <li
                        key={item.key}
                        className={`flex items-center gap-2 ${
                          newPasswordValue && item.test(newPasswordValue)
                            ? "text-primary-accent"
                            : "text-on-background/60"
                        }`}
                      >
                        <span className="w-4">
                          {newPasswordValue && item.test(newPasswordValue) ? "✓" : "・"}
                        </span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                  <input
                    type="password"
                    name="newPassword"
                    className="input"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-background mb-2">パスワード（確認）</label>
                  <input type="password" name="confirmPassword" className="input" placeholder="••••••••" required minLength={8} autoComplete="new-password" />
                </div>
                {setPasswordError && (
                  <div className="bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">{setPasswordError}</div>
                )}
                <button type="submit" disabled={setPasswordLoading} className="btn-primary w-full">
                  {setPasswordLoading ? "設定中..." : "パスワードを設定"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 読み込み中（hash 処理中）
  if (processingHash) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="card text-center text-on-background/70">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="card">
          <h1 className="text-xl font-bold text-primary mb-2">
            パスワードをリセット
          </h1>
          <p className="text-sm text-on-background/70 mb-6">
            {EMAIL_IPARK_PORTAL_NOTICE}
            登録済みのメールアドレスを入力してください。リセット用のリンクをお送りします。
          </p>

          {(expiredError || setPasswordError) && (
            <div className="mb-6 bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">
              {setPasswordError || "リンクの有効期限が切れています。メールアドレスを入力して、再度リセット用のメールを送信してください。"}
            </div>
          )}

          {sent ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded-lg text-sm">
                リセット用のメールを送信しました。届いたリンクをクリックすると、このページで新しいパスワードを設定できます。
              </div>
              <Link
                href="/login"
                className="block text-center text-primary-accent hover:underline font-medium"
              >
                ログインへ戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="example@company.com"
                  required
                />
              </div>
              {error && (
                <div className="bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "送信中..." : "送信する"}
              </button>
              <p className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary-accent hover:underline"
                >
                  ログインへ戻る
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <div className="max-w-md mx-auto px-6 py-12">
            <div className="card text-center text-on-background/70">読み込み中...</div>
          </div>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
