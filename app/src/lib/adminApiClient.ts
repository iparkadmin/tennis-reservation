/**
 * 管理画面用 API クライアント（認証不要・Service Role 経由）
 */
import type { Profile, ProfileWithReservationCount, Reservation, Court, Utilizer, AuditLog } from "./supabase";

const base = "/api/admin";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export async function getProfilesWithReservationCount(): Promise<ProfileWithReservationCount[]> {
  return fetchJson(`${base}/profiles`);
}

export async function getAllReservations(filters?: {
  fromDate?: string;
  toDate?: string;
  courtId?: string;
}): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (filters?.fromDate) params.set("fromDate", filters.fromDate);
  if (filters?.toDate) params.set("toDate", filters.toDate);
  if (filters?.courtId) params.set("courtId", filters.courtId);
  const q = params.toString();
  return fetchJson(`${base}/reservations${q ? `?${q}` : ""}`);
}

export async function getAdminReservationsByDate(
  date: string,
  courtId?: string
): Promise<Reservation[]> {
  const params = new URLSearchParams({ date });
  if (courtId) params.set("courtId", courtId);
  return fetchJson(`${base}/reservations-by-date?${params}`);
}

export async function getCourtsForAdmin(): Promise<Court[]> {
  return fetchJson(`${base}/courts`);
}

export async function getAuditLogs(filters?: {
  action?: string;
  tableName?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const params = new URLSearchParams();
  if (filters?.action) params.set("action", filters.action);
  if (filters?.tableName) params.set("tableName", filters.tableName);
  if (filters?.limit) params.set("limit", String(filters.limit));
  const q = params.toString();
  return fetchJson(`${base}/audit-logs${q ? `?${q}` : ""}`);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    return await fetchJson(`${base}/profile/${userId}`);
  } catch {
    return null;
  }
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
  return fetchJson(`${base}/user-reservations/${userId}`);
}

export async function getAdminNotes(userId: string): Promise<{ id: string; content: string; created_at: string; author_id: string }[]> {
  return fetchJson(`${base}/notes?userId=${encodeURIComponent(userId)}`);
}

export async function addAdminNote(
  userId: string,
  authorId: string,
  content: string
): Promise<boolean> {
  const res = await fetch(`${base}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, authorId, content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "追加に失敗しました");
  }
  return true;
}

export async function createReservationForUser(
  userId: string,
  courtId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  contactNotes?: string
): Promise<Reservation> {
  return fetchJson(`${base}/reservations/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      contactNotes,
    }),
  });
}

export async function updateCourt(
  courtId: string,
  updates: { display_name?: string; is_active?: boolean }
): Promise<boolean> {
  const res = await fetch(`${base}/courts/${courtId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "更新に失敗しました");
  }
  return true;
}

export async function updateProfile(userId: string, updates: { is_blocked?: boolean }): Promise<boolean> {
  const res = await fetch(`${base}/profiles/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "更新に失敗しました");
  }
  return true;
}

export async function cancelReservation(reservationId: string): Promise<boolean> {
  const res = await fetch(`${base}/reservations/${reservationId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "キャンセルに失敗しました");
  }
  return true;
}

export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  try {
    return await fetchJson(`${base}/reservations/${reservationId}`);
  } catch {
    return null;
  }
}

export async function getUtilizers(userId: string): Promise<Utilizer[]> {
  return fetchJson(`${base}/utilizers?userId=${encodeURIComponent(userId)}`);
}

export async function createUtilizer(userId: string, fullName: string): Promise<Utilizer> {
  return fetchJson(`${base}/utilizers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, fullName }),
  });
}

export async function updateUtilizer(utilizerId: string, fullName: string): Promise<boolean> {
  const res = await fetch(`${base}/utilizers/${utilizerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "更新に失敗しました");
  }
  return true;
}

export async function deleteUtilizer(utilizerId: string): Promise<boolean> {
  const res = await fetch(`${base}/utilizers/${utilizerId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "削除に失敗しました");
  }
  return true;
}

// ===========================================
// 利用実績記録（utilization_records）
// ===========================================

export type UtilizationRecord = {
  id: string;
  reservation_id: string;
  recorded_by: string | null;
  utilization_status: string;
  manners_status: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUtilizationRecord(
  reservationId: string
): Promise<UtilizationRecord | null> {
  try {
    return await fetchJson(
      `${base}/utilization-records?reservationId=${encodeURIComponent(reservationId)}`
    );
  } catch {
    return null;
  }
}

export async function upsertUtilizationRecord(
  reservationId: string,
  data: {
    utilizationStatus: string;
    mannersStatus: string;
    memo?: string;
  }
): Promise<UtilizationRecord> {
  return fetchJson(`${base}/utilization-records`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reservationId,
      utilizationStatus: data.utilizationStatus,
      mannersStatus: data.mannersStatus,
      memo: data.memo ?? "",
    }),
  });
}

// ===========================================
// 利用実績集計（utilization-report）
// ===========================================

export type UtilizationReportRow = {
  user_id: string;
  full_name: string;
  email: string;
  is_blocked: boolean;
  no_show_count: number;
  manners_violation_count: number;
  manners_other_count: number;
  used_count: number;
};

export async function getUtilizationReport(params?: {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
}): Promise<{
  period: { startYear: number; startMonth: number; endYear: number; endMonth: number };
  rows: UtilizationReportRow[];
}> {
  const search = new URLSearchParams();
  if (params?.startYear != null) search.set("startYear", String(params.startYear));
  if (params?.startMonth != null) search.set("startMonth", String(params.startMonth));
  if (params?.endYear != null) search.set("endYear", String(params.endYear));
  if (params?.endMonth != null) search.set("endMonth", String(params.endMonth));
  const q = search.toString();
  return fetchJson(`${base}/utilization-report${q ? `?${q}` : ""}`);
}
