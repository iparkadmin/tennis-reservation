import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("courts")
      .select("*")
      .order("name");

    if (error) {
      console.error("[admin/courts]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[admin/courts]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
