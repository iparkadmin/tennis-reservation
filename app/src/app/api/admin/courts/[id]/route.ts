import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { display_name, is_active } = body;

    const updates: { display_name?: string; is_active?: boolean } = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "更新内容がありません" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("courts")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[admin/courts PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/courts PATCH]", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
