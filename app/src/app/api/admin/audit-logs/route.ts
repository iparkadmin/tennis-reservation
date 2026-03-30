import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? undefined;
    const tableName = searchParams.get("tableName") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "200", 10);

    const supabase = getAdminClient();
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (action) query = query.eq("action", action);
    if (tableName) query = query.eq("table_name", tableName);

    const { data, error } = await query;

    if (error) {
      console.error("[admin/audit-logs]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[admin/audit-logs]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
