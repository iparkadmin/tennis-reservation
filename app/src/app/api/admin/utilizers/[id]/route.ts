import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name } = body;
    if (!full_name) {
      return NextResponse.json({ error: "full_name が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("utilizers")
      .update({ full_name: full_name.trim() })
      .eq("id", id);

    if (error) {
      console.error("[admin/utilizers PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/utilizers PATCH]", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from("utilizers").delete().eq("id", id);

    if (error) {
      console.error("[admin/utilizers DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/utilizers DELETE]", e);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
