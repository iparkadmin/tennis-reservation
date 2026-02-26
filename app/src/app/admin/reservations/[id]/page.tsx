"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getReservationById,
  cancelReservation,
  getProfile,
  type Reservation,
} from "@/lib/supabase";
import { formatDate, formatTime, canModifyReservation } from "@/lib/dateUtils";
import { ArrowLeft } from "lucide-react";

export default function AdminReservationDetailPage() {
  const params = useParams();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getReservationById(reservationId);
        if (data) {
          const profileData = await getProfile(data.user_id);
          setReservation({ ...data, profile: profileData ?? undefined } as Reservation);
        } else {
          setReservation(null);
        }
      } catch (error) {
        console.error("Failed to load reservation:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reservationId]);

  const handleCancel = async () => {
    if (!reservation) return;
    if (!confirm("この予約をキャンセルしますか？\n\nこの操作は取り消せません。")) return;

    try {
      setCancelling(true);
      await cancelReservation(reservation.id);
      setReservation(null);
    } catch (error: any) {
      alert(error.message || "キャンセルに失敗しました");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-8">
        <p className="text-highlight">予約が見つかりません（またはキャンセル済みです）</p>
        <Link href="/admin/reservations" className="text-primary hover:underline mt-2 inline-block">
          予約一覧へ戻る
        </Link>
      </div>
    );
  }

  const profile = reservation.profile;
  const canModify = (): boolean => canModifyReservation(reservation.booking_date);

  return (
    <div className="p-8">
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-1 text-primary hover:underline mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        予約一覧へ戻る
      </Link>

      <h1 className="text-2xl font-bold text-primary mb-6">予約詳細</h1>

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-primary mb-4">予約内容</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <dt className="text-sm text-on-background/70">予約番号</dt>
            <dd className="font-mono font-medium">{reservation.reservation_number ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">日付</dt>
            <dd className="font-medium">{formatDate(reservation.booking_date)}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">コート</dt>
            <dd className="font-medium">{reservation.court?.display_name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">時間</dt>
            <dd className="font-medium">
              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
            </dd>
          </div>
          {reservation.contact_notes && (
            <div className="md:col-span-2">
              <dt className="text-sm text-on-background/70">連絡事項</dt>
              <dd className="font-medium whitespace-pre-wrap">{reservation.contact_notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-primary mb-4">予約者</h2>
        {profile ? (
          <div className="space-y-2">
            <p>
              <span className="text-on-background/70">氏名: </span>
              {profile.full_name || "-"}
            </p>
            <p>
              <span className="text-on-background/70">メール: </span>
              {profile.email || "-"}
            </p>
            <Link
              href={`/admin/users/${reservation.user_id}`}
              className="text-primary hover:underline text-sm"
            >
              ユーザー詳細へ →
            </Link>
          </div>
        ) : (
          <p className="text-on-background/70">ユーザー情報を読み込んでいます...</p>
        )}
      </div>

      {canModify() && (
        <div className="flex gap-4">
          <Link
            href={`/member/reservations/${reservation.id}?edit=true`}
            className="btn-secondary"
          >
            予約変更
          </Link>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-danger"
          >
            {cancelling ? "キャンセル中..." : "予約をキャンセル"}
          </button>
        </div>
      )}

      {!canModify() && (
        <p className="text-sm text-on-background/70">
          前日17時以降はキャンセルできません。
        </p>
      )}
    </div>
  );
}
