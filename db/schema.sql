-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    portfolio_url TEXT,
    contact_links TEXT,
    password_hash TEXT,
    password_salt TEXT,
    user_type TEXT DEFAULT NULL,
    onboarding_done BOOLEAN DEFAULT 0,
    tc_verified BOOLEAN DEFAULT 0,
    trust_badge BOOLEAN DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    rating_avg REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- Handshakes Table
CREATE TABLE IF NOT EXISTS handshakes (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    freelancer_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    handshake_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (handshake_id) REFERENCES handshakes(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Migration: add columns if not exists (run these manually on existing D1)
-- ALTER TABLE users ADD COLUMN username TEXT;
-- ALTER TABLE users ADD COLUMN password_hash TEXT;
-- ALTER TABLE users ADD COLUMN password_salt TEXT;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
