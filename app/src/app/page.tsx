"use client";

import { Calendar, Clock, User, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { NOTICE_ITEMS, NOTICE_TITLE } from "@/lib/constants";

export default function Home() {
  const router = useRouter();

  // メール内リンク（認証・パスワードリセット）でトップに来た場合、/login へリダイレクト
  // Supabase の Site URL が / の場合など、/login ではなくトップに飛ぶことがある
  // ※router.replace では hash が正しく渡らないため window.location を使用
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "") || "";
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error_code = params.get("error_code");
    // 成功時: パスワードリセット（type=recovery）→ /forgot-password へ
    // メール確認・メール変更（signup, email_change）→ /login へ
    if ((type === "recovery" || type === "signup" || type === "email_change") && access_token && refresh_token) {
      if (type === "recovery") {
        window.location.replace(`/forgot-password${window.location.search || ""}#${hash}`);
      } else {
        window.location.replace(`/login${window.location.search || ""}#${hash}`);
      }
      return;
    }
    // エラー時: パスワードリセット関連（otp_expired など）→ /forgot-password へ
    // それ以外 → /login でメッセージ表示
    if (error_code) {
      if (error_code === "otp_expired" || /expired|invalid/i.test(params.get("error_description") || "")) {
        window.location.replace(`/forgot-password?error=expired${window.location.search ? "&" + window.location.search.slice(1) : ""}`);
      } else {
        window.location.replace(`/login${window.location.search || ""}#${hash}`);
      }
      return;
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            テニスコート予約システム
          </h2>
          <p className="text-lg text-on-background/70 mb-8">
            簡単3ステップで予約完了。空き状況をリアルタイムで確認できます。
          </p>
          
          {/* ログインボタン */}
          <button
            onClick={() => router.push("/login")}
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            <LogIn className="w-5 h-5" />
            ログインして予約する
          </button>
        </section>

        {/* 特徴セクション */}
        <section className="grid md:grid-cols-3 gap-6 mb-16 text-left">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              リアルタイム空き確認
            </h3>
            <p className="text-on-background/70 text-sm">
              カレンダーで空き状況を一目で確認。ダブルブッキングの心配なし。
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-light" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              2時間単位で予約
            </h3>
            <p className="text-on-background/70 text-sm">
              9時ー11時、11時ー13時、13時ー15時、15時ー17時の2時間枠で、1日1枠まで予約可能。
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              マイページで管理
            </h3>
            <p className="text-on-background/70 text-sm">
              予約確認・キャンセルがいつでも可能。履歴も一覧で確認。
            </p>
          </div>
        </section>

        {/* 注意事項 */}
        <section className="card mb-6 bg-primary/5 border border-primary/20 text-left">
          <h3 className="text-lg font-bold text-primary mb-3">{NOTICE_TITLE}</h3>
          <ul className="space-y-2 text-on-background/80">
            {NOTICE_ITEMS.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-accent">・</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 利用ルール */}
        <section className="card text-left">
          <h3 className="text-xl font-bold text-primary mb-4">ご利用ルール</h3>
          <ul className="space-y-2 text-on-background/80">
            <li className="flex items-start gap-2">
              <span className="text-primary-accent">•</span>
              予約可能日：土曜・日曜・祝日のみ（今日から30日以内）
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent">•</span>
              予約可能時間：9時ー11時、11時ー13時、13時ー15時、15時ー17時（2時間枠）
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent">•</span>
              ご利用時間は指定の2時間ごととなります。
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent">•</span>
              キャンセルは前日17時まで可能
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
