-- ===========================================
-- テニスコート予約システム - 予約時間枠を2時間単位に変更
-- ===========================================
-- 9-11, 11-13, 13-15, 15-17 の4枠のみ予約可能
-- 1日2枠・1週間2枠の制限維持のため、1日最大4時間に変更
-- ===========================================

-- check_daily_limit: 2時間 → 4時間（2枠×2時間）
CREATE OR REPLACE FUNCTION check_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_hours INTERVAL;
BEGIN
  SELECT COALESCE(SUM(end_time - start_time), INTERVAL '0 hours')
  INTO total_hours
  FROM reservations
  WHERE user_id = NEW.user_id
    AND court_id = NEW.court_id
    AND booking_date = NEW.booking_date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (total_hours + (NEW.end_time - NEW.start_time)) > INTERVAL '4 hours' THEN
    RAISE EXCEPTION '同一コートでの1日の予約時間は最大4時間（2枠）までです。現在の予約時間: %', total_hours;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
