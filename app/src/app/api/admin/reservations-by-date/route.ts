import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const courtId = searchParams.get("courtId") ?? undefined;

    if (!date) {
      return NextResponse.json({ error: "date が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    let query = supabase
      .from("reservations")
      .select("*, court:courts(*), profile:profiles(*)")
      .eq("booking_date", date)
      .order("start_time");

    if (courtId) query = query.eq("court_id", courtId);

    const { data, error } = await query;

    if (error) {
      console.error("[admin/reservations-by-date]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reservations = (data || []).map((r: { profile: unknown }) => ({
      ...r,
      profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
    }));

    return NextResponse.json(reservations);
  } catch (e) {
    console.error("[admin/reservations-by-date]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
