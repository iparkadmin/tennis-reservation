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
      .from("utilizers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");

    if (error) {
      console.error("[admin/utilizers]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[admin/utilizers]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName } = body;
    if (!userId || !fullName) {
      return NextResponse.json({ error: "userId, fullName が必要です" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("utilizers")
      .insert({ user_id: userId, full_name: fullName.trim() })
      .select()
      .single();

    if (error) {
      console.error("[admin/utilizers POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/utilizers POST]", e);
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
