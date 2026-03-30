"use client";

import { useEffect, useState } from "react";
import {
  getCourtsForAdmin,
  updateCourt,
  type Court,
} from "@/lib/supabase";
export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCourts = async () => {
    try {
      setLoading(true);
      const data = await getCourtsForAdmin();
      setCourts(data);
    } catch (error) {
      console.error("Failed to load courts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  const startEdit = (court: Court) => {
    setEditingId(court.id);
    setEditDisplayName(court.display_name);
    setEditIsActive(court.is_active);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      const ok = await updateCourt(editingId, {
        display_name: editDisplayName.trim(),
        is_active: editIsActive,
      });
      if (ok) {
        setEditingId(null);
        await loadCourts();
      } else {
        alert("更新に失敗しました");
      }
    } catch (e: any) {
      alert(e.message || "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">コート管理</h1>

      <div className="card max-w-2xl">
        <p className="text-sm text-on-background/70 mb-4">
          表示名の変更や使用可否（無効化）を設定できます。無効にしたコートは予約カレンダーに表示されません。
        </p>
        <div className="space-y-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className="p-4 border border-outline/20 rounded-lg flex items-center justify-between gap-4"
            >
              {editingId === court.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="input"
                      placeholder="表示名"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                      />
                      使用可能
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editDisplayName.trim()}
                      className="btn-primary text-sm"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="btn-secondary text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{court.display_name}</p>
                    <p className="text-sm text-on-background/70">
                      {court.name} {court.is_active ? "（使用可能）" : "（無効）"}
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(court)}
                    className="btn-secondary text-sm"
                  >
                    編集
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        {courts.length === 0 && (
          <p className="text-on-background/70">コートがありません</p>
        )}
      </div>
    </div>
  );
}
