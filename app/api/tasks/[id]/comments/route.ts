import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/tasks/:id/comments
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, user:users(id, full_name, role)")
    .eq("task_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

// POST /api/tasks/:id/comments
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: params.id,
      user_id: body.user_id,
      content: body.content,
    })
    .select("*, user:users(id, full_name, role)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/tasks/:id/comments?comment_id=xxx
export async function DELETE(req: NextRequest) {
  const commentId = req.nextUrl.searchParams.get("comment_id");
  if (!commentId) return NextResponse.json({ error: "comment_id required" }, { status: 400 });

  const { error } = await supabase.from("task_comments").delete().eq("id", commentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
