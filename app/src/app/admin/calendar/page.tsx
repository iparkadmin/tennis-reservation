"use client";

import AdminCalendar from "@/components/AdminCalendar";

export default function AdminCalendarPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">予約カレンダー</h1>
      <p className="text-on-background/70 mb-6">
        全予約の空き状況を確認できます。予約済みの枠をクリックすると予約詳細へ移動します。
      </p>
      <AdminCalendar />
    </div>
  );
}
