import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

/** 認証不要時、運営メモの author_id 用に最初の管理者IDを返す */
export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    return NextResponse.json({ authorId: data?.id ?? null });
  } catch {
    return NextResponse.json({ authorId: null });
  }
}
