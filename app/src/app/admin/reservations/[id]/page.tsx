"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cancelReservation, type Reservation } from "@/lib/supabase";
import {
  getReservationById,
  upsertUtilizationRecord,
} from "@/lib/adminApiClient";
import { formatDate, formatTime, canModifyReservation } from "@/lib/dateUtils";
import {
  ArrowLeft,
  Users,
  Save,
} from "lucide-react";
import {
  UTILIZATION_STATUS_OPTIONS,
  MANNERS_STATUS_OPTIONS,
} from "@/lib/constants";

export default function AdminReservationDetailPage() {
  const params = useParams();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const [utilStatus, setUtilStatus] = useState("unrecorded");
  const [mannersStatus, setMannersStatus] = useState("no_violation");
  const [memo, setMemo] = useState("");
  const [savingRecord, setSavingRecord] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getReservationById(reservationId);
        if (data) {
          setReservation(data as Reservation);
          const ur = (data as { utilization_record?: { utilization_status?: string; manners_status?: string; memo?: string } | null }).utilization_record;
          if (ur) {
            setUtilStatus(ur.utilization_status ?? "unrecorded");
            setMannersStatus(ur.manners_status ?? "no_violation");
            setMemo(ur.memo ?? "");
          } else {
            setUtilStatus("unrecorded");
            setMannersStatus("no_violation");
            setMemo("");
          }
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
        <h2 className="text-lg font-bold text-primary mb-4">利用実績記録</h2>
        <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">利用有無</label>
                <select
                  value={utilStatus}
                  onChange={(e) => setUtilStatus(e.target.value)}
                  className="input w-full max-w-xs"
                >
                  {UTILIZATION_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">マナー状況</label>
                <select
                  value={mannersStatus}
                  onChange={(e) => setMannersStatus(e.target.value)}
                  className="input w-full max-w-xs"
                >
                  {MANNERS_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">メモ欄</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="input w-full min-h-[80px]"
                  placeholder="補足事項など"
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    setSavingRecord(true);
                    await upsertUtilizationRecord(reservation.id, {
                      utilizationStatus: utilStatus,
                      mannersStatus,
                      memo,
                    });
                    const data = await getReservationById(reservationId);
                    if (data) {
                      setReservation(data as Reservation);
                      const ur = (data as { utilization_record?: { utilization_status?: string; manners_status?: string; memo?: string } } | null)?.utilization_record;
                      if (ur) {
                        setUtilStatus(ur.utilization_status ?? "unrecorded");
                        setMannersStatus(ur.manners_status ?? "no_violation");
                        setMemo(ur.memo ?? "");
                      }
                    }
                  } catch (e: unknown) {
                    alert((e as Error).message || "保存に失敗しました");
                  } finally {
                    setSavingRecord(false);
                  }
                }}
                disabled={savingRecord}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingRecord ? "保存中..." : "利用実績を保存"}
              </button>
        </div>
      </div>

      {(reservation.utilizers?.length ?? 0) > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-primary mb-4">利用者（当日参加者）</h2>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <ul className="space-y-1">
              {reservation.utilizers!.map((u) => (
                <li key={u.id} className="text-on-background">
                  {u.full_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
