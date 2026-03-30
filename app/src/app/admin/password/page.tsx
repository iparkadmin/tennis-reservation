"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import {
  validatePassword,
  PASSWORD_REQUIREMENTS_LABEL,
  PASSWORD_REQUIREMENTS_ITEMS,
} from "@/lib/passwordValidation";

export default function AdminPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        router.push("/admin/login");
        return;
      }
      setEmail(user.email);
    };
    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 現在のパスワードを検証（再ログインで確認）
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        if (/invalid.*credentials|invalid.*login/i.test(signInError.message)) {
          setError("現在のパスワードが正しくありません。");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // 新しいパスワードのバリデーション
      const passwordResult = validatePassword(newPassword);
      if (!passwordResult.valid) {
        setError(passwordResult.errors.join(" "));
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("新しいパスワードが一致しません。");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setMessage("パスワードを変更しました。");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "パスワードの変更に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-primary hover:underline mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードへ戻る
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          パスワード変更
        </h1>
        <p className="text-sm text-on-background/70 mb-6">
          初期パスワードから変更する場合は、現在のパスワードを入力し、新しいパスワードを設定してください。
        </p>

        {email && (
          <div className="mb-6 p-4 rounded-lg bg-surface/50 border border-outline/20">
            <label className="block text-sm font-medium text-on-background/70 mb-1">現在のID</label>
            <p className="text-on-background font-medium">{email}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-highlight/10 border border-highlight text-highlight px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-background mb-2">
              現在のパスワード
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="input w-full pr-10"
                placeholder="現在のパスワードを入力"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-background/60 hover:text-on-background"
                aria-label={showCurrentPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-background mb-2">
              新しいパスワード
            </label>
            <p className="text-xs text-on-background/70 mb-1.5">{PASSWORD_REQUIREMENTS_LABEL}</p>
            <ul className="text-xs text-on-background/70 mb-2 space-y-1">
              {PASSWORD_REQUIREMENTS_ITEMS.map((item) => (
                <li
                  key={item.key}
                  className={`flex items-center gap-2 ${
                    newPassword && item.test(newPassword) ? "text-primary-accent" : "text-on-background/60"
                  }`}
                >
                  <span className="w-4">{newPassword && item.test(newPassword) ? "✓" : "・"}</span>
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="input w-full pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-background/60 hover:text-on-background"
                aria-label={showNewPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-background mb-2">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="input w-full"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "変更中..." : "パスワードを変更"}
            </button>
            <Link href="/admin" className="btn-secondary">
              キャンセル
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-outline/20 text-center">
          <Link href="/admin" className="text-sm text-primary hover:underline">
            管理者トップページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
