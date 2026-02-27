"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getProfile,
  getUserReservations,
  getUtilizers,
  getAdminNotes,
  addAdminNote,
  createReservationForUser,
  getCourtsForAdmin,
  createUtilizer,
  updateUtilizer,
  deleteUtilizer,
  updateProfile,
  type Profile,
  type Reservation,
  type Utilizer,
  type Court,
} from "@/lib/supabase";
import {
  formatDate,
  formatTime,
  isBookableDate,
  isWithinBookablePeriod,
  generateTimeSlots,
  getMaxBookableDate,
  getSlotEndTime,
} from "@/lib/dateUtils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Plus, Pencil, Trash2, Ban, UserCheck } from "lucide-react";

type AdminNote = { id: string; content: string; created_at: string; author_id: string };

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [utilizers, setUtilizers] = useState<Utilizer[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showCreateReservation, setShowCreateReservation] = useState(false);
  const [createDate, setCreateDate] = useState("");
  const [createCourtId, setCreateCourtId] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingUtilizerId, setEditingUtilizerId] = useState<string | null>(null);
  const [editUtilizerName, setEditUtilizerName] = useState("");
  const [newUtilizerName, setNewUtilizerName] = useState("");
  const [savingUtilizer, setSavingUtilizer] = useState(false);
  const [togglingBlock, setTogglingBlock] = useState(false);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [profileData, reservationsData, utilizersData, notesData, courtsData] =
        await Promise.all([
          getProfile(userId),
          getUserReservations(userId),
          getUtilizers(userId),
          getAdminNotes(userId),
          getCourtsForAdmin(),
        ]);
      setProfile(profileData);
      setReservations(reservationsData);
      setUtilizers(utilizersData);
      setNotes(notesData);
      setCourts(courtsData);
      if (courtsData.length > 0 && !createCourtId) setCreateCourtId(courtsData[0].id);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-highlight">ユーザーが見つかりません</p>
        <Link href="/admin/users" className="text-primary hover:underline mt-2 inline-block">
          ユーザー一覧へ戻る
        </Link>
      </div>
    );
  }

  const futureReservations = reservations.filter(
    (r) => r.booking_date >= new Date().toISOString().slice(0, 10)
  );
  const pastReservations = reservations.filter(
    (r) => r.booking_date < new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="p-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-primary hover:underline mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        ユーザー一覧へ戻る
      </Link>

      <h1 className="text-2xl font-bold text-primary mb-6">ユーザー詳細</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-bold text-primary">プロフィール</h2>
          {currentUserId !== userId && (
            <button
              onClick={async () => {
                const blocked = !profile.is_blocked;
                const action = blocked ? "ブロック" : "ブロック解除";
                if (!confirm(`${profile.full_name || "このユーザー"}を${action}しますか？`)) return;
                setTogglingBlock(true);
                const ok = await updateProfile(userId, { is_blocked: blocked });
                if (ok) await loadData(false);
                setTogglingBlock(false);
              }}
              disabled={togglingBlock}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg ${
                profile.is_blocked
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-highlight/20 text-highlight hover:bg-highlight/30"
              }`}
            >
              {profile.is_blocked ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  {togglingBlock ? "解除中..." : "ブロック解除"}
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  {togglingBlock ? "ブロック中..." : "ブロック"}
                </>
              )}
            </button>
          )}
        </div>
        {profile.is_blocked && (
          <div className="mb-4 p-3 rounded-lg bg-highlight/10 border border-highlight/30 text-highlight text-sm">
            このユーザーはブロックされています。予約の作成・変更・キャンセルができません。
          </div>
        )}
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <dt className="text-sm text-on-background/70">氏名</dt>
            <dd className="font-medium">{profile.full_name || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">氏名（カナ）</dt>
            <dd className="font-medium">{profile.full_name_kana || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">メール</dt>
            <dd className="font-medium">{profile.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-on-background/70">登録日</dt>
            <dd className="font-medium">
              {profile.created_at
                ? format(new Date(profile.created_at), "yyyy/MM/dd HH:mm", { locale: ja })
                : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-primary mb-4">登録利用者（家族・友人など）</h2>
        <div className="space-y-3">
          {utilizers.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              {editingUtilizerId === u.id ? (
                <>
                  <input
                    type="text"
                    value={editUtilizerName}
                    onChange={(e) => setEditUtilizerName(e.target.value)}
                    className="input flex-1"
                    placeholder="氏名"
                  />
                  <button
                    onClick={async () => {
                      if (!editUtilizerName.trim()) return;
                      setSavingUtilizer(true);
                      const ok = await updateUtilizer(u.id, userId, { full_name: editUtilizerName.trim() });
                      if (ok) {
                        setEditingUtilizerId(null);
                        await loadData(false);
                      }
                      setSavingUtilizer(false);
                    }}
                    disabled={savingUtilizer || !editUtilizerName.trim()}
                    className="btn-primary text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingUtilizerId(null)}
                    disabled={savingUtilizer}
                    className="btn-secondary text-sm"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{u.full_name}</span>
                  <button
                    onClick={() => {
                      setEditingUtilizerId(u.id);
                      setEditUtilizerName(u.full_name);
                    }}
                    className="text-primary hover:underline text-sm"
                  >
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`「${u.full_name}」を削除しますか？`)) return;
                      setSavingUtilizer(true);
                      const ok = await deleteUtilizer(u.id, userId);
                      if (ok) await loadData(false);
                      setSavingUtilizer(false);
                    }}
                    disabled={savingUtilizer}
                    className="text-highlight hover:underline text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2 border-t border-outline/20">
            <input
              type="text"
              value={newUtilizerName}
              onChange={(e) => setNewUtilizerName(e.target.value)}
              className="input flex-1"
              placeholder="新しい利用者を追加"
            />
            <button
              onClick={async () => {
                if (!newUtilizerName.trim()) return;
                setSavingUtilizer(true);
                try {
                  await createUtilizer(userId, newUtilizerName.trim());
                  setNewUtilizerName("");
                  await loadData(false);
                } catch (e) {
                  alert((e as Error).message || "追加に失敗しました");
                }
                setSavingUtilizer(false);
              }}
              disabled={savingUtilizer || !newUtilizerName.trim()}
              className="btn-primary text-sm"
            >
              追加
            </button>
          </div>
        </div>
        {utilizers.length === 0 && (
          <p className="text-on-background/70 text-sm">登録利用者がいません。下記から追加できます。</p>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-primary mb-4">運営メモ</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="個別対応の記録を入力..."
              className="input flex-1 min-h-[80px]"
              rows={3}
            />
            <button
              onClick={async () => {
                if (!noteContent.trim() || !currentUserId) return;
                setAddingNote(true);
                const ok = await addAdminNote(userId, currentUserId, noteContent);
                if (ok) {
                  setNoteContent("");
                  const notesData = await getAdminNotes(userId);
                  setNotes(notesData);
                }
                setAddingNote(false);
              }}
              disabled={!noteContent.trim() || addingNote}
              className="btn-primary self-end"
            >
              {addingNote ? "追加中..." : "追加"}
            </button>
          </div>
          {notes.length > 0 ? (
            <ul className="space-y-2 border-t border-outline/20 pt-3">
              {notes.map((n) => (
                <li key={n.id} className="text-sm bg-surface/50 rounded-lg p-3">
                  <p className="whitespace-pre-wrap">{n.content}</p>
                  <p className="text-on-background/50 text-xs mt-1">
                    {format(new Date(n.created_at), "yyyy/MM/dd HH:mm", { locale: ja })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-background/70 text-sm">メモはありません</p>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">今後の予約</h2>
          <button
            onClick={() => setShowCreateReservation(!showCreateReservation)}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            予約を代行作成
          </button>
        </div>
        {showCreateReservation && (
          <div className="mb-4 p-4 bg-surface/50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-on-background/70 mb-1">日付</label>
                <input
                  type="date"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={format(getMaxBookableDate(), "yyyy-MM-dd")}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm text-on-background/70 mb-1">コート</label>
                <select
                  value={createCourtId}
                  onChange={(e) => setCreateCourtId(e.target.value)}
                  className="input"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-on-background/70 mb-1">時間</label>
                <select
                  value={createTime}
                  onChange={(e) => setCreateTime(e.target.value)}
                  className="input"
                >
                  <option value="">選択</option>
                  {generateTimeSlots().map((t) => (
                    <option key={t} value={t}>{t}-{getSlotEndTime(t)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={async () => {
                if (!createDate || !createCourtId || !createTime) {
                  alert("日付・コート・時間を選択してください");
                  return;
                }
                if (!isWithinBookablePeriod(createDate)) {
                  alert("予約可能期間は今日から30日以内です");
                  return;
                }
                if (!isBookableDate(createDate)) {
                  alert("土曜・日曜・祝日のみ予約可能です");
                  return;
                }
                const endTime = getSlotEndTime(createTime);
                try {
                  setCreating(true);
                  await createReservationForUser(userId, createCourtId, createDate, createTime, endTime);
                  setShowCreateReservation(false);
                  setCreateDate("");
                  setCreateTime("");
                  await loadData(false);
                } catch (e: any) {
                  alert(e.message || "予約の作成に失敗しました");
                } finally {
                  setCreating(false);
                }
              }}
              disabled={creating}
              className="btn-primary"
            >
              {creating ? "作成中..." : "予約を作成"}
            </button>
          </div>
        )}
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
                  <th className="text-left py-2 px-3">予約番号</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {futureReservations.map((r) => (
                  <tr key={r.id} className="border-b border-outline/10">
                    <td className="py-2 px-3">{formatDate(r.booking_date)}</td>
                    <td className="py-2 px-3">{r.court?.display_name ?? "-"}</td>
                    <td className="py-2 px-3">
                      {formatTime(r.start_time)}-{formatTime(r.end_time)}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{r.reservation_number ?? "-"}</td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/admin/reservations/${r.id}`}
                        className="text-primary hover:underline"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-primary mb-4">過去の予約</h2>
        {pastReservations.length === 0 ? (
          <p className="text-on-background/70">予約がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="text-left py-2 px-3">日付</th>
                  <th className="text-left py-2 px-3">コート</th>
                  <th className="text-left py-2 px-3">時間</th>
                  <th className="text-left py-2 px-3">予約番号</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {pastReservations.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-b border-outline/10">
                    <td className="py-2 px-3">{formatDate(r.booking_date)}</td>
                    <td className="py-2 px-3">{r.court?.display_name ?? "-"}</td>
                    <td className="py-2 px-3">
                      {formatTime(r.start_time)}-{formatTime(r.end_time)}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{r.reservation_number ?? "-"}</td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/admin/reservations/${r.id}`}
                        className="text-primary hover:underline"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pastReservations.length > 20 && (
          <p className="mt-2 text-sm text-on-background/70">
            直近20件を表示（全{pastReservations.length}件）
          </p>
        )}
      </div>
    </div>
  );
}
