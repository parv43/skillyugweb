-- ============================================================
-- DUAL ONBOARDING & SPONSOR ME SYSTEM — Supabase SQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Users table extending auth.users with custom roles
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL CHECK (role IN ('student', 'parent', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Student-Parent Relations (Mapping parent to enrolled children)
CREATE TABLE IF NOT EXISTS public.student_parent_relations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, student_id)
);

-- 3. Pending Enrollments (Sponsorship tokens)
CREATE TABLE IF NOT EXISTS public.pending_enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'expired')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-Sync auth.users to public.users Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Extract role from metadata, default to 'student'
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- Ensure role is valid
  IF v_role NOT IN ('student', 'parent', 'admin') THEN
    v_role := 'student';
  END IF;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Skillyug Student'),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = COALESCE(EXCLUDED.role, public.users.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;

-- ── public.users policies ──────────────────────────────────────

-- Anyone authenticated can see user profiles
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "users_insert_self"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_self"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── public.student_parent_relations policies ───────────────────

-- Parent or student in the relation can select
CREATE POLICY "relations_select"
  ON public.student_parent_relations FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Parents can insert relations where they are the parent
CREATE POLICY "relations_insert_parent"
  ON public.student_parent_relations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

-- ── public.pending_enrollments policies ────────────────────────

-- Anyone can read sponsorship tokens to resolve them
CREATE POLICY "sponsorship_select_all"
  ON public.pending_enrollments FOR SELECT
  USING (true);

-- Authenticated students can create their own sponsorship token
CREATE POLICY "sponsorship_insert_student"
  ON public.pending_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Authenticated users can update sponsorship status
CREATE POLICY "sponsorship_update_all"
  ON public.pending_enrollments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_parent_relations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pending_enrollments TO anon, authenticated;
