import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate") ?? undefined;
    const toDate = searchParams.get("toDate") ?? undefined;
    const courtId = searchParams.get("courtId") ?? undefined;

    const supabase = getAdminClient();
    let query = supabase
      .from("reservations")
      .select("*, court:courts(*), profile:profiles(*), utilization_records(*)")
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (fromDate) query = query.gte("booking_date", fromDate);
    if (toDate) query = query.lte("booking_date", toDate);
    if (courtId) query = query.eq("court_id", courtId);

    const { data, error } = await query;

    if (error) {
      console.error("[admin/reservations]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reservations = (data || []).map((r: { profile: unknown; utilization_records: unknown }) => {
      const ur = r.utilization_records;
      const utilization_record = Array.isArray(ur) ? ur[0] : ur;
      return {
        ...r,
        profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
        utilization_record: utilization_record ?? null,
      };
    });

    return NextResponse.json(reservations);
  } catch (e) {
    console.error("[admin/reservations]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
