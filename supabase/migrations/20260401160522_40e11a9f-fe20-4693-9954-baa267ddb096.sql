
-- Block all access to users table (sensitive data - password hashes)
CREATE POLICY "Deny all select on users"
  ON public.users FOR SELECT
  USING (false);

CREATE POLICY "Deny all insert on users"
  ON public.users FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny all update on users"
  ON public.users FOR UPDATE
  USING (false);

CREATE POLICY "Deny all delete on users"
  ON public.users FOR DELETE
  USING (false);

-- Restrict charging_history update/delete to record owner
CREATE POLICY "Users can update own history"
  ON public.charging_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.charging_history FOR DELETE
  USING (auth.uid() = user_id);
