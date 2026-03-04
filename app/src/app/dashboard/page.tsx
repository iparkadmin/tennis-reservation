"use client";

// 予約カレンダーダッシュボード
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BookingCalendar from "@/components/BookingCalendar";
import { NOTICE_LINK_TO_TOP } from "@/lib/constants";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        // プロフィールの存在確認
        const { getProfile } = await import("@/lib/supabase");
        const profileData = await getProfile(session.user.id);
        setProfile(profileData);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  // ブロックされている場合
  if (profile?.is_blocked) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="card max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-highlight/10 border border-highlight">
              <AlertCircle className="w-6 h-6 text-highlight flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-highlight mb-2">
                  アカウントがブロックされています
                </h3>
                <p className="text-on-background mb-4">
                  このアカウントは管理者によりブロックされています。予約の作成・変更・キャンセルはできません。ご不明な点は管理者にお問い合わせください。
                </p>
                <Link href="/" className="btn-secondary">
                  トップへ戻る
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // プロフィールが存在しない場合（削除済みユーザー）
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="card max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-highlight/10 border border-highlight">
              <AlertCircle className="w-6 h-6 text-highlight flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-highlight mb-2">
                  ユーザー登録が必要です
                </h3>
                <p className="text-on-background mb-4">
                  このアカウントは登録が完了していません。予約を行うには、ユーザー登録が必要です。
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="btn-primary"
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                  >
                    新規登録へ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            予約カレンダー
          </h2>
          <p className="text-on-background/70">
            土曜・日曜・祝日のみ、今日から30日以内が予約可能です。
            <br />
            時間枠は9時−11時、11時−13時、13時−15時、15時−17時の2時間単位となります。
            <br />
            1日2時間1枠・1週間（表示の7日）で2枠まで予約可能です。
            <br />
            枠を選んで「予約を確定」を押してください。選択の解除は枠を再クリックしてください。
            <br />
            キャンセルは前日17時まで可能です。
            <br />
            ご予約の際に利用者全員（当日参加される方の氏名）をご登録ください。登録されていない方のご利用はできません。
            <br />
            予約の完了・変更・キャンセル時にメール通知は送信されません。内容はマイページ・予約履歴でご確認ください。
          </p>
          <p className="mt-3 text-sm text-primary font-medium">
            <Link href="/" className="hover:underline">
              {NOTICE_LINK_TO_TOP}
            </Link>
          </p>
        </div>
        <BookingCalendar userId={user?.id} />
      </main>
    </div>
  );
}
