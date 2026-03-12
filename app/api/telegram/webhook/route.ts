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
          `<code>/link director</code>\n\n` +
          `Қолжетімді логиндер:\n` +
          `director, deputy1, deputy2, primary, edu1, edu2, methodist, profile, gifted, social`
      );
      return NextResponse.json({ ok: true });
    }

    // /link <login> — bind chat_id to user
    if (text.startsWith("/link")) {
      const login = text.replace("/link", "").trim().toLowerCase();

      if (!login) {
        await sendMessage(chatId, "❌ Логинді көрсетіңіз.\nМысалы: <code>/link director</code>");
        return NextResponse.json({ ok: true });
      }

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
        .select("full_name, role")
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
      `Қолжетімді командалар:\n/start — Бастау\n/link логин — Тіркелу\n/status — Аккаунт тексеру`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ ok: true }); // Always 200 for Telegram
  }
}
