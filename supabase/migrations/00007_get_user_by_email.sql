-- ============================================
-- OCCHIALE Migration 00007
-- Helper function to look up auth user by email
-- Used by inviteMemberAction to find users
-- ============================================

CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS TABLE(id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT id FROM auth.users WHERE email = lower(p_email) LIMIT 1;
$$;

-- Only allow service role to call this function
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM anon;
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM authenticated;
