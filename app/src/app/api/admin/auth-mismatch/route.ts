import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase設定が不完全です" },
        { status: 500 }
      );
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    const authUsers = authData?.users ?? [];

    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id")
      .in("id", authUsers.map((u) => u.id));

    const profileIds = new Set((profiles || []).map((p) => p.id));
    const mismatch = authUsers
      .filter((u) => !profileIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      }));

    return NextResponse.json({ users: mismatch });
  } catch (error) {
    console.error("[auth-mismatch]", error);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}
