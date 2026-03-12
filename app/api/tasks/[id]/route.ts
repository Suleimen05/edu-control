import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH /api/tasks/:id — update task fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { assignee, assignees, task_assignees: _ta, id: _id, created_at, updated_at, assignee_ids, ...updates } = body;

  // Update task fields
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If assignee_ids provided, update junction table
  if (assignee_ids && Array.isArray(assignee_ids) && assignee_ids.length > 0) {
    // Delete old assignments
    await supabase.from("task_assignees").delete().eq("task_id", id);
    // Insert new assignments
    const rows = assignee_ids.map((uid: string) => ({ task_id: id, user_id: uid }));
    await supabase.from("task_assignees").insert(rows);
    // Update assignee_id for backward compat
    await supabase.from("tasks").update({ assignee_id: assignee_ids[0] }).eq("id", id);
  }

  // Fetch updated task with assignees
  const { data } = await supabase
    .from("tasks")
    .select("*, task_assignees(user:users(id, full_name, role, email))")
    .eq("id", id)
    .single();

  const assigneesList = (data?.task_assignees || [])
    .map((ta: { user: unknown }) => ta.user)
    .filter(Boolean);

  return NextResponse.json({
    ...data,
    assignees: assigneesList,
    assignee: assigneesList[0] || null,
    task_assignees: undefined,
  });
}

// DELETE /api/tasks/:id — delete task (junction rows cascade automatically)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
