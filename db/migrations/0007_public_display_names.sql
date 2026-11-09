ALTER TABLE users ADD COLUMN display_name TEXT;

-- Never copy a private legal name into the public display name.
-- Existing profiles fall back to their already-public username until edited.
CREATE UNIQUE INDEX IF NOT EXISTS users_username_casefold
  ON users (LOWER(username)) WHERE NULLIF(TRIM(username), '') IS NOT NULL;
