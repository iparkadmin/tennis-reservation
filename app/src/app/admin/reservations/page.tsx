"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllReservations,
  getCourtsForAdmin,
  type Reservation,
  type Court,
} from "@/lib/supabase";
import { formatDate, formatTime } from "@/lib/dateUtils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filtered, setFiltered] = useState<Reservation[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courtId, setCourtId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [reservationsData, courtsData] = await Promise.all([
          getAllReservations(),
          getCourtsForAdmin(),
        ]);
        setReservations(reservationsData);
        setFiltered(reservationsData);
        setCourts(courtsData);
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        setFromDate(format(start, "yyyy-MM-dd"));
        setToDate(format(end, "yyyy-MM-dd"));
      } catch (error) {
        console.error("Failed to load reservations:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = reservations;
      if (fromDate) {
        result = result.filter((r) => r.booking_date >= fromDate);
      }
      if (toDate) {
        result = result.filter((r) => r.booking_date <= toDate);
      }
      if (courtId) {
        result = result.filter((r) => r.court_id === courtId);
      }
      result.sort(
        (a, b) =>
          a.booking_date.localeCompare(b.booking_date) ||
          a.start_time.localeCompare(b.start_time)
      );
      setFiltered(result);
    };
    applyFilters();
  }, [reservations, fromDate, toDate, courtId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">予約一覧</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-on-background/70 mb-1">開始日</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input w-40"
          />
        </div>
        <div>
          <label className="block text-sm text-on-background/70 mb-1">終了日</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input w-40"
          />
        </div>
        <div>
          <label className="block text-sm text-on-background/70 mb-1">コート</label>
          <select
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="input w-40"
          >
            <option value="">すべて</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-on-background/70">{filtered.length} 件</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline/20 bg-surface">
                <th className="text-left py-3 px-4">日付</th>
                <th className="text-left py-3 px-4">コート</th>
                <th className="text-left py-3 px-4">時間</th>
                <th className="text-left py-3 px-4">予約者</th>
                <th className="text-left py-3 px-4">予約番号</th>
                <th className="text-left py-3 px-4">連絡事項</th>
                <th className="text-left py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-outline/10 hover:bg-surface/50">
                  <td className="py-3 px-4">{formatDate(r.booking_date)}</td>
                  <td className="py-3 px-4">{r.court?.display_name ?? "-"}</td>
                  <td className="py-3 px-4">
                    {formatTime(r.start_time)}-{formatTime(r.end_time)}
                  </td>
                  <td className="py-3 px-4">
                    {(r as any).profile?.full_name ?? "-"}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{r.reservation_number ?? "-"}</td>
                  <td className="py-3 px-4 max-w-[200px] truncate" title={r.contact_notes ?? ""}>
                    {r.contact_notes ?? "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-on-background/70">該当する予約がありません</p>
        )}
      </div>
    </div>
  );
}
