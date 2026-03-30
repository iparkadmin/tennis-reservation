import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_blocked } = body;

    if (is_blocked === undefined) {
      return NextResponse.json({ error: "is_blocked が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !!is_blocked })
      .eq("id", id);

    if (error) {
      console.error("[admin/profiles PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/profiles PATCH]", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
