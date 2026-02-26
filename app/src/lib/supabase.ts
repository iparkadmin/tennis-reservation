import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { formatTime } from './dateUtils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl) {
  console.error('[Supabase] Missing env: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  console.error('[Supabase] Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// createBrowserClient でクッキー管理（ミドルウェアと同期、ログアウト時に確実にセッション解除）
export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

// 型定義（他のファイルで使用される可能性がある）
export type Profile = {
  id: string
  full_name: string
  full_name_kana: string
  email: string
  created_at: string
  updated_at: string
  role?: string
  is_blocked?: boolean
}

export type Reservation = {
  id: string
  user_id: string
  court_id: string
  booking_date: string
  start_time: string
  end_time: string
  contact_notes?: string
  reservation_number?: string
  created_at: string
  updated_at?: string
  court?: {
    id: string
    name: string
    display_name: string
    is_active: boolean
  }
  profile?: Profile
}

export type Court = {
  id: string
  name: string
  display_name: string
  is_active: boolean
}

export type Utilizer = {
  id: string
  user_id: string
  full_name: string
  created_at: string
  updated_at: string
}

// データベース関数（必要に応じて他のファイルからインポートされる）
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) {
    console.error('Error updating profile:', error)
    return false
  }
  return true
}

export async function getCourts(): Promise<Court[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) {
    console.error('Error fetching courts:', error)
    return []
  }
  return data || []
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('reservations')
    .select('*, court:courts(*)')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
  if (error) {
    console.error('Error fetching reservations:', error)
    return []
  }
  return data || []
}

export async function getAllUserReservations(userId: string): Promise<Reservation[]> {
  return getUserReservations(userId)
}

export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('reservations')
    .select('*, court:courts(*)')
    .eq('id', reservationId)
    .single()
  if (error) {
    console.error('Error fetching reservation:', error)
    return null
  }
  return data
}

export async function updateReservation(
  reservationId: string,
  updates: Partial<Reservation>
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', reservationId)
  if (error) {
    console.error('Error updating reservation:', error)
    return false
  }
  return true
}

export async function cancelReservation(reservationId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId)
  if (error) {
    console.error('Error canceling reservation:', error)
    return false
  }
  return true
}

export async function getReservationsByDate(
  date: string,
  courtId?: string
): Promise<Reservation[]> {
  if (!isSupabaseConfigured) return []
  // カレンダー表示用：全ユーザーの予約を取得するため public_availability VIEW を使用
  // これにより、RLSポリシーの影響を受けずに予約済みスロットを表示できる
  let query = supabase
    .from('public_availability')
    .select('*')
    .eq('booking_date', date)
  
  if (courtId) {
    query = query.eq('court_id', courtId)
  }
  
  const { data, error } = await query
  if (error) {
    console.error('Error fetching reservations by date:', error)
    return []
  }
  
  // public_availability VIEW のデータを Reservation 型に合わせて変換
  // start_time/end_time は DB が "09:00:00" 形式で返すため "HH:mm" に正規化
  // court 情報はカレンダー表示では不要（既に selectedCourtId でフィルタリング済み）
  return (data || []).map((r: any) => ({
    id: r.id,
    user_id: '', // public_availability には user_id が含まれない
    court_id: r.court_id,
    booking_date: r.booking_date,
    start_time: formatTime(String(r.start_time ?? '')),
    end_time: formatTime(String(r.end_time ?? '')),
    created_at: r.created_at,
    court: undefined, // カレンダー表示では不要
  })) as Reservation[]
}

export async function getUtilizers(userId: string): Promise<Utilizer[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('utilizers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) {
    console.error('Error fetching utilizers:', error)
    return []
  }
  return data || []
}

export async function createUtilizer(
  userId: string,
  fullName: string
): Promise<Utilizer | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('utilizers')
    .insert({
      user_id: userId,
      full_name: fullName.trim(),
    })
    .select()
    .single()
  if (error) {
    console.error('Error creating utilizer:', error)
    throw new Error(error.message || '利用者の追加に失敗しました')
  }
  return data
}

export async function updateUtilizer(
  utilizerId: string,
  userId: string,
  updates: { full_name: string }
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('utilizers')
    .update({ full_name: updates.full_name.trim() })
    .eq('id', utilizerId)
    .eq('user_id', userId)
  if (error) {
    console.error('Error updating utilizer:', error)
    return false
  }
  return true
}

