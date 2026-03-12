const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();

async function migrate() {
  // Use the Supabase Management API / SQL endpoint
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS public.task_assignees (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      UNIQUE(task_id, user_id)
    )`,
    `ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_assignees' AND policyname = 'All can read task_assignees') THEN
        CREATE POLICY "All can read task_assignees" ON public.task_assignees FOR SELECT USING (true);
      END IF;
    END $$`,
    `INSERT INTO public.task_assignees (task_id, user_id)
     SELECT id, assignee_id FROM public.tasks
     ON CONFLICT DO NOTHING`,
  ];

  for (const sql of sqlStatements) {
    const res = await fetch(`${url}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    // This won't work via PostgREST — need SQL editor
  }

  // Alternative: use supabase-js to check if table exists
  const supabase = createClient(url, serviceKey);

  // Check if task_assignees already has data
  const { data, error } = await supabase.from("task_assignees").select("id").limit(1);
  if (error && error.message.includes("does not exist")) {
    console.log("Table task_assignees does NOT exist yet.");
    console.log("Please run this SQL in Supabase SQL Editor:");
    console.log("---");
    console.log(sqlStatements.join(";\n\n") + ";");
    console.log("---");
  } else if (data) {
    console.log("Table task_assignees exists, rows:", data.length);

    // Migrate existing tasks
    const { data: tasks } = await supabase.from("tasks").select("id, assignee_id");
    if (tasks && tasks.length > 0) {
      const rows = tasks.map((t) => ({ task_id: t.id, user_id: t.assignee_id }));
      const { error: insertError } = await supabase
        .from("task_assignees")
        .upsert(rows, { onConflict: "task_id,user_id" });
      if (insertError) {
        console.log("Migration insert error:", insertError.message);
      } else {
        console.log("Migrated", rows.length, "existing task assignments");
      }
    }
  } else {
    console.log("Table exists but empty, error:", error?.message);
  }
}

migrate();
