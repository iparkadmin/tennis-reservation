import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/adminSupabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courtId, bookingDate, startTime, endTime, contactNotes } = body;

    if (!userId || !courtId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "userId, courtId, bookingDate, startTime, endTime が必要です" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        user_id: userId,
        court_id: courtId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        contact_notes: contactNotes || null,
      })
      .select("*, court:courts(*)")
      .single();

    if (error) {
      console.error("[admin/reservations/create]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[admin/reservations/create]", e);
    return NextResponse.json({ error: "予約の作成に失敗しました" }, { status: 500 });
  }
}
