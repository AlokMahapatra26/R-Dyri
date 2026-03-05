-- =============================================================
-- R-Dyri: Full Database Schema for NeonDB (PostgreSQL)
-- Run this in the NeonDB SQL editor
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- PROFILES
-- Stores user profile info (linked to Supabase auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT,
    dob         DATE,
    gender      TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- PARTNERSHIPS
-- Tracks couple pairings — one user invites another by email
-- =============================================================
CREATE TABLE IF NOT EXISTS partnerships (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user1_email TEXT NOT NULL,
    user2_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user2_email TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user1_email, user2_email)
);

-- =============================================================
-- DIARIES
-- Individual diary entries written by each user
-- =============================================================
CREATE TABLE IF NOT EXISTS diaries (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title        TEXT,
    content      TEXT NOT NULL DEFAULT '',
    photos       TEXT[] NOT NULL DEFAULT '{}',
    logical_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_logical_date ON diaries(logical_date DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_diaries_updated_at
    BEFORE UPDATE ON diaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- REACTIONS
-- Emoji reactions on diary entries
-- =============================================================
CREATE TABLE IF NOT EXISTS reactions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id   UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entry_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_entry_id ON reactions(entry_id);

-- =============================================================
-- MESSAGES
-- Real-time chat messages between partners
-- =============================================================
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id  UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_partnership_id ON messages(partnership_id, created_at ASC);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- ---- PROFILES ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view their partner's profile"
    ON profiles FOR SELECT
    USING (
        id IN (
            SELECT CASE
                WHEN user1_id = auth.uid() THEN user2_id
                ELSE user1_id
            END
            FROM partnerships
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
              AND status = 'accepted'
        )
    );

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ---- PARTNERSHIPS ----
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own partnerships"
    ON partnerships FOR SELECT
    USING (user1_id = auth.uid() OR user2_id = auth.uid() OR user2_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create partnerships"
    ON partnerships FOR INSERT
    WITH CHECK (user1_id = auth.uid());

CREATE POLICY "Users can update partnerships they are invited to"
    ON partnerships FOR UPDATE
    USING (user2_id = auth.uid() OR user1_id = auth.uid());

CREATE POLICY "Users can delete their own pending partnerships"
    ON partnerships FOR DELETE
    USING (user1_id = auth.uid() AND status = 'pending');

-- ---- DIARIES ----
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view each other's diary entries"
    ON diaries FOR SELECT
    USING (
        user_id = auth.uid()
        OR user_id IN (
            SELECT CASE
                WHEN user1_id = auth.uid() THEN user2_id
                ELSE user1_id
            END
            FROM partnerships
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
              AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create their own entries"
    ON diaries FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own entries"
    ON diaries FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own entries"
    ON diaries FOR DELETE
    USING (user_id = auth.uid());

-- ---- REACTIONS ----
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view reactions"
    ON reactions FOR SELECT
    USING (
        entry_id IN (
            SELECT id FROM diaries
            WHERE user_id = auth.uid()
               OR user_id IN (
                    SELECT CASE
                        WHEN user1_id = auth.uid() THEN user2_id
                        ELSE user1_id
                    END
                    FROM partnerships
                    WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
                      AND status = 'accepted'
               )
        )
    );

CREATE POLICY "Users can insert reactions"
    ON reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
    ON reactions FOR DELETE
    USING (user_id = auth.uid());

-- ---- MESSAGES ----
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view messages in their partnership"
    ON messages FOR SELECT
    USING (
        partnership_id IN (
            SELECT id FROM partnerships
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
              AND status = 'accepted'
        )
    );

CREATE POLICY "Partners can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND partnership_id IN (
            SELECT id FROM partnerships
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
              AND status = 'accepted'
        )
    );

CREATE POLICY "Partners can delete messages in their partnership"
    ON messages FOR DELETE
    USING (
        partnership_id IN (
            SELECT id FROM partnerships
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
              AND status = 'accepted'
        )
    );

-- =============================================================
-- REALTIME (Enable for live chat)
-- Run this in the Supabase dashboard > Replication
-- or use: ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- =============================================================

-- =============================================================
-- STORAGE BUCKETS (Supabase-specific — skip for pure NeonDB)
-- If using Supabase Storage, create these buckets in the dashboard:
--   • avatars  (public)
--   • diary-photos  (public)
-- =============================================================
