// Run: node scripts/setup-db.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wsunacdljukmojejsffi.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdW5hY2RsanVrbW9qZWpzZmZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMjU4NCwiZXhwIjoyMDg4ODg4NTg0fQ.qgtMkZ_hhNEOEEub6c5DYNzWJ4lhXWHoJP-0EluwQQk";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Real user UUIDs from Supabase
const DIRECTOR  = "40a95382-f1c7-4179-92b2-e999c6bd8285";
const DEPUTY1   = "6b055d56-3a21-49d3-b360-89481cb42558"; // Гүлнар
const DEPUTY2   = "cf01a8f0-4e76-40fc-980f-1094de58e6ce"; // Серік
const PRIMARY   = "e46ccfe8-dfd7-4d0c-b9c3-8f745f61a63b"; // Дина
const EDU1      = "7114583f-e501-41a4-bded-fd0f92a40b86"; // Азамат
const EDU2      = "953871c7-e150-4c02-99f0-58f3f2727166"; // Маржан
const METHODIST = "0fe1b3bb-f53c-4040-be29-73844a513fea"; // Нұрлан
const PROFILE   = "dc4bc038-2c7c-4a09-900e-183cef185a4f"; // Зейнеп
const GIFTED    = "adb9cdcd-d589-47ab-b179-7d2e5414e5a4"; // Бауыржан
const SOCIAL    = "14b8545e-e6d7-4a72-9025-5e64f992ddcf"; // Алия

const tasks = [
  {
    title: "Мұғалімдер жиналысын өткізу",
    description: "Апта сайынғы педагогикалық кеңес",
    assignee_id: DEPUTY1,
    deadline: addDays(-2),
    priority: "Жоғары",
    status: "Кешікті",
    weekly_plan: true,
    created_by: DIRECTOR,
  },
  {
    title: "Сабақ кестесін жаңарту",
    description: "2-тоқсан кестесін бекіту",
    assignee_id: DEPUTY2,
    deadline: addDays(1),
    priority: "Жоғары",
    status: "Процесте",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Бастауыш сынып олимпиадасын ұйымдастыру",
    description: "1-4 сыныптар арасында олимпиада",
    assignee_id: PRIMARY,
    deadline: addDays(5),
    priority: "Орташа",
    status: "Процесте",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Тәрбие жоспарын тапсыру",
    description: "Ай сайынғы тәрбие жоспары",
    assignee_id: EDU1,
    deadline: addDays(10),
    priority: "Орташа",
    status: "Орындалды",
    weekly_plan: true,
    created_by: DIRECTOR,
  },
  {
    title: "Мектеп газетін шығару",
    assignee_id: EDU2,
    deadline: addDays(2),
    priority: "Төмен",
    status: "Процесте",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Әдістемелік кеңес есебі",
    assignee_id: METHODIST,
    deadline: addDays(7),
    priority: "Орташа",
    status: "Орындалды",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Бейінді сынып тізімін жаңарту",
    assignee_id: PROFILE,
    deadline: addDays(3),
    priority: "Жоғары",
    status: "Процесте",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Дарынды оқушылар конкурсына қатысу",
    assignee_id: GIFTED,
    deadline: addDays(14),
    priority: "Жоғары",
    status: "Процесте",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "Әлеуметтік паспорт жаңарту",
    assignee_id: SOCIAL,
    deadline: addDays(-1),
    priority: "Жоғары",
    status: "Кешікті",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
  {
    title: "ҰБТ дайындық есебі",
    assignee_id: DEPUTY1,
    deadline: addDays(20),
    priority: "Жоғары",
    status: "Орындалды",
    weekly_plan: false,
    created_by: DIRECTOR,
  },
];

async function main() {
  console.log("🚀 Setting up EDU CONTROL database...\n");

  // 1. Check existing tasks
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log(`⚠️  Tasks table already has ${count} rows. Skipping seed.`);
    console.log("   Delete existing tasks first if you want to re-seed.\n");
  } else {
    // 2. Insert seed tasks
    console.log("📋 Inserting sample tasks...");
    const { error } = await supabase.from("tasks").insert(tasks);
    if (error) {
      console.error("❌ Error inserting tasks:", error.message);
      process.exit(1);
    }
    console.log(`✅ Inserted ${tasks.length} tasks successfully!\n`);
  }

  // 3. Insert weekly events
  const { count: evCount } = await supabase
    .from("weekly_events")
    .select("*", { count: "exact", head: true });

  if (evCount && evCount > 0) {
    console.log(`⚠️  Weekly events already exist (${evCount} rows). Skipping.\n`);
  } else {
    console.log("📅 Inserting weekly events...");
    const weeklyEvents = [
      { day: "Дүйсенбі", title: "Директор жиналысы", time: "08:00", responsible: "Директор" },
      { day: "Дүйсенбі", title: "Ту жиналысы", time: "08:30", responsible: "Тәрбие ісі жөніндегі директор орынбасары 1" },
      { day: "Сейсенбі", title: "Оқу комиссиясы", time: "14:00", responsible: "Оқу ісі жөніндегі директор орынбасары 1" },
      { day: "Сәрсенбі", title: "Әдістемелік кеңес", time: "15:00", responsible: "Әдіскер" },
      { day: "Бейсенбі", title: "Бастауыш мектеп жиналысы", time: "14:00", responsible: "Бастауыш сынып жөніндегі директор орынбасары" },
      { day: "Жұма", title: "Апта қорытындысы", time: "15:30", responsible: "Директор" },
      { day: "Жұма", title: "Ата-аналар кеңесі", time: "17:00", responsible: "Тәрбие ісі жөніндегі директор орынбасары 2" },
    ];
    const { error } = await supabase.from("weekly_events").insert(weeklyEvents);
    if (error) {
      console.error("❌ Error inserting weekly events:", error.message);
    } else {
      console.log(`✅ Inserted ${weeklyEvents.length} weekly events!\n`);
    }
  }

  // 4. Verify
  const { data: verifyTasks } = await supabase.from("tasks").select("id, title, status");
  console.log("📊 Database summary:");
  console.log(`   Tasks: ${verifyTasks?.length ?? 0}`);
  verifyTasks?.forEach((t, i) => console.log(`   ${i + 1}. [${t.status}] ${t.title}`));

  console.log("\n🎉 Done! Run 'npm run dev' to start the app.");
}

main().catch(console.error);
