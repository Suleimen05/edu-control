import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH /api/notes/:id — update a note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.color !== undefined) updates.color = body.color;
  if (body.pinned !== undefined) updates.pinned = body.pinned;

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", params.id)
    .select("*, note_attachments(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ...data, attachments: data.note_attachments || [], note_attachments: undefined });
}

// DELETE /api/notes/:id — delete a note
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // First delete attachments from storage
  const { data: attachments } = await supabase
    .from("note_attachments")
    .select("file_url")
    .eq("note_id", params.id);

  if (attachments && attachments.length > 0) {
    const paths = attachments.map((a) => {
      const url = a.file_url as string;
      const idx = url.indexOf("/attachments/");
      return idx >= 0 ? url.substring(idx + "/attachments/".length) : "";
    }).filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from("attachments").remove(paths);
    }
  }

  const { error } = await supabase.from("notes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
