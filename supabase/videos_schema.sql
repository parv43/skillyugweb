-- ============================================================
-- SKILLYUG SESSION RECORDINGS — Supabase SQL Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Create the session_recordings table
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id    TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  published_at        TIMESTAMPTZ NOT NULL,
  custom_date         TEXT, -- formatted date like "10th May 2026"
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_session_recordings_published_at
  ON public.session_recordings (published_at DESC);

-- Enable RLS
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- ── Policies ──────────────────────────────────────────────

-- Anyone authenticated can read the recordings
CREATE POLICY "recordings_select_authenticated"
  ON public.session_recordings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert new recordings
CREATE POLICY "recordings_insert_admin"
  ON public.session_recordings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update recordings
CREATE POLICY "recordings_update_admin"
  ON public.session_recordings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete recordings
CREATE POLICY "recordings_delete_admin"
  ON public.session_recordings FOR DELETE
  TO authenticated
  USING (public.is_admin());
