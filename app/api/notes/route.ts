import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/notes?user_id=xxx — fetch notes for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("notes")
    .select("*, note_attachments(*)")
    .eq("user_id", userId)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const notes = (data || []).map((n) => ({
    ...n,
    attachments: n.note_attachments || [],
    note_attachments: undefined,
  }));

  return NextResponse.json(notes);
}

// POST /api/notes — create a note
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: body.user_id,
      title: body.title,
      content: body.content || null,
      color: body.color || "yellow",
      pinned: body.pinned ?? false,
    })
    .select("*, note_attachments(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ...data, attachments: data.note_attachments || [], note_attachments: undefined }, { status: 201 });
}
