"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, AlertTriangle } from "lucide-react";

type MismatchUser = { id: string; email: string; created_at: string };

export default function AdminAuthMismatchPage() {
  const [users, setUsers] = useState<MismatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/auth-mismatch");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "取得に失敗しました");
        setUsers(data.users || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-primary hover:underline mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        ユーザー一覧へ戻る
      </Link>

      <h1 className="text-2xl font-bold text-primary mb-6">
        auth.users と profiles の不整合
      </h1>

      <div className="card mb-6 p-4 bg-highlight/10 border border-highlight">
        <div className="flex gap-2">
          <AlertTriangle className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-highlight mb-1">再登録不可の原因</p>
            <p className="text-on-background/80">
              auth.users に存在するが profiles に存在しないユーザーは、同じメールで再登録できません。
              該当ユーザーは Supabase ダッシュボードの Authentication → Users から手動で削除してください。
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-on-background/70">読み込み中...</p>
      ) : error ? (
        <p className="text-highlight">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-on-background/70">不整合はありません</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline/20 bg-surface">
                <th className="text-left py-3 px-4">メール</th>
                <th className="text-left py-3 px-4">Auth登録日</th>
                <th className="text-left py-3 px-4">ユーザーID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-outline/10">
                  <td className="py-3 px-4">{u.email || "-"}</td>
                  <td className="py-3 px-4">
                    {u.created_at
                      ? format(new Date(u.created_at), "yyyy/MM/dd HH:mm", { locale: ja })
                      : "-"}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
