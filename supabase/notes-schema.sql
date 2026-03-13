-- ============================================================
-- EDU CONTROL — Notes & Comments Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Notes table (personal notes for each user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  color       TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('red', 'blue', 'yellow', 'green', 'purple')),
  pinned      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at for notes
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes" ON public.notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own notes" ON public.notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (true);

-- ============================================================
-- Note attachments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.note_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id     UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_type   TEXT,
  file_size   INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All can read note attachments" ON public.note_attachments
  FOR SELECT USING (true);

CREATE POLICY "All can insert note attachments" ON public.note_attachments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can delete note attachments" ON public.note_attachments
  FOR DELETE USING (true);

-- ============================================================
-- Task comments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All can read task comments" ON public.task_comments
  FOR SELECT USING (true);

CREATE POLICY "All can insert task comments" ON public.task_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can delete task comments" ON public.task_comments
  FOR DELETE USING (true);

-- ============================================================
-- Storage bucket for note attachments
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Anyone can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Anyone can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'attachments');
