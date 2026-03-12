-- Run this in Supabase SQL Editor to allow anon access
-- (since we use localStorage auth, not Supabase Auth)

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_events DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon role
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.tasks TO anon;
GRANT ALL ON public.weekly_events TO anon;
