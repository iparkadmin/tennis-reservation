import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();

    const { data: resData, error: resError } = await supabase
      .from("reservations")
      .select("*, court:courts(*), profile:profiles(*), utilization_records(*)")
      .eq("id", id)
      .single();

    if (resError || !resData) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const { data: ruData } = await supabase
      .from("reservation_utilizers")
      .select("utilizers(id, full_name)")
      .eq("reservation_id", id);

    const utilizers = ((ruData || []) as { utilizers: { id: string; full_name: string } | null }[])
      .map((ru) => ru.utilizers)
      .filter((u): u is { id: string; full_name: string } => u != null);

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
