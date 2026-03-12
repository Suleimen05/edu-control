// Run this AFTER deploying to Vercel:
// node scripts/setup-telegram-webhook.js https://your-domain.vercel.app

const BOT_TOKEN = "8664234662:AAF50nFC_yDdnOusstu5Q6u9PBR8XDYKTKA";

const domain = process.argv[2];
if (!domain) {
  console.log("Usage: node scripts/setup-telegram-webhook.js https://your-domain.vercel.app");
  process.exit(1);
}

const webhookUrl = `${domain}/api/telegram/webhook`;

fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl }),
})
  .then((r) => r.json())
  .then((data) => {
    if (data.ok) {
      console.log(`✅ Webhook set: ${webhookUrl}`);
    } else {
      console.error("❌ Error:", data.description);
    }
  });
