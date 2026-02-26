"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type AdminLoginFormProps = {
  /** ログイン成功後のリダイレクト先（例: /admin） */
  redirectTo?: string;
};

export default function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (/invalid.*credentials|invalid.*login/i.test(signInError.message)) {
          setError("管理者IDまたはパスワードが正しくありません。");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // ログイン成功後、管理者かどうか確認
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("認証に失敗しました。");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("管理者権限がありません。一般ユーザーはこの画面からログインできません。");
        setLoading(false);
        return;
      }

      // 管理者としてログイン成功 → リダイレクト
      const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/admin";
      window.location.href = target;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-1">管理画面ログイン</h2>
          <p className="text-sm text-on-background/70">
            管理者用のID・パスワードでログインしてください
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-background mb-2">
              管理者ID（メールアドレス）
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="input w-full"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-background mb-2">
              パスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input w-full pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-background/60 hover:text-on-background"
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline/20">
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            ← 一般ユーザー用ログインへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
