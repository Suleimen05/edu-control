import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/notes/:id/attachments — upload file
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `notes/${params.id}/${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(storagePath, Buffer.from(bytes), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("note_attachments")
    .insert({
      note_id: params.id,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/notes/:noteId/attachments?attachment_id=xxx
export async function DELETE(req: NextRequest) {
  const attachmentId = req.nextUrl.searchParams.get("attachment_id");
  if (!attachmentId) return NextResponse.json({ error: "attachment_id required" }, { status: 400 });

  // Get file URL to delete from storage
  const { data: attachment } = await supabase
    .from("note_attachments")
    .select("file_url")
    .eq("id", attachmentId)
    .single();

  if (attachment) {
    const url = attachment.file_url as string;
    const idx = url.indexOf("/attachments/");
    if (idx >= 0) {
      const path = url.substring(idx + "/attachments/".length);
      await supabase.storage.from("attachments").remove([path]);
    }
  }

  const { error } = await supabase.from("note_attachments").delete().eq("id", attachmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
