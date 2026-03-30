"use client";

import { useEffect, useState } from "react";
import { getAuditLogs, type AuditLog } from "@/lib/supabase";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogs({
          action: actionFilter || undefined,
          tableName: tableFilter || undefined,
          limit: 200,
        });
        setLogs(data);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actionFilter, tableFilter]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">監査ログ</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-on-background/70 mb-1">操作</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input w-40"
          >
            <option value="">すべて</option>
            <option value="create">作成</option>
            <option value="update">更新</option>
            <option value="delete">削除</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-on-background/70 mb-1">テーブル</label>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="input w-40"
          >
            <option value="">すべて</option>
            <option value="reservations">reservations</option>
            <option value="utilizers">utilizers</option>
          </select>
        </div>
        <p className="text-sm text-on-background/70">{logs.length} 件</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-outline/20">
                <th className="text-left py-3 px-4">日時</th>
                <th className="text-left py-3 px-4">操作</th>
                <th className="text-left py-3 px-4">テーブル</th>
                <th className="text-left py-3 px-4">ユーザーID</th>
                <th className="text-left py-3 px-4">レコードID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-outline/10">
                  <td className="py-2 px-4 whitespace-nowrap">
                    {format(new Date(log.created_at), "yyyy/MM/dd HH:mm:ss", { locale: ja })}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        log.action === "create"
                          ? "bg-green-100 text-green-800"
                          : log.action === "update"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-4">{log.table_name}</td>
                  <td className="py-2 px-4 font-mono text-xs truncate max-w-[120px]" title={log.user_id ?? ""}>
                    {log.user_id ?? "-"}
                  </td>
                  <td className="py-2 px-4 font-mono text-xs truncate max-w-[120px]" title={log.record_id ?? ""}>
                    {log.record_id ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && !loading && (
          <p className="py-8 text-center text-on-background/70">ログがありません</p>
        )}
      </div>
    </div>
  );
}
