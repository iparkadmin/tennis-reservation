"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProfilesWithReservationCount,
  getAllReservations,
  type ProfileWithReservationCount,
  type Reservation,
} from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/dateUtils";
import { Users, Calendar, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<ProfileWithReservationCount[]>([]);
  const [futureReservations, setFutureReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);
        const [profilesData, reservationsData] = await Promise.all([
          getProfilesWithReservationCount(),
          getAllReservations({ fromDate: today }),
        ]);
        setProfiles(profilesData);
        setFutureReservations(
          reservationsData.sort(
            (a, b) =>
              a.booking_date.localeCompare(b.booking_date) ||
              a.start_time.localeCompare(b.start_time)
          )
        );
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/users"
          className="card hover:border-primary/40 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-on-background/70">登録ユーザー数</p>
            <p className="text-2xl font-bold text-primary">{profiles.length}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-outline ml-auto" />
        </Link>
        <Link
          href="/admin/reservations"
          className="card hover:border-primary/40 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-on-background/70">今後の予約数</p>
            <p className="text-2xl font-bold text-primary">{futureReservations.length}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-outline ml-auto" />
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-primary mb-4">直近の予約</h2>
        {futureReservations.length === 0 ? (
          <p className="text-on-background/70">予約がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="text-left py-2 px-3">日付</th>
                  <th className="text-left py-2 px-3">コート</th>
                  <th className="text-left py-2 px-3">時間</th>
                  <th className="text-left py-2 px-3">予約者</th>
                  <th className="text-left py-2 px-3">予約番号</th>
                </tr>
              </thead>
              <tbody>
                {futureReservations.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-outline/10">
                    <td className="py-2 px-3">{formatDate(r.booking_date)}</td>
                    <td className="py-2 px-3">{r.court?.display_name ?? "-"}</td>
                    <td className="py-2 px-3">
                      {formatTime(r.start_time)}-{formatTime(r.end_time)}
                    </td>
                    <td className="py-2 px-3">
                      {(r as any).profile?.full_name ?? "-"}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{r.reservation_number ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4">
          <Link
            href="/admin/reservations"
            className="text-primary hover:underline text-sm font-medium"
          >
            予約一覧へ →
          </Link>
        </div>
      </div>
    </div>
  );
}
