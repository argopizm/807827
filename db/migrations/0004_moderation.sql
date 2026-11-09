ALTER TABLE chat_reports ADD COLUMN resolved_at TEXT;
ALTER TABLE chat_reports ADD COLUMN resolved_by TEXT REFERENCES support_staff (user_id);

CREATE INDEX IF NOT EXISTS chat_messages_sender_recent ON chat_messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_reports_open ON chat_reports (resolved_at, created_at DESC);
