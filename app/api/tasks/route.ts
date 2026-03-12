import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side only — service_role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/tasks — fetch all tasks with assignee
export async function GET() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assignee:users!tasks_assignee_id_fkey(id, full_name, role, email)")
    .order("deadline", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/tasks — create task
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error, data } = await supabase
    .from("tasks")
    .insert({
      title: body.title,
      description: body.description || null,
      assignee_id: body.assignee_id,
      deadline: body.deadline,
      priority: body.priority,
      status: body.status ?? "Процесте",
      weekly_plan: body.weekly_plan ?? false,
      created_by: body.created_by,
    })
    .select("*, assignee:users!tasks_assignee_id_fkey(id, full_name, role, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
