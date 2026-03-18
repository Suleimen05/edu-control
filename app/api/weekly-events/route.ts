import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

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

  // Send Telegram notification to all users with telegram_chat_id
  try {
    const { data: tgUsers } = await supabase
      .from("users")
      .select("telegram_chat_id, full_name")
      .not("telegram_chat_id", "is", null);

    if (tgUsers && tgUsers.length > 0) {
      const timeStr = data.time ? `\n⏰ Уақыты: ${data.time}` : "";
      const responsibleStr = data.responsible ? `\n👤 Жауапты: ${data.responsible}` : "";
      const message =
        `📅 <b>Апталық жоспарға жаңа іс-шара қосылды!</b>\n\n` +
        `📋 ${data.title}\n` +
        `📆 Күні: ${data.day}` +
        timeStr +
        responsibleStr;

      await Promise.allSettled(
        tgUsers.map((u) => sendTelegramMessage(u.telegram_chat_id, message))
      );
    }
  } catch (e) {
    console.error("TG notify error (weekly-event):", e);
  }

  return NextResponse.json(data, { status: 201 });
}
