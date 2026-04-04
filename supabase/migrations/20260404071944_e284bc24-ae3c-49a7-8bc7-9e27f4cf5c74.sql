-- Drop the insecure custom users table
DROP TABLE IF EXISTS public.users;

-- Fix charging_history policies: change public role to authenticated
DROP POLICY IF EXISTS "Users can delete own history" ON public.charging_history;
CREATE POLICY "Users can delete own history" ON public.charging_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own history" ON public.charging_history;
CREATE POLICY "Users can update own history" ON public.charging_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);