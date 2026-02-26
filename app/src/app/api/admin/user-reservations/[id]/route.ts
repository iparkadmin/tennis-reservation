import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("*, court:courts(*), profile:profiles(*)")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("[admin/user-reservations]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reservations = (data || []).map((r: { profile: unknown }) => ({
      ...r,
      profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
    }));

    return NextResponse.json(reservations);
  } catch (e) {
    console.error("[admin/user-reservations]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
