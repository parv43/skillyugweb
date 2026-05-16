-- ============================================================
-- SKILLYUG COMMENT SYSTEM — Supabase SQL Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. Admins table (tracks which users have admin rights)
CREATE TABLE IF NOT EXISTS public.admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 2. Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug    TEXT NOT NULL,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name    TEXT NOT NULL,
  user_avatar  TEXT,
  content      TEXT NOT NULL CHECK (char_length(content) BETWEEN 3 AND 1000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_blog_slug_created
  ON public.comments (blog_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON public.comments (user_id);

CREATE INDEX IF NOT EXISTS idx_admins_user_id
  ON public.admins (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins   ENABLE ROW LEVEL SECURITY;

-- Helper function: returns TRUE if the calling user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- ── Comments policies ──────────────────────────────────────

-- Anyone (even anon) can read comments
CREATE POLICY "comments_select_anyone"
  ON public.comments FOR SELECT
  USING (true);

-- Only authenticated users can insert their OWN comment
CREATE POLICY "comments_insert_authenticated"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can delete any comment
CREATE POLICY "comments_delete_admins_only"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── Admins policies ───────────────────────────────────────

-- Admins can see the admins table; users can see their own row
CREATE POLICY "admins_select_policy"
  ON public.admins FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

-- Only existing admins can insert new admins (bootstrap: first admin via SQL)
CREATE POLICY "admins_insert_policy"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can remove admin rights
CREATE POLICY "admins_delete_policy"
  ON public.admins FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Grant SELECT on admins to the anon role so the is_admin()
-- function can be used in RLS without a permission error.
-- ============================================================
GRANT SELECT ON public.admins TO anon, authenticated;

-- ============================================================
-- HOW TO ADD YOUR FIRST ADMIN:
--   INSERT INTO public.admins (user_id)
--   VALUES ('<your-supabase-user-uuid>');
-- Run this directly in the SQL editor with service-role access.
-- ============================================================
