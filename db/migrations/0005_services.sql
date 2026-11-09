CREATE TABLE services (
  id TEXT PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users (id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX services_public_feed ON services (status, created_at DESC, id DESC);
CREATE INDEX services_owner ON services (freelancer_id, created_at DESC);
