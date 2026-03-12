import { createClient } from "@supabase/supabase-js";

// Anon key — used client-side only for READ + realtime subscriptions
// All writes go through /api/tasks routes (server-side with service_role key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
