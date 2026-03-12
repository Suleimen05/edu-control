import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/weekly-events
export async function GET() {
  const { data, error } = await supabase
    .from("weekly_events")
    .select("*")
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/weekly-events
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error, data } = await supabase
    .from("weekly_events")
    .insert({
      day: body.day,
      title: body.title,
      time: body.time || null,
      responsible: body.responsible || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
