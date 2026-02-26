"use client";

import { useEffect, useState, useCallback } from "react";
import { addDays, startOfWeek, format, startOfDay, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import {
  getCourtsForAdmin,
  getAdminReservationsByDate,
  type Court,
  type Reservation,
} from "@/lib/supabase";
import { isBookableDate, generateTimeSlots, formatTime, getMaxBookableDate, formatTimeSlotDisplay } from "@/lib/dateUtils";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function AdminCalendar() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 });
  });
  const [reservations, setReservations] = useState<Map<string, Reservation[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const timeSlots = generateTimeSlots();

  const loadReservations = useCallback(async () => {
    if (!selectedCourtId) return;

    try {
      setLoading(true);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return format(date, "yyyy-MM-dd");
      });

      const reservationsMap = new Map<string, Reservation[]>();
      for (const date of weekDates) {
        const data = await getAdminReservationsByDate(date, selectedCourtId);
        reservationsMap.set(date, data);
      }
      setReservations(reservationsMap);
    } catch (error) {
      console.error("Failed to load reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [weekStart, selectedCourtId]);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        const courtsData = await getCourtsForAdmin();
        setCourts(courtsData);
        if (courtsData.length > 0 && !selectedCourtId) {
          setSelectedCourtId(courtsData[0].id);
        }
      } catch (error) {
        console.error("Failed to load courts:", error);
      }
    };
    loadCourts();
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const moveWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  const getReservationForSlot = (date: string, start: string): Reservation | undefined => {
    const dateReservations = reservations.get(date) || [];
    return dateReservations.find((r) => formatTime(r.start_time) === start);
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <div className="card">
        <label className="block text-sm font-medium text-on-background mb-2">
          コート選択
        </label>
        <div className="flex gap-2 flex-wrap">
          {courts.map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourtId(court.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCourtId === court.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-background/70 hover:bg-surface/80"
              }`}
            >
              {court.display_name}
            </button>
          ))}
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <button
          onClick={() => moveWeek("prev")}
          className="px-4 py-2 rounded-lg bg-surface text-on-background hover:bg-surface/80"
        >
          ← 前週
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {format(weekStart, "yyyy年M月d日", { locale: ja })} 〜{" "}
            {format(addDays(weekStart, 6), "M月d日", { locale: ja })}
          </div>
        </div>
        <button
          onClick={() => moveWeek("next")}
          disabled={isAfter(startOfDay(addDays(weekStart, 7)), getMaxBookableDate())}
          className="px-4 py-2 rounded-lg bg-surface text-on-background hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次週 →
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="text-on-background/70">読み込み中...</div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-8 gap-2 border-b border-outline/20 pb-2 mb-2">
              <div className="text-sm font-medium text-on-background/70">時間</div>
              {weekDates.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isBookable = isBookableDate(dateStr);
                return (
                  <div
                    key={dateStr}
                    className={`text-center text-sm font-medium ${
                      isBookable ? "text-primary" : "text-on-background/50"
                    }`}
                  >
                    <div>{format(date, "M/d", { locale: ja })}</div>
                    <div className="text-xs">{format(date, "E", { locale: ja })}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {timeSlots.map((start) => (
                <div key={start} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-sm text-on-background/70 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeSlotDisplay(start)}
                  </div>
                  {weekDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isBookable = isBookableDate(dateStr);
                    const reservation = getReservationForSlot(dateStr, start);

                    return (
                      <div
                        key={`${dateStr}-${start}`}
                        className={`px-2 py-3 rounded-lg text-sm min-h-[48px] ${
                          reservation
                            ? "bg-primary/10 border border-primary/20"
                            : isBookable
                            ? "bg-surface/50 text-on-background/50"
                            : "bg-outline/10 text-on-background/30"
                        }`}
                      >
                        {reservation ? (
                          <Link
                            href={`/admin/reservations/${reservation.id}`}
                            className="block hover:underline text-primary font-medium"
                          >
                            {(reservation as any).profile?.full_name ?? "予約済"}
                          </Link>
                        ) : isBookable ? (
                          <span className="text-on-background/50">空き</span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
