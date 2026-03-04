"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserReservations, cancelReservation, type Reservation } from "@/lib/supabase";
import Header from "@/components/Header";
import { formatDate, formatTime, canModifyReservation } from "@/lib/dateUtils";
import { NOTICE_LINK_TO_TOP } from "@/lib/constants";
import Link from "next/link";
import { Calendar, Clock, Trash2, Edit, Eye, AlertTriangle } from "lucide-react";

type FilterType = "all" | "thisMonth" | "nextMonth" | "past";

export default function ReservationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const [profile, setProfile] = useState<{ is_blocked?: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        const { getProfile } = await import("@/lib/supabase");
        const p = await getProfile(session.user.id);
        setProfile(p);
        loadReservations(session.user.id);
      }
    });
  }, [router]);

  const loadReservations = async (userId: string) => {
    try {
      setLoading(true);
      const { getAllUserReservations } = await import("@/lib/supabase");
      const data = await getAllUserReservations(userId);
      setReservations(data);
    } catch (error) {
      console.error("Failed to load reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const filtered = reservations.filter((r) => {
      const date = new Date(r.booking_date);
      switch (filter) {
        case "thisMonth":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case "nextMonth":
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return (
            date >= nextMonth &&
            date.getMonth() === nextMonth.getMonth() &&
            date.getFullYear() === nextMonth.getFullYear()
          );
        case "past":
          return date < new Date(now.getFullYear(), now.getMonth(), 1);
        default:
          return true;
      }
    });
    setFilteredReservations(filtered);
  }, [reservations, filter]);

  const handleCancel = async (reservationId: string) => {
    if (!confirm("この予約をキャンセルしますか？")) return;

    try {
      setCancelling(reservationId);
      await cancelReservation(reservationId);
      if (user) {
        await loadReservations(user.id);
      }
    } catch (error: any) {
      alert(error.message || "キャンセルに失敗しました");
    } finally {
      setCancelling(null);
    }
  };

  const canModify = (bookingDate: string): boolean => canModifyReservation(bookingDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-on-background/70">読み込み中...</div>
        </main>
      </div>
    );
  }

  if (profile?.is_blocked) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="card max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-highlight/10 border border-highlight">
              <AlertTriangle className="w-6 h-6 text-highlight flex-shrink-0 mt-0.5" />
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">予約履歴</h2>
          <p className="text-on-background/70">
            すべての予約を確認・管理できます。
          </p>
          <p className="mt-2 text-sm text-primary font-medium">
            ※予約の完了・変更・キャンセル時にメール通知は送信されません。
          </p>
        </div>

        {/* フィルター */}
        <div className="card mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-background/70 hover:bg-surface/80"
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter("thisMonth")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "thisMonth"
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-background/70 hover:bg-surface/80"
              }`}
            >
              今月
            </button>
            <button
              onClick={() => setFilter("nextMonth")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "nextMonth"
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-background/70 hover:bg-surface/80"
              }`}
            >
              来月
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "past"
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-background/70 hover:bg-surface/80"
              }`}
            >
              過去
            </button>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-outline mx-auto mb-4" />
            <p className="text-on-background/70 mb-4">予約がありません</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary"
            >
              予約カレンダーへ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const canModifyReservation = canModify(reservation.booking_date);
              const isPast = new Date(reservation.booking_date) < new Date();

              return (
                <div key={reservation.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          {formatDate(reservation.booking_date)}
                        </span>
                        {isPast && (
                          <span className="px-2 py-1 bg-outline/20 text-outline text-xs rounded">
                            過去
                          </span>
                        )}
                      </div>
                      {reservation.court && (
                        <div className="flex items-center gap-3 text-on-background/70 mb-2">
                          <span className="text-sm font-medium">コート:</span>
                          <span className="font-bold text-primary">
                            {reservation.court.display_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-on-background/70 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </span>
                      </div>
                      {(reservation as any).reservation_number && (
                        <div className="text-sm text-on-background/60">
                          予約番号: {(reservation as any).reservation_number}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/member/reservations/${reservation.id}`)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        詳細
                      </button>
                      {canModifyReservation && (
                        <>
                          <button
                            onClick={() => router.push(`/member/reservations/${reservation.id}?edit=true`)}
                            className="btn-secondary flex items-center gap-2 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            変更
                          </button>
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            disabled={cancelling === reservation.id}
                            className="btn-danger flex items-center gap-2 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            {cancelling === reservation.id ? "処理中..." : "キャンセル"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-outline/20 text-left">
          <p className="text-sm text-primary font-medium">
            <Link href="/">{NOTICE_LINK_TO_TOP}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
