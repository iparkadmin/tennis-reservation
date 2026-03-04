import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();

    const { data: resData, error } = await supabase
      .from("reservations")
      .select("*, court:courts(*), profile:profiles(*), utilization_records(*)")
      .eq("id", id)
      .single();

    if (error || !resData) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    // 利用者（utilizers）を取得
    const { data: ruData } = await supabase
      .from("reservation_utilizers")
      .select("utilizer_id")
      .eq("reservation_id", id);
    const utilizerIds = (ruData ?? []).map((r) => r.utilizer_id);
    let utilizers: { id: string; full_name: string }[] = [];
    if (utilizerIds.length > 0) {
      const { data: utilizersData } = await supabase
        .from("utilizers")
        .select("id, full_name")
        .in("id", utilizerIds);
      const orderMap = new Map(utilizerIds.map((uid, i) => [uid, i]));
      utilizers = (utilizersData ?? []).sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );
    }

    const r = resData as { profile: unknown; utilization_records: unknown };
    const ur = r.utilization_records;
    const utilization_record = Array.isArray(ur) ? ur[0] : ur;

    return NextResponse.json({
      ...r,
      profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
      utilization_record: utilization_record ?? null,
      utilizers,
    });
  } catch (e) {
    console.error("[admin/reservations/[id]]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      console.error("[admin/reservations DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/reservations DELETE]", e);
    return NextResponse.json({ error: "キャンセルに失敗しました" }, { status: 500 });
  }
}
