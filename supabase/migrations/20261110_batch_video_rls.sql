-- ============================================================
-- BATCH-BASED VIDEO ACCESS CONTROL RLS
-- Enforces that students can ONLY read session recordings
-- belonging to the batch they have purchased/enrolled in.
-- ============================================================

-- Drop the old permissive policy if it exists
DROP POLICY IF EXISTS "recordings_select_authenticated" ON public.session_recordings;
DROP POLICY IF EXISTS "recordings_select_batch_authorized" ON public.session_recordings;

-- Create strict batch-authorized select policy
CREATE POLICY "recordings_select_batch_authorized"
  ON public.session_recordings FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    (
      session_recordings.batch_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM public.slot_bookings sb
        WHERE sb.batch_id = session_recordings.batch_id
          AND (
            sb.user_id = auth.uid() OR
            sb.email = (auth.jwt() ->> 'email')
          )
      )
    )
  );

