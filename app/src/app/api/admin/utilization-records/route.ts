import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export type UtilizationRecord = {
  id: string;
  reservation_id: string;
  recorded_by: string | null;
  utilization_status: string;
  manners_status: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

/** GET: 予約IDに紐づく利用実績を取得 */
export async function GET(request: NextRequest) {
  try {
    const reservationId = request.nextUrl.searchParams.get("reservationId");
    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId が必要です" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("utilization_records")
      .select("*")
      .eq("reservation_id", reservationId)
      .maybeSingle();

    if (error) {
      console.error("[admin/utilization-records GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/utilization-records GET]", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

/** PUT: 利用実績を登録・更新（ upsert ） */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reservationId,
      utilizationStatus,
      mannersStatus,
      memo,
      recordedBy,
    } = body;

    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId が必要です" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const validUtilization = ["used", "no_show", "unrecorded"];
    const validManners = [
      "no_violation",
      "loud_music",
      "time_exceeded",
      "garbage",
      "smoking",
      "restoration",
      "manners_other",
    ];

    const utilization_status =
      validUtilization.includes(utilizationStatus) ? utilizationStatus : "unrecorded";
    const manners_status =
      validManners.includes(mannersStatus) ? mannersStatus : "no_violation";

    const payload = {
      reservation_id: reservationId,
      recorded_by: recordedBy || null,
      utilization_status,
      manners_status,
      memo: memo?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("utilization_records")
      .upsert(payload, {
        onConflict: "reservation_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[admin/utilization-records PUT]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/utilization-records PUT]", e);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
