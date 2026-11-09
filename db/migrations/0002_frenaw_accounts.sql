ALTER TABLE users ADD COLUMN google_subject TEXT;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_google_subject ON users (google_subject) WHERE google_subject IS NOT NULL;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS email_verification_user ON email_verification_tokens (user_id);

CREATE INDEX IF NOT EXISTS jobs_open_feed ON jobs (status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS jobs_category_feed ON jobs (category, status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS users_freelancer_feed ON users (user_type, onboarding_done, rating_avg DESC, total_jobs_completed DESC, id);
CREATE INDEX IF NOT EXISTS users_freelancer_category ON users (category, user_type, onboarding_done);
CREATE INDEX IF NOT EXISTS handshakes_job_freelancer ON handshakes (job_id, freelancer_id, status);
CREATE INDEX IF NOT EXISTS handshakes_client ON handshakes (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_handshake_reviewer ON reviews (handshake_id, reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee ON reviews (reviewee_id);