/** 予約確定時に利用者一覧を保存（新規追加・更新・削除を同期） */
export async function saveUtilizers(
  userId: string,
  utilizers: { id?: string; full_name: string }[]
): Promise<void> {
  if (!isSupabaseConfigured) return
  const existing = await getUtilizers(userId)
  const existingIds = new Set(existing.map((u) => u.id))
  const formIds = new Set(utilizers.filter((u) => u.id).map((u) => u.id!))

  for (const u of utilizers) {
    const name = u.full_name?.trim()
    if (!name) continue
    if (u.id && existingIds.has(u.id)) {
      const orig = existing.find((x) => x.id === u.id)
      if (orig && orig.full_name !== name) {
        await updateUtilizer(u.id, userId, { full_name: name })
      }
    } else if (!u.id) {
      await createUtilizer(userId, name)
    }
  }
  for (const id of existingIds) {
    if (!formIds.has(id)) {
      await deleteUtilizer(id, userId)
    }
  }
}

export async function deleteUtilizer(utilizerId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('utilizers')
    .delete()
    .eq('id', utilizerId)
    .eq('user_id', userId)
  if (error) {
    console.error('Error deleting utilizer:', error)
    return false
  }
  return true
}

// ===========================================
// 管理者用関数（RLS で role='admin' のユーザーのみ実行可能）
// ===========================================

export type ProfileWithReservationCount = Profile & { reservation_count: number }

export async function getAllProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching all profiles:', error)
    return []
  }
  return data || []
}

export async function getProfilesWithReservationCount(): Promise<ProfileWithReservationCount[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('*, reservations(count)')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching profiles with count:', error)
    return []
  }
  return (data || []).map((p: any) => ({
    ...p,
    reservation_count: Array.isArray(p.reservations) && p.reservations[0] ? p.reservations[0].count : 0,
    reservations: undefined,
  })) as ProfileWithReservationCount[]
}

export async function getAllReservations(filters?: {
  fromDate?: string
  toDate?: string
  courtId?: string
}): Promise<Reservation[]> {
  if (!isSupabaseConfigured) return []
  let query = supabase
    .from('reservations')
    .select('*, court:courts(*), profile:profiles(*)')
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
  if (filters?.fromDate) {
    query = query.gte('booking_date', filters.fromDate)
  }
  if (filters?.toDate) {
    query = query.lte('booking_date', filters.toDate)
  }
  if (filters?.courtId) {
    query = query.eq('court_id', filters.courtId)
  }
  const { data, error } = await query
  if (error) {
    console.error('Error fetching all reservations:', error)
    return []
  }
  return (data || []).map((r: any) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
  })) as Reservation[]
}

export async function getAdminReservationsByDate(
  date: string,
  courtId?: string
): Promise<Reservation[]> {
  if (!isSupabaseConfigured) return []
  let query = supabase
    .from('reservations')
    .select('*, court:courts(*), profile:profiles(*)')
    .eq('booking_date', date)
    .order('start_time')
  if (courtId) {
    query = query.eq('court_id', courtId)
  }
  const { data, error } = await query
  if (error) {
    console.error('Error fetching admin reservations by date:', error)
    return []
  }
  return (data || []).map((r: any) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
  })) as Reservation[]
}

export async function createReservationForUser(
  userId: string,
  courtId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  contactNotes?: string
): Promise<Reservation | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: userId,
      court_id: courtId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      contact_notes: contactNotes || null,
    })
    .select('*, court:courts(*)')
    .single()
  if (error) {
    console.error('Error creating reservation for user:', error)
    throw new Error(error.message || '予約の作成に失敗しました')
  }
  return data
}

export async function getAdminNotes(userId: string): Promise<{ id: string; content: string; created_at: string; author_id: string }[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('admin_notes')
    .select('id, content, created_at, author_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching admin notes:', error)
    return []
  }
  return data || []
}

export async function addAdminNote(
  userId: string,
  authorId: string,
  content: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('admin_notes')
    .insert({ user_id: userId, author_id: authorId, content: content.trim() })
  if (error) {
    console.error('Error adding admin note:', error)
    return false
  }
  return true
}

export async function getCourtsForAdmin(): Promise<Court[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('name')
  if (error) {
    console.error('Error fetching courts for admin:', error)
    return []
  }
  return data || []
}

export type AuditLog = {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

export async function getAuditLogs(filters?: {
  action?: string
  tableName?: string
  limit?: number
}): Promise<AuditLog[]> {
  if (!isSupabaseConfigured) return []
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.tableName) query = query.eq('table_name', filters.tableName)
  query = query.limit(filters?.limit ?? 100)
  const { data, error } = await query
  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  return data || []
}

export async function updateCourt(
  courtId: string,
  updates: { display_name?: string; is_active?: boolean }
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', courtId)
  if (error) {
    console.error('Error updating court:', error)
    return false
  }
  return true
}

export async function createReservation(
  userId: string,
  courtId: string,
  bookingDate: string,
  startTime: string,
  endTime: string
): Promise<Reservation | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: userId,
      court_id: courtId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
    })
    .select('*, court:courts(*)')
    .single()
  if (error) {
    console.error('Error creating reservation:', error)
    throw new Error(error.message || '予約の作成に失敗しました')
  }
  return data
}
