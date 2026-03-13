-- Add Психолог role to users table constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN (
  'Директор',
  'Оқу ісі жөніндегі директор орынбасары 1',
  'Оқу ісі жөніндегі директор орынбасары 2',
  'Бастауыш сынып жөніндегі директор орынбасары',
  'Тәрбие ісі жөніндегі директор орынбасары 1',
  'Тәрбие ісі жөніндегі директор орынбасары 2',
  'Әдіскер',
  'Бейінді оқыту жөніндегі директор орынбасары',
  'Дарынды балалар маманы',
  'Әлеуметтік педагог',
  'Психолог'
));

-- Add 3 new users
INSERT INTO public.users (email, full_name, role, is_admin) VALUES
  ('zhumaganbetov@school.kz', 'Жұмағанбетов Мақсым Рақұлы', 'Дарынды балалар маманы', FALSE),
  ('zholamanova@school.kz', 'Жоламанова Сәпура Рысқалиқызы', 'Психолог', FALSE),
  ('omirzakova@school.kz', 'Өмірзақова Айжан Еркінқызы', 'Психолог', FALSE)
ON CONFLICT (email) DO NOTHING;
