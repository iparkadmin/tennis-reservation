"use client";

import { useEffect, useState, useCallback } from "react";
import { addDays, startOfWeek, format, parseISO, isSameDay, startOfDay, isAfter } from "date-fns";
import { ja } from "date-fns/locale/ja";
import {
  getCourts,
  type Court,
  getReservationsByDate,
  createReservation,
  getUtilizers,
  saveUtilizers,
  getProfile,
} from "@/lib/supabase";
import { UTILIZERS_LABEL, UTILIZERS_DESCRIPTION } from "@/lib/constants";
import { isBookableDate, generateTimeSlots, formatDate, getMaxBookableDate, getSlotEndTime, formatTimeSlotDisplay } from "@/lib/dateUtils";
import { Calendar, Clock, UserPlus, X } from "lucide-react";

interface BookingCalendarProps {
  userId?: string;
  selectionMode?: boolean;
  selectedCourtId?: string;
  onTimeSelect?: (date: string | null, start: string | null, end: string | null) => void;
}

type SelectedSlot = {
  date: string;
  start: string;
  end: string;
  courtId: string;
};

export default function BookingCalendar({
  userId,
  selectionMode = false,
  selectedCourtId: initialSelectedCourtId,
  onTimeSelect,
}: BookingCalendarProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // 月曜始まり
  });
  const [reservations, setReservations] = useState<Map<string, any[]>>(new Map());
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utilizers, setUtilizers] = useState<{ id?: string; full_name: string }[]>([]);
  const [applicantName, setApplicantName] = useState<string>("");

  const timeSlots = generateTimeSlots();

  // スロット選択時に利用者と申請者名を読み込み
  useEffect(() => {
    if (userId && selectedSlots.length > 0) {
      Promise.all([getUtilizers(userId), getProfile(userId)]).then(([utilizersData, profileData]) => {
        setApplicantName(profileData?.full_name ?? "");
        setUtilizers((prev) => {
          if (prev.length > 0) return prev;
          return utilizersData.length > 0
            ? utilizersData.map((u) => ({ id: u.id, full_name: u.full_name }))
            : [{ full_name: "" }];
        });
      });
    } else if (selectedSlots.length === 0) {
      setUtilizers([]);
      setApplicantName("");
    }
  }, [userId, selectedSlots.length]);

  // コート一覧を読み込む
  useEffect(() => {
    const loadCourts = async () => {
      try {
        const courtsData = await getCourts();
        setCourts(courtsData);
        if (courtsData.length > 0) {
          if (initialSelectedCourtId) {
            setSelectedCourtId(initialSelectedCourtId);
          } else {
            setSelectedCourtId(courtsData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load courts:", error);
      }
    };
    loadCourts();
  }, [initialSelectedCourtId]);

  // 予約データを読み込む
  const loadReservations = useCallback(async () => {
    if (!selectedCourtId) return;
    
    try {
      setLoading(true);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return format(date, "yyyy-MM-dd");
      });

      const reservationsMap = new Map<string, any[]>();
      for (const date of weekDates) {
        const data = await getReservationsByDate(date, selectedCourtId);
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
    loadReservations();
  }, [loadReservations]);

  // 週を移動
  const moveWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  // スロットが予約済みかチェック
  const isSlotReserved = (date: string, start: string, courtId: string): boolean => {
    const dateReservations = reservations.get(date) || [];
    return dateReservations.some(
      (r) => r.court_id === courtId && r.start_time === start
    );
  };

  // スロットが選択済みかチェック
  const isSlotSelected = (date: string, start: string, courtId: string): boolean => {
    return selectedSlots.some(
      (s) => s.date === date && s.start === start && s.courtId === courtId
    );
  };

  // 1日の選択枠数をカウント（既存予約＋選択中）
  const getSelectedCountForDate = (date: string, courtId: string): number => {
    const dateReservations = reservations.get(date) || [];
    const existingCount = dateReservations.filter((r) => r.court_id === courtId).length;
    const selectedCount = selectedSlots.filter(
      (s) => s.date === date && s.courtId === courtId
    ).length;
    return existingCount + selectedCount;
  };

  // 週全体の選択枠数をカウント
  const getTotalSelectedCount = (): number => {
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(weekStart, i), "yyyy-MM-dd")
    );
    return selectedSlots.filter((s) => weekDates.includes(s.date)).length;
  };

  // スロットをトグル
  const toggleSlot = (date: string, start: string, end: string, courtId: string) => {
    if (!isBookableDate(date)) return;
    if (isSlotReserved(date, start, courtId)) return;

    if (selectionMode) {
      // 選択モード: 1枠のみ選択可能、再押下で解除
      const isSelected = isSlotSelected(date, start, courtId);
      if (isSelected) {
        setSelectedSlots([]);
        if (onTimeSelect) {
          onTimeSelect(null, null, null);
        }
      } else {
        setSelectedSlots([{ date, start, end, courtId }]);
        if (onTimeSelect) {
          onTimeSelect(date, start, end);
        }
      }
    } else {
      // 通常モード: 複数選択可能、1日2枠・1週間2枠まで
      const isSelected = isSlotSelected(date, start, courtId);
      
      if (isSelected) {
        // 選択解除
        setSelectedSlots((prev) =>
          prev.filter(
            (s) => !(s.date === date && s.start === start && s.courtId === courtId)
          )
        );
      } else {
        // 選択追加
        const currentDateCount = getSelectedCountForDate(date, courtId);
        const totalCount = getTotalSelectedCount();
        
        if (currentDateCount >= 2) {
          setError("1日2枠まで予約できます");
          return;
        }
        if (totalCount >= 2) {
          setError("1週間（表示の7日）で2枠まで予約できます");
          return;
        }
        
        setError(null);
        setSelectedSlots((prev) => [...prev, { date, start, end, courtId }]);
      }
    }
  };

  // 予約を確定
  const handleConfirm = async () => {
    if (!userId || selectedSlots.length === 0) return;

    try {
      setSaving(true);
      setError(null);

      const toSave = utilizers.filter((u) => u.full_name.trim());
      const saved = await saveUtilizers(userId, toSave);
      const utilizerIds = saved.map((u) => u.id);

      for (const slot of selectedSlots) {
        await createReservation(
          userId,
          slot.courtId,
          slot.date,
          slot.start,
          slot.end,
          utilizerIds
        );
      }

      setSelectedSlots([]);
      setUtilizers([]);
      await loadReservations();
    } catch (error: any) {
      const msg = error.message || "予約の作成に失敗しました";
      setError(msg);
      // 重複エラー時は予約一覧を再取得して正しい予約済み状態を表示
      if (/duplicate|unique|already exists|重複/i.test(msg)) {
        loadReservations();
      }
    } finally {
      setSaving(false);
    }
  };

  const addUtilizer = () => setUtilizers((prev) => [...prev, { full_name: "" }]);
  const updateUtilizer = (index: number, full_name: string) =>
    setUtilizers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], full_name };
      return next;
    });
  const removeUtilizer = (index: number) =>
    setUtilizers((prev) => prev.filter((_, i) => i !== index));

  // 週の日付リスト
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      {/* コート選択 */}
      {courts.length > 0 && !selectionMode && (
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
      )}

      {/* エラー表示 */}
      {error && (
        <div className="card bg-highlight/10 border border-highlight text-highlight">
          {error}
        </div>
      )}

      {/* 週ナビゲーション */}
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
          {!selectionMode && (
            <div className="text-sm text-on-background/70 mt-1">
              選択中: {selectedSlots.length}枠 / 最大2枠
            </div>
          )}
        </div>
        <button
          onClick={() => moveWeek("next")}
          disabled={isAfter(startOfDay(addDays(weekStart, 7)), getMaxBookableDate())}
          className="px-4 py-2 rounded-lg bg-surface text-on-background hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次週 →
        </button>
      </div>

      {/* カレンダー */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="text-on-background/70">読み込み中...</div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="min-w-full">
            {/* ヘッダー */}
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
                    <div className="text-xs">
                      {format(date, "E", { locale: ja })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 時間スロット */}
            <div className="space-y-2">
              {timeSlots.map((start) => {
                const end = getSlotEndTime(start);
                return (
                  <div key={start} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-sm text-on-background/70 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeSlotDisplay(start)}
                    </div>
                    {weekDates.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const isBookable = isBookableDate(dateStr);
                      const isReserved = isSlotReserved(
                        dateStr,
                        start,
                        selectedCourtId
                      );
                      const isSelected = isSlotSelected(
                        dateStr,
                        start,
                        selectedCourtId
                      );

                      return (
                        <button
                          key={`${dateStr}-${start}`}
                          onClick={() =>
                            toggleSlot(dateStr, start, end, selectedCourtId)
                          }
                          disabled={!isBookable || isReserved || !selectedCourtId || saving}
                          className={`px-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isReserved
                              ? "bg-outline/20 text-on-background/40 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary-accent text-on-primary-accent"
                              : isBookable
                              ? "bg-surface text-on-background hover:bg-surface/80"
                              : "bg-outline/10 text-on-background/30 cursor-not-allowed"
                          }`}
                        >
                          {isReserved ? "予約済" : isSelected ? "選択中" : isBookable ? "空き" : "-"}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 予約確定（通常モードのみ） */}
      {!selectionMode && selectedSlots.length > 0 && (
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary mb-2">選択中の予約</h3>
            <div className="space-y-2">
              {selectedSlots.map((slot, index) => {
                const court = courts.find((c) => c.id === slot.courtId);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {formatDate(slot.date)} {formatTimeSlotDisplay(slot.start)}
                      </span>
                      {court && (
                        <span className="text-xs text-on-background/60">
                          ({court.display_name})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-on-background mb-2">
              {UTILIZERS_LABEL}
            </h3>
            {applicantName && (
              <p className="text-sm text-on-background/70 mb-2">
                申請者・登録者: {applicantName}
              </p>
            )}
            <p className="text-xs text-on-background/60 mb-2">
              {UTILIZERS_DESCRIPTION}
            </p>
            <div className="space-y-2">
              {utilizers.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={u.full_name}
                    onChange={(e) => updateUtilizer(i, e.target.value)}
                    className="input flex-1"
                    placeholder="氏名"
                  />
                  <button
                    type="button"
                    onClick={() => removeUtilizer(i)}
                    className="p-2 text-highlight hover:bg-highlight/10 rounded-lg"
                    title="削除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addUtilizer}
              className="mt-2 text-sm text-primary-accent hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              利用者を追加
            </button>
          </div>

          <button
            onClick={handleConfirm}
            disabled={saving || !userId}
            className="btn-primary w-full"
          >
            {saving ? "予約中..." : "予約を確定"}
          </button>
        </div>
      )}
    </div>
  );
}
