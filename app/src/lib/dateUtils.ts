import { format, isWeekend as dateFnsIsWeekend, parseISO, subDays, addMonths, setHours, setMinutes, setSeconds, startOfDay, isBefore, isAfter } from "date-fns";
import { ja } from "date-fns/locale/ja";

// 日本の祝日リスト（2025年〜2027年）
const HOLIDAYS = [
  // 2025年
  "2025-01-01", // 元日
  "2025-01-13", // 成人の日
  "2025-02-11", // 建国記念の日
  "2025-02-23", // 天皇誕生日
  "2025-03-20", // 春分の日
  "2025-04-29", // 昭和の日
  "2025-05-03", // 憲法記念日
  "2025-05-04", // みどりの日
  "2025-05-05", // こどもの日
  "2025-07-21", // 海の日
  "2025-08-11", // 山の日
  "2025-09-15", // 敬老の日
  "2025-09-23", // 秋分の日
  "2025-10-13", // スポーツの日
  "2025-11-03", // 文化の日
  "2025-11-23", // 勤労感謝の日
  // 2026年
  "2026-01-01", // 元日
  "2026-01-12", // 成人の日
  "2026-02-11", // 建国記念の日
  "2026-02-23", // 天皇誕生日
  "2026-03-20", // 春分の日
  "2026-04-29", // 昭和の日
  "2026-05-03", // 憲法記念日
  "2026-05-04", // みどりの日
  "2026-05-05", // こどもの日
  "2026-05-06", // 振替休日（憲法記念日が日曜日のため）
  "2026-07-20", // 海の日
  "2026-08-11", // 山の日
  "2026-09-21", // 敬老の日
  "2026-09-22", // 国民の休日（敬老の日と秋分の日にはさまれたため）
  "2026-09-23", // 秋分の日
  "2026-10-12", // スポーツの日
  "2026-11-03", // 文化の日
  "2026-11-23", // 勤労感謝の日
  // 2027年
  "2027-01-01", // 元日
  "2027-01-11", // 成人の日
  "2027-02-11", // 建国記念の日
  "2027-02-23", // 天皇誕生日
  "2027-03-21", // 春分の日
  "2027-04-29", // 昭和の日
  "2027-05-03", // 憲法記念日
  "2027-05-04", // みどりの日
  "2027-05-05", // こどもの日
  "2027-07-19", // 海の日
  "2027-08-11", // 山の日
  "2027-09-20", // 敬老の日
  "2027-09-23", // 秋分の日
  "2027-10-11", // スポーツの日
  "2027-11-03", // 文化の日
  "2027-11-23", // 勤労感謝の日
];

export function isWeekend(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateFnsIsWeekend(dateObj);
}

export function isHoliday(date: Date | string): boolean {
  const dateStr = typeof date === "string" ? date : format(date, "yyyy-MM-dd");
  return HOLIDAYS.includes(dateStr);
}

/** 予約可能期間：今日から何か月先までか */
export const BOOKABLE_PERIOD_MONTHS = 1;

/** 予約可能期間の最終日（今日 + BOOKABLE_PERIOD_MONTHS） */
export function getMaxBookableDate(referenceDate: Date = new Date()): Date {
  const today = startOfDay(referenceDate);
  return addMonths(today, BOOKABLE_PERIOD_MONTHS);
}

/** 日付が予約可能期間内か（今日〜1か月以内） */
export function isWithinBookablePeriod(date: Date | string, referenceDate: Date = new Date()): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = startOfDay(referenceDate);
  const maxDate = getMaxBookableDate(referenceDate);
  return !isBefore(dateObj, today) && !isAfter(dateObj, maxDate);
}

export function isBookableDate(date: Date | string, referenceDate: Date = new Date()): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = startOfDay(referenceDate);
  const maxDate = getMaxBookableDate(referenceDate);

  // 過去の日付は予約不可
  if (isBefore(dateObj, today)) return false;
  // 1か月を超える将来日は予約不可
  if (isAfter(dateObj, maxDate)) return false;
  // 土日祝のみ予約可能
  return isWeekend(date) || isHoliday(date);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy年M月d日(E)", { locale: ja });
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // "HH:mm"形式に変換
}

/** 予約の変更・キャンセル可能期限：予約日の前日17:00まで */
export const CANCELLATION_DEADLINE_HOUR = 17;

/**
 * 予約の変更・キャンセルが可能かどうか
 * 予約日の前日17:00まで可能
 */
export function canModifyReservation(bookingDate: string, now: Date = new Date()): boolean {
  const date = typeof bookingDate === "string" ? parseISO(bookingDate) : new Date(bookingDate);
  const prevDay = subDays(date, 1);
  const deadline = setSeconds(setMinutes(setHours(prevDay, CANCELLATION_DEADLINE_HOUR), 0), 0);
  return now < deadline;
}

/** 1枠あたりの時間（時間） */
export const SLOT_DURATION_HOURS = 2;

/** スロットの終了時間を取得（開始時間 + SLOT_DURATION_HOURS） */
export function getSlotEndTime(start: string): string {
  const hour = parseInt(start.split(":")[0], 10);
  return `${(hour + SLOT_DURATION_HOURS).toString().padStart(2, "0")}:00`;
}

/** 9-11, 11-13, 13-15, 15-17 の2時間枠を生成 */
export function generateTimeSlots(): string[] {
  return ["09:00", "11:00", "13:00", "15:00"];
}

/** スロット表示用（例: "9時ー11時"） */
export function formatTimeSlotDisplay(start: string): string {
  const h = parseInt(start.split(":")[0], 10);
  return `${h}時ー${h + SLOT_DURATION_HOURS}時`;
}
