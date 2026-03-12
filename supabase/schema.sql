-- ============================================================
-- EDU CONTROL — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users table (extended profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN (
    'Директор',
    'Оқу ісі жөніндегі директор орынбасары 1',
    'Оқу ісі жөніндегі директор орынбасары 2',
    'Бастауыш сынып жөніндегі директор орынбасары',
    'Тәрбие ісі жөніндегі директор орынбасары 1',
    'Тәрбие ісі жөніндегі директор орынбасары 2',
    'Әдіскер',
    'Бейінді оқыту жөніндегі директор орынбасары',
    'Дарынды балалар маманы',
    'Әлеуметтік педагог'
  )),
  is_admin            BOOLEAN DEFAULT FALSE,
  telegram_chat_id    TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Tasks table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  assignee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deadline    DATE NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'Орташа' CHECK (priority IN ('Жоғары', 'Орташа', 'Төмен')),
  status      TEXT NOT NULL DEFAULT 'Процесте' CHECK (status IN ('Орындалды', 'Процесте', 'Кешікті')),
  weekly_plan BOOLEAN DEFAULT FALSE,
  file_url    TEXT,
  created_by  UUID NOT NULL REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-mark overdue tasks (run via pg_cron or Supabase scheduled functions)
-- UPDATE public.tasks SET status = 'Кешікті'
-- WHERE deadline < CURRENT_DATE AND status != 'Орындалды';

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users: everyone can read
CREATE POLICY "Users are viewable by all" ON public.users
  FOR SELECT USING (true);

-- Tasks: admins see all, others see only their own
CREATE POLICY "Admins see all tasks" ON public.tasks
  FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Users see own tasks" ON public.tasks
  FOR SELECT
  USING (assignee_id = auth.uid());

-- Tasks: only admins can insert
CREATE POLICY "Admins can create tasks" ON public.tasks
  FOR INSERT
  WITH CHECK (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
  );

-- Tasks: admins can update all; users can update status of their own tasks
CREATE POLICY "Admins can update all tasks" ON public.tasks
  FOR UPDATE
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Users can update their task status" ON public.tasks
  FOR UPDATE
  USING (assignee_id = auth.uid());

-- ============================================================
-- Weekly events table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day         TEXT NOT NULL CHECK (day IN ('Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма')),
  title       TEXT NOT NULL,
  time        TEXT,
  responsible TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All can read weekly events" ON public.weekly_events
  FOR SELECT USING (true);

-- ============================================================
-- Sample Data (10 users)
-- ============================================================
INSERT INTO public.users (email, full_name, role, is_admin) VALUES
  ('director@school.kz', 'Айбек Сейткали', 'Директор', TRUE),
  ('deputy1@school.kz', 'Гүлнар Жақсыбекова', 'Оқу ісі жөніндегі директор орынбасары 1', FALSE),
  ('deputy2@school.kz', 'Серік Мұқанов', 'Оқу ісі жөніндегі директор орынбасары 2', FALSE),
  ('primary@school.kz', 'Дина Есенова', 'Бастауыш сынып жөніндегі директор орынбасары', FALSE),
  ('edu1@school.kz', 'Азамат Қалиев', 'Тәрбие ісі жөніндегі директор орынбасары 1', FALSE),
  ('edu2@school.kz', 'Маржан Өмірбекова', 'Тәрбие ісі жөніндегі директор орынбасары 2', FALSE),
  ('methodist@school.kz', 'Нұрлан Дүйсенов', 'Әдіскер', FALSE),
  ('profile@school.kz', 'Зейнеп Ахметова', 'Бейінді оқыту жөніндегі директор орынбасары', FALSE),
  ('gifted@school.kz', 'Бауыржан Сейтқали', 'Дарынды балалар маманы', FALSE),
  ('social@school.kz', 'Алия Нұрмағамбетова', 'Әлеуметтік педагог', FALSE)
ON CONFLICT DO NOTHING;
