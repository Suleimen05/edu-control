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

// This endpoint checks all tasks and sends notifications
// Call it via cron (Vercel Cron, external cron, or manually)
export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sends CRON_SECRET, or manual call with Bearer token
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "edu-control-cron-2024";
  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManual = req.nextUrl.searchParams.get("secret") === cronSecret;
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all incomplete tasks with assigned users who have telegram_chat_id
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`*, assignee:users!tasks_assignee_id_fkey(full_name, telegram_chat_id)`)
      .neq("status", "Орындалды");

    if (error || !tasks) {
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;
    let skipped = 0;

    for (const task of tasks) {
      const assignee = task.assignee as { full_name: string; telegram_chat_id: string | null } | null;
      if (!assignee?.telegram_chat_id) {
        skipped++;
        continue;
      }

      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let message = "";

      // Trigger 1: overdue
      if (diffDays < 0) {
        message =
          `🔴 <b>КЕШІККЕН ТАПСЫРМА!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⚠️ ${Math.abs(diffDays)} күнге кешікті!\n\n` +
          `Тапсырманы тез арада орындаңыз.`;
      }
      // Trigger 2: 1 day left
      else if (diffDays === 1) {
        message =
          `🟠 <b>Ертең мерзімі аяқталады!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⏰ Тек 1 күн қалды!`;
      }
      // Trigger 3: 3 days left
      else if (diffDays === 3) {
        message =
          `🟡 <b>Мерзімі жақындап қалды</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⏳ 3 күн қалды.`;
      }
      // Today is the deadline
      else if (diffDays === 0) {
        message =
          `🔴 <b>БҮГІН МЕРЗІМІ!</b>\n\n` +
          `📋 ${task.title}\n` +
          `📅 Мерзімі: ${task.deadline}\n` +
          `⚠️ Бүгін орындау керек!`;
      }

      if (message) {
        const ok = await sendTelegram(assignee.telegram_chat_id, message);
        if (ok) sent++;
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
