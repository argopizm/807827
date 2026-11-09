CREATE TABLE chat_threads (
  id TEXT PRIMARY KEY,
  first_user TEXT NOT NULL REFERENCES users (id),
  second_user TEXT NOT NULL REFERENCES users (id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (first_user, second_user),
  CHECK (first_user < second_user)
);
CREATE INDEX chat_threads_second_user ON chat_threads (second_user);

CREATE TABLE chat_messages (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  thread_id TEXT NOT NULL REFERENCES chat_threads (id),
  sender_id TEXT NOT NULL REFERENCES users (id),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 4000),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX chat_messages_thread ON chat_messages (thread_id, seq DESC);

CREATE TABLE chat_reads (
  thread_id TEXT NOT NULL REFERENCES chat_threads (id),
  user_id TEXT NOT NULL REFERENCES users (id),
  last_read_seq INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE chat_blocks (
  blocker_id TEXT NOT NULL REFERENCES users (id),
  blocked_id TEXT NOT NULL REFERENCES users (id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE chat_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users (id),
  message_id TEXT NOT NULL REFERENCES chat_messages (id),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (reporter_id, message_id)
);

CREATE TABLE support_staff (
  user_id TEXT PRIMARY KEY REFERENCES users (id)
);

CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  assigned_to TEXT REFERENCES support_staff (user_id),
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'awaiting_user', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX support_tickets_user ON support_tickets (user_id, updated_at DESC);
CREATE INDEX support_tickets_queue ON support_tickets (status, updated_at DESC);

CREATE TABLE support_replies (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  ticket_id TEXT NOT NULL REFERENCES support_tickets (id),
  author_id TEXT NOT NULL REFERENCES users (id),
  staff INTEGER NOT NULL DEFAULT 0 CHECK (staff IN (0, 1)),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX support_replies_ticket ON support_replies (ticket_id, seq);

CREATE TABLE support_events (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets (id),
  actor_id TEXT NOT NULL REFERENCES users (id),
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Keep the previous table intact for rollback. Copy valid historical conversations in order.
INSERT INTO chat_threads (id, first_user, second_user, created_at)
SELECT lower(hex(randomblob(16))), min(sender_id, receiver_id), max(sender_id, receiver_id), coalesce(min(m.created_at), CURRENT_TIMESTAMP)
FROM messages m
JOIN users s ON s.id = m.sender_id
JOIN users r ON r.id = m.receiver_id
WHERE sender_id <> receiver_id AND length(m.content) > 0
GROUP BY min(sender_id, receiver_id), max(sender_id, receiver_id);

INSERT INTO chat_messages (id, thread_id, sender_id, content, created_at)
SELECT m.id, t.id, m.sender_id, substr(m.content, 1, 4000), coalesce(m.created_at, CURRENT_TIMESTAMP)
FROM messages m
JOIN chat_threads t ON t.first_user = min(m.sender_id, m.receiver_id) AND t.second_user = max(m.sender_id, m.receiver_id)
WHERE length(m.content) > 0
ORDER BY m.created_at, m.id;

-- Advance through read messages only until the first unread inbound message.
INSERT INTO chat_reads (thread_id, user_id, last_read_seq)
SELECT c.thread_id, m.receiver_id, max(c.seq)
FROM chat_messages c JOIN messages m ON m.id = c.id
WHERE m.is_read = 1 AND NOT EXISTS (
  SELECT 1 FROM chat_messages earlier JOIN messages source ON source.id = earlier.id
  WHERE earlier.thread_id = c.thread_id AND source.receiver_id = m.receiver_id
    AND earlier.seq < c.seq AND coalesce(source.is_read, 0) = 0
)
GROUP BY c.thread_id, m.receiver_id;
