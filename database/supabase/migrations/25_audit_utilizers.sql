-- ===========================================
-- テニスコート予約システム - 利用者（utilizers）の監査ログ
-- ===========================================
-- utilizers テーブルの作成・更新・削除を audit_logs に記録
-- ===========================================

CREATE OR REPLACE FUNCTION log_utilizer_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'create', 'utilizers', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'update', 'utilizers', NEW.id,
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'delete', 'utilizers', OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_utilizer_changes ON utilizers;
CREATE TRIGGER audit_utilizer_changes
  AFTER INSERT OR UPDATE OR DELETE ON utilizers
  FOR EACH ROW EXECUTE FUNCTION log_utilizer_changes();
