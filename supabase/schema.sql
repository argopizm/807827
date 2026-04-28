-- ============================================================
-- Freelancer Türkiye — Supabase Schema
-- Supabase Dashboard > SQL Editor > New Query > Çalıştır
-- ============================================================

-- NextAuth için gerekli tablolar (@auth/supabase-adapter)
CREATE TABLE IF NOT EXISTS accounts (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID NOT NULL,
  type                 TEXT NOT NULL,
  provider             TEXT NOT NULL,
  provider_account_id  TEXT NOT NULL,
  refresh_token        TEXT,
  access_token         TEXT,
  expires_at           BIGINT,
  token_type           TEXT,
  scope                TEXT,
  id_token             TEXT,
  session_state        TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Kullanıcılar tablosu (NextAuth uyumlu + platformumuza özel alanlar)
CREATE TABLE IF NOT EXISTS users (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT,
  email            TEXT UNIQUE,
  email_verified   TIMESTAMPTZ,
  image            TEXT,
  -- Platform alanları
  username         TEXT UNIQUE,
  bio              TEXT,
  portfolio_url    TEXT,
  contact_links    JSONB DEFAULT '{}'::jsonb,
  password_hash    TEXT,
  password_salt    TEXT,
  user_type        TEXT CHECK (user_type IN ('freelancer', 'employer')),
  onboarding_done  BOOLEAN DEFAULT FALSE,
  tc_verified      BOOLEAN DEFAULT FALSE,
  trust_badge      BOOLEAN DEFAULT FALSE,
  rating_avg       REAL DEFAULT 0,
  total_jobs_done  INTEGER DEFAULT 0,
  skills           TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- İş ilanları tablosu
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  budget       TEXT,
  location     TEXT DEFAULT 'Uzaktan',
  skills       TEXT[] DEFAULT '{}',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- El sıkışma talepleri
CREATE TABLE IF NOT EXISTS handshakes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id       UUID REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  message      TEXT,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, sender_id)
);

-- Değerlendirmeler
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  handshake_id UUID REFERENCES handshakes(id),
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (handshake_id, reviewer_id)
);

-- Row Level Security (isteğe bağlı — daha güvenli)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE handshakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni (public profiller)
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT USING (true);
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);

-- Foreign key ilişkileri
ALTER TABLE accounts ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
