import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("admin_notes")
      .select("id, content, created_at, author_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/notes]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[admin/notes]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, authorId, content } = body;
    if (!userId || !authorId || !content) {
      return NextResponse.json({ error: "userId, authorId, content が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("admin_notes")
      .insert({ user_id: userId, author_id: authorId, content: content.trim() });

    if (error) {
      console.error("[admin/notes POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/notes POST]", e);
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
