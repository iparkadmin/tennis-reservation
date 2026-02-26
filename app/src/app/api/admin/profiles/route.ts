import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*, reservations(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/profiles]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profiles = (data || []).map((p: { reservations?: { count: number }[] }) => ({
      ...p,
      reservation_count: Array.isArray(p.reservations) && p.reservations[0] ? p.reservations[0].count : 0,
      reservations: undefined,
    }));

    return NextResponse.json(profiles);
  } catch (e) {
    console.error("[admin/profiles]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
