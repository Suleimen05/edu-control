import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegram(chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.ok;
}

// This endpoint checks all tasks and sends notifications to ALL assignees
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "edu-control-cron-2024";
  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManual = req.nextUrl.searchParams.get("secret") === cronSecret;
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all incomplete tasks with their assignees via junction table
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*, task_assignees(user:users(full_name, telegram_chat_id))")
      .neq("status", "Орындалды");

    if (error || !tasks) {
      return NextResponse.json({ error: "Failed to fetch tasks", details: error?.message }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;
    let skipped = 0;

    for (const task of tasks) {
      const assignees = (task.task_assignees || [])
        .map((ta: { user: { full_name: string; telegram_chat_id: string | null } | null }) => ta.user)
        .filter(Boolean) as { full_name: string; telegram_chat_id: string | null }[];

      if (assignees.length === 0) {
        skipped++;
        continue;
      }

      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let message = "";

      if (diffDays < 0) {
        message =
          `🔴 <b>КЕШІККЕН ТАПСЫРМА!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⚠️ ${Math.abs(diffDays)} күнге кешікті!\n\n` +
          `Тапсырманы тез арада орындаңыз.`;
      } else if (diffDays === 0) {
        message =
          `🔴 <b>БҮГІН МЕРЗІМІ!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⚠️ Бүгін орындау керек!`;
      } else if (diffDays <= 3) {
        message =
          `🟠 <b>Мерзімі жақындап қалды!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⏰ ${diffDays} күн қалды!`;
      } else {
        message =
          `📌 <b>Тапсырма еске салу</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⏳ ${diffDays} күн қалды`;
      }

      // Send to ALL assignees
      for (const assignee of assignees) {
        if (assignee.telegram_chat_id) {
          const ok = await sendTelegram(assignee.telegram_chat_id, message);
          if (ok) sent++;
        } else {
          skipped++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      total_tasks: tasks.length,
      notifications_sent: sent,
      skipped_no_telegram: skipped,
      checked_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Cron notify error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
