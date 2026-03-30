import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAdminClient } from "@/lib/adminSupabase";

async function verifyAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Supabase設定が不完全です", status: 500 as const };
  }
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証が必要です", status: 401 as const };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { error: "管理者権限が必要です", status: 403 as const };
  }
  return { ok: true };
}

/** auth.users にいるが profiles にいないユーザーに profiles を自動作成 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase設定が不完全です" },
        { status: 500 }
      );
    }

    const adminClient = getAdminClient();
    const { data: authData } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });
    const authUsers = authData?.users ?? [];

    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id")
      .in("id", authUsers.map((u) => u.id));
    const profileIds = new Set((profiles || []).map((p) => p.id));

    const mismatch = authUsers.filter((u) => !profileIds.has(u.id));
    let created = 0;
    for (const u of mismatch) {
      const { error } = await adminClient.from("profiles").insert({
        id: u.id,
        full_name: u.user_metadata?.full_name ?? "",
        full_name_kana: u.user_metadata?.full_name_kana ?? "",
        email: u.email ?? "",
      });
      if (!error) created++;
    }

    return NextResponse.json({ fixed: created, total: mismatch.length });
  } catch (error) {
    console.error("[auth-mismatch POST]", error);
    return NextResponse.json(
      { error: "自動修正に失敗しました" },
      { status: 500 }
    );
  }
}
