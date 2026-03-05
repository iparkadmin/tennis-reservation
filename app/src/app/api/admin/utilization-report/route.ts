import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

type Row = {
  user_id: string;
  full_name: string;
  email: string;
  is_blocked: boolean;
  no_show_count: number;
  manners_violation_count: number;
  manners_other_count: number;
  used_count: number;
};

function getDefaultPeriod(): { startYear: number; startMonth: number; endYear: number; endMonth: number } {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 前月の1日
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1); // その3か月前
  return {
    startYear: startDate.getFullYear(),
    startMonth: startDate.getMonth() + 1,
    endYear: endDate.getFullYear(),
    endMonth: endDate.getMonth() + 1,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get("startYear") ?? "", 10);
    const startMonth = parseInt(searchParams.get("startMonth") ?? "", 10);
    const endYear = parseInt(searchParams.get("endYear") ?? "", 10);
    const endMonth = parseInt(searchParams.get("endMonth") ?? "", 10);

    let sy: number, sm: number, ey: number, em: number;
    if (
      Number.isFinite(startYear) &&
      Number.isFinite(startMonth) &&
      Number.isFinite(endYear) &&
      Number.isFinite(endMonth) &&
      startMonth >= 1 &&
      startMonth <= 12 &&
      endMonth >= 1 &&
      endMonth <= 12
    ) {
      sy = startYear;
      sm = startMonth;
      ey = endYear;
      em = endMonth;
    } else {
      const def = getDefaultPeriod();
      sy = def.startYear;
      sm = def.startMonth;
      ey = def.endYear;
      em = def.endMonth;
    }

    const startDate = `${sy}-${String(sm).padStart(2, "0")}-01`;
    const endDateObj = new Date(ey, em, 0);
    const endDate = `${ey}-${String(em).padStart(2, "0")}-${String(endDateObj.getDate()).padStart(2, "0")}`;

    const supabase = getAdminClient();

    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, user_id")
      .gte("booking_date", startDate)
      .lte("booking_date", endDate);

    if (!reservations || reservations.length === 0) {
      return NextResponse.json({
        period: { startYear: sy, startMonth: sm, endYear: ey, endMonth: em },
        rows: [],
      });
    }

    const resIds = reservations.map((r) => r.id);
    const { data: records } = await supabase
      .from("utilization_records")
      .select("reservation_id, utilization_status, manners_status")
      .in("reservation_id", resIds)
      .neq("utilization_status", "unrecorded");

    const resById = new Map(reservations.map((r) => [r.id, r.user_id]));
    const agg = new Map<
      string,
      { no_show: number; manners_violation: number; manners_other: number; used: number }
    >();

    for (const rec of records ?? []) {
      const userId = resById.get(rec.reservation_id);
      if (!userId) continue;

      const u = agg.get(userId) ?? {
        no_show: 0,
        manners_violation: 0,
        manners_other: 0,
        used: 0,
      };

      if (rec.utilization_status === "no_show") u.no_show++;
      if (rec.utilization_status === "used") u.used++;
      if (rec.manners_status === "manners_other") u.manners_other++;
      else if (rec.manners_status !== "no_violation") u.manners_violation++;

      agg.set(userId, u);
    }

    const userIds = Array.from(agg.keys());
    if (userIds.length === 0) {
      return NextResponse.json({
        period: { startYear: sy, startMonth: sm, endYear: ey, endMonth: em },
        rows: [],
      });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_blocked")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { full_name: p.full_name ?? "-", email: p.email ?? "-", is_blocked: p.is_blocked ?? false }])
    );

    const rows: Row[] = userIds.map((uid) => {
      const p = profileMap.get(uid) ?? { full_name: "-", email: "-", is_blocked: false };
      const u = agg.get(uid)!;
      return {
        user_id: uid,
        full_name: p.full_name,
        email: p.email,
        is_blocked: p.is_blocked,
        no_show_count: u.no_show,
        manners_violation_count: u.manners_violation,
        manners_other_count: u.manners_other,
        used_count: u.used,
      };
    });

    rows.sort((a, b) => {
      if (b.no_show_count !== a.no_show_count) return b.no_show_count - a.no_show_count;
      return b.manners_violation_count - a.manners_violation_count;
    });

    return NextResponse.json({
      period: { startYear: sy, startMonth: sm, endYear: ey, endMonth: em },
      rows,
    });
  } catch (e) {
    console.error("[admin/utilization-report]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
