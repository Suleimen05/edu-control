import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side only — service_role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegram(chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("Telegram send error:", e);
  }
}

// GET /api/tasks — fetch all tasks with assignees
export async function GET() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, task_assignees(user:users(id, full_name, role, email, telegram_chat_id))")
    .order("deadline", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform: flatten task_assignees into assignees array
  const transformed = (data || []).map((task) => {
    const assignees = (task.task_assignees || [])
      .map((ta: { user: unknown }) => ta.user)
      .filter(Boolean);
    return {
      ...task,
      assignees,
      assignee: assignees[0] || null,
      task_assignees: undefined,
    };
  });

  return NextResponse.json(transformed);
}

// POST /api/tasks — create task with multiple assignees
export async function POST(req: NextRequest) {
  const body = await req.json();
  const assigneeIds: string[] = body.assignee_ids || (body.assignee_id ? [body.assignee_id] : []);

  if (assigneeIds.length === 0) {
    return NextResponse.json({ error: "At least one assignee required" }, { status: 400 });
  }

  // 1. Insert task (assignee_id = first assignee for backward compat)
  const { error: taskError, data: newTask } = await supabase
    .from("tasks")
    .insert({
      title: body.title,
      description: body.description || null,
      assignee_id: assigneeIds[0],
      deadline: body.deadline,
      priority: body.priority,
      status: body.status ?? "Процесте",
      weekly_plan: body.weekly_plan ?? false,
      created_by: body.created_by,
    })
    .select()
    .single();

  if (taskError) return NextResponse.json({ error: taskError.message }, { status: 500 });

  // 2. Insert junction rows for all assignees
  const junctionRows = assigneeIds.map((uid) => ({
    task_id: newTask.id,
    user_id: uid,
  }));
  await supabase.from("task_assignees").insert(junctionRows);

  // 3. Fetch full task with assignees
  const { data: fullTask } = await supabase
    .from("tasks")
    .select("*, task_assignees(user:users(id, full_name, role, email, telegram_chat_id))")
    .eq("id", newTask.id)
    .single();

  const assignees = (fullTask?.task_assignees || [])
    .map((ta: { user: unknown }) => ta.user)
    .filter(Boolean);

  const result = {
    ...fullTask,
    assignees,
    assignee: assignees[0] || null,
    task_assignees: undefined,
  };

  // 4. Send Telegram notifications ONLY to selected assignees
  // Fetch users directly by their IDs to avoid any junction table issues
  const { data: notifyUsers } = await supabase
    .from("users")
    .select("id, full_name, telegram_chat_id")
    .in("id", assigneeIds);

  console.log("[NOTIFY] Task created:", body.title, "assigneeIds:", assigneeIds, "notifyUsers:", notifyUsers?.map((u) => ({ id: u.id, name: u.full_name, tg: !!u.telegram_chat_id })));

  if (notifyUsers) {
    // Build assignee names list
    const allNames = notifyUsers.map((u) => u.full_name).join(", ");

    for (const u of notifyUsers) {
      if (u.telegram_chat_id) {
        const msg =
          `📋 <b>Жаңа тапсырма!</b>\n\n` +
          `📌 ${body.title}\n` +
          (body.description ? `📝 ${body.description}\n` : "") +
          `📅 Мерзімі: ${body.deadline}\n` +
          `⚡ Маңыздылығы: ${body.priority}\n` +
          `👥 Жауаптылар: ${allNames}\n\n` +
          `Тапсырманы орындаңыз.`;
        await sendTelegram(u.telegram_chat_id, msg);
      }
    }
  }

  return NextResponse.json(result, { status: 201 });
}
