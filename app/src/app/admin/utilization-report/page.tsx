"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUtilizationReport, type UtilizationReportRow } from "@/lib/adminApiClient";

function getDefaultPeriod(): { startYear: number; startMonth: number; endYear: number; endMonth: number } {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
  return {
    startYear: startDate.getFullYear(),
    startMonth: startDate.getMonth() + 1,
    endYear: endDate.getFullYear(),
    endMonth: endDate.getMonth() + 1,
  };
}

function monthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    opts.push({ value: `${y}-${m}`, label: `${y}年${m}月` });
  }
  return opts;
}

export default function AdminUtilizationReportPage() {
  const def = getDefaultPeriod();
  const [startYear, setStartYear] = useState(def.startYear);
  const [startMonth, setStartMonth] = useState(def.startMonth);
  const [endYear, setEndYear] = useState(def.endYear);
  const [endMonth, setEndMonth] = useState(def.endMonth);
  const [rows, setRows] = useState<UtilizationReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getUtilizationReport({
          startYear,
          startMonth,
          endYear,
          endMonth,
        });
        setRows(data.rows);
      } catch (error) {
        console.error("Failed to load utilization report:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [startYear, startMonth, endYear, endMonth]);

  const monthOpts = monthOptions();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">利用実績</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-on-background/70 mb-1">集計開始月</label>
          <select
            value={`${startYear}-${startMonth}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setStartYear(y);
              setStartMonth(m);
            }}
            className="input w-40"
          >
            {monthOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-on-background/70 mb-1">集計終了月</label>
          <select
            value={`${endYear}-${endMonth}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setEndYear(y);
              setEndMonth(m);
            }}
            className="input w-40"
          >
            {monthOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-on-background/70">
          {startYear}年{startMonth}月 〜 {endYear}年{endMonth}月　{rows.length} 名
        </p>
      </div>

      {loading ? (
        <div className="text-on-background/70">読み込み中...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-outline/20">
                  <th className="text-left py-3 px-4">氏名</th>
                  <th className="text-left py-3 px-4">メール</th>
                  <th className="text-right py-3 px-4">無断キャンセル</th>
                  <th className="text-right py-3 px-4">マナー違反</th>
                  <th className="text-right py-3 px-4">マナー状況その他</th>
                  <th className="text-right py-3 px-4">利用済</th>
                  <th className="text-left py-3 px-4">備考</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-background/60">
                      該当データがありません
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.user_id} className="border-b border-outline/10">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/users/${r.user_id}`}
                          className="text-primary hover:underline"
                        >
                          {r.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{r.email}</td>
                      <td className="text-right py-3 px-4">{r.no_show_count}</td>
                      <td className="text-right py-3 px-4">{r.manners_violation_count}</td>
                      <td className="text-right py-3 px-4">{r.manners_other_count}</td>
                      <td className="text-right py-3 px-4">{r.used_count}</td>
                      <td className="py-3 px-4">
                        {r.is_blocked ? (
                          <span className="text-highlight font-medium">利用制限中</span>
                        ) : (
                          <>—</>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
