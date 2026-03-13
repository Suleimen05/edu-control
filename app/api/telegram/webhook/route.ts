import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// Telegram sends updates to this webhook
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    // /start command — show instructions
    if (text === "/start") {
      await sendMessage(
        chatId,
        `🎓 <b>EDU CONTROL бот</b>\n\n` +
          `Тапсырмалар бойынша хабарландыру алу үшін өзіңізді тіркеңіз.\n\n` +
          `Логиніңізді жіберіңіз, мысалы:\n` +
          `<code>/link bisenova</code>\n\n` +
          `Қолжетімді логиндер:\n` +
          `aben, bisenova, aimagambetova, ismagambetova, mailyk, gabbasova, konisbaeva, dosmagambetova, abdikalykova, social`
      );
      return NextResponse.json({ ok: true });
    }

    // /unlink — unbind chat_id from current user
    if (text === "/unlink") {
      const { data: linked } = await supabase
        .from("users")
        .select("full_name")
        .eq("telegram_chat_id", String(chatId))
        .single();

      if (!linked) {
        await sendMessage(chatId, "❌ Аккаунт байланыстырылмаған.");
        return NextResponse.json({ ok: true });
      }

      await supabase
        .from("users")
        .update({ telegram_chat_id: null })
        .eq("telegram_chat_id", String(chatId));

      await sendMessage(
        chatId,
        `✅ <b>${linked.full_name}</b> аккаунтынан шықтыңыз.\n\nБасқа аккаунтқа кіру үшін:\n<code>/link логин</code>`
      );
      return NextResponse.json({ ok: true });
    }

    // /link <login> — bind chat_id to user
    if (text.startsWith("/link")) {
      const login = text.replace("/link", "").trim().toLowerCase();

      if (!login) {
        await sendMessage(chatId, "❌ Логинді көрсетіңіз.\nМысалы: <code>/link bisenova</code>");
        return NextResponse.json({ ok: true });
      }

      // First, unlink this chat_id from any previous user
      await supabase
        .from("users")
        .update({ telegram_chat_id: null })
        .eq("telegram_chat_id", String(chatId));

      // Map login to email
      const emailMap: Record<string, string> = {
        aben: "aben@school.kz",
        bisenova: "bisenova@school.kz",
        aimagambetova: "aimagambetova@school.kz",
        ismagambetova: "ismagambetova@school.kz",
        mailyk: "mailyk@school.kz",
        gabbasova: "gabbasova@school.kz",
        konisbaeva: "konisbaeva@school.kz",
        dosmagambetova: "dosmagambetova@school.kz",
        abdikalykova: "abdikalykova@school.kz",
        social: "social@school.kz",
      };

      const email = emailMap[login];
      if (!email) {
        await sendMessage(chatId, `❌ <b>${login}</b> деген логин табылмады.`);
        return NextResponse.json({ ok: true });
      }

      // Update user's telegram_chat_id in DB
      const { data, error } = await supabase
        .from("users")
        .update({ telegram_chat_id: String(chatId) })
        .eq("email", email)
        .select("id, full_name, role")
        .single();

      if (error || !data) {
        await sendMessage(chatId, "❌ Қате орын алды. Қайталап көріңіз.");
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `✅ <b>Сәтті тіркелдіңіз!</b>\n\n` +
          `👤 ${data.full_name}\n` +
          `💼 ${data.role}\n\n` +
          `Енді тапсырмалар бойынша хабарландыру аласыз.`
      );

      // Send existing incomplete tasks to newly linked user
      const { data: existingTasks } = await supabase
        .from("task_assignees")
        .select("task:tasks(id, title, deadline, priority, status)")
        .eq("user_id", data.id);

      const pendingTasks = (existingTasks || [])
        .map((ta: { task: unknown }) => ta.task as { title: string; deadline: string; priority: string; status: string } | null)
        .filter((t): t is { title: string; deadline: string; priority: string; status: string } =>
          t !== null && t.status !== "Орындалды"
        );

      if (pendingTasks.length > 0) {
        let msg = `📋 <b>Сіздің ағымдағы тапсырмаларыңыз (${pendingTasks.length}):</b>\n\n`;
        for (const t of pendingTasks) {
          const deadlineDate = new Date(t.deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          deadlineDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          let icon = "🟢";
          if (diffDays < 0) icon = "🔴";
          else if (diffDays <= 3) icon = "🟡";

          msg += `${icon} <b>${t.title}</b>\n`;
          msg += `   📅 ${t.deadline}`;
          if (diffDays < 0) msg += ` (мерзімі ${Math.abs(diffDays)} күн өтті!)`;
          else if (diffDays === 0) msg += ` (бүгін!)`;
          else msg += ` (${diffDays} күн қалды)`;
          msg += `\n   ⚡ ${t.priority}\n\n`;
        }
        await sendMessage(chatId, msg);
      }

      return NextResponse.json({ ok: true });
    }

    // /status — check linked account
    if (text === "/status") {
      const { data } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("telegram_chat_id", String(chatId))
        .single();

      if (data) {
        await sendMessage(chatId, `👤 ${data.full_name}\n💼 ${data.role}\n\n✅ Аккаунт байланыстырылған.`);
      } else {
        await sendMessage(chatId, `❌ Аккаунт байланыстырылмаған.\n/link логин арқылы тіркеліңіз.`);
      }
      return NextResponse.json({ ok: true });
    }

    // Unknown command
    await sendMessage(
      chatId,
      `Қолжетімді командалар:\n/start — Бастау\n/link логин — Тіркелу\n/unlink — Аккаунттан шығу\n/status — Аккаунт тексеру`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ ok: true }); // Always 200 for Telegram
  }
}
