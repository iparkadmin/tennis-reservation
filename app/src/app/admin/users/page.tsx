"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProfilesWithReservationCount,
  type ProfileWithReservationCount,
} from "@/lib/supabase";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Search, AlertTriangle } from "lucide-react";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<ProfileWithReservationCount[]>([]);
  const [filtered, setFiltered] = useState<ProfileWithReservationCount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProfilesWithReservationCount();
        setProfiles(data);
        setFiltered(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(profiles);
      return;
    }
    const q = search.toLowerCase().trim();
    setFiltered(
      profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.full_name_kana?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      )
    );
  }, [search, profiles]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-on-background/70">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">ユーザー一覧</h1>
        <Link
          href="/admin/users/mismatch"
          className="text-sm text-highlight hover:underline flex items-center gap-1"
        >
          <AlertTriangle className="w-4 h-4" />
          auth/profiles 不整合確認
        </Link>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            type="text"
            placeholder="氏名・カナ・メールで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <p className="text-sm text-on-background/70">
          {filtered.length} 件 / {profiles.length} 件
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline/20 bg-surface">
                <th className="text-left py-3 px-4">氏名</th>
                <th className="text-left py-3 px-4">氏名（カナ）</th>
                <th className="text-left py-3 px-4">メール</th>
                <th className="text-left py-3 px-4">予約件数</th>
                <th className="text-left py-3 px-4">状態</th>
                <th className="text-left py-3 px-4">登録日</th>
                <th className="text-left py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline/10 hover:bg-surface/50">
                  <td className="py-3 px-4">{p.full_name || "-"}</td>
                  <td className="py-3 px-4">{p.full_name_kana || "-"}</td>
                  <td className="py-3 px-4">{p.email || "-"}</td>
                  <td className="py-3 px-4">{p.reservation_count ?? 0}</td>
                  <td className="py-3 px-4">
                    {p.is_blocked ? (
                      <span className="text-highlight font-medium">ブロック中</span>
                    ) : (
                      <span className="text-on-background/70">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p.created_at
                      ? format(new Date(p.created_at), "yyyy/MM/dd", { locale: ja })
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/users/${p.id}`}
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
          <p className="py-8 text-center text-on-background/70">該当するユーザーがいません</p>
        )}
      </div>
    </div>
  );
}
