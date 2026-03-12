import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface NotifyPayload {
  chat_id: string;
  task_title: string;
  deadline: string;
  days_left: number;
  assignee_name: string;
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram API error:", err);
  }
  return res.json();
}

function buildMessage(payload: NotifyPayload): string {
  const { task_title, deadline, days_left, assignee_name } = payload;

  if (days_left < 0) {
    return (
      `🔴 <b>КЕШІККЕН ТАПСЫРМА!</b>\n\n` +
      `👤 ${assignee_name}\n` +
      `📋 ${task_title}\n` +
      `📅 Мерзімі: ${deadline}\n` +
      `⚠️ Тапсырма ${Math.abs(days_left)} күнге кешікті!`
    );
  } else if (days_left === 0) {
    return (
      `🟠 <b>Бүгін мерзімі аяқталады!</b>\n\n` +
      `👤 ${assignee_name}\n` +
      `📋 ${task_title}\n` +
      `📅 Мерзімі: ${deadline}\n` +
      `⏰ Тапсырманы бүгін орындау керек!`
    );
  } else if (days_left <= 3) {
    return (
      `🟡 <b>Мерзімі жақындап қалды!</b>\n\n` +
      `👤 ${assignee_name}\n` +
      `📋 ${task_title}\n` +
      `📅 Мерзімі: ${deadline}\n` +
      `⏳ Тек ${days_left} күн қалды!`
    );
  }

  return (
    `📌 <b>Тапсырма туралы еске салу</b>\n\n` +
    `👤 ${assignee_name}\n` +
    `📋 ${task_title}\n` +
    `📅 Мерзімі: ${deadline}\n` +
    `✅ ${days_left} күн қалды`
  );
}

export async function POST(req: NextRequest) {
  try {
    const payload: NotifyPayload = await req.json();

    if (!payload.chat_id || !payload.task_title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = buildMessage(payload);
    await sendTelegramMessage(payload.chat_id, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Batch notification endpoint for cron jobs
export async function PUT(req: NextRequest) {
  try {
    const { tasks } = await req.json() as { tasks: NotifyPayload[] };

    const results = await Promise.allSettled(
      tasks.map(async (payload) => {
        const message = buildMessage(payload);
        return sendTelegramMessage(payload.chat_id, message);
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent: successful, total: tasks.length });
  } catch (error) {
    console.error("Batch notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
