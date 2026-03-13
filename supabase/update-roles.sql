-- ============================================================
-- Update roles to match official staff positions
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop old constraint first (allows updating roles)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Update roles for existing users
UPDATE public.users SET role = 'Оқу-тәрбие ісі жөніндегі директор орынбасары 1' WHERE email = 'bisenova@school.kz';
UPDATE public.users SET role = 'Оқу-тәрбие ісі жөніндегі директор орынбасары 2' WHERE email = 'aimagambetova@school.kz';
UPDATE public.users SET role = 'Оқу-тәрбие ісі жөніндегі директор орынбасары 3' WHERE email = 'mailyk@school.kz';
UPDATE public.users SET role = 'Оқу-тәрбие ісі жөніндегі директор орынбасары 4' WHERE email = 'ismagambetova@school.kz';
UPDATE public.users SET role = 'Бейіндік ісі жөніндегі директор орынбасары 1' WHERE email = 'dosmagambetova@school.kz';
UPDATE public.users SET role = 'Бейіндік ісі жөніндегі директор орынбасары 2' WHERE email = 'abdikalykova@school.kz';
UPDATE public.users SET role = 'Дарынды балалармен жұмыс үйлестіруші' WHERE email = 'zhumaganbetov@school.kz';

-- 3. Add new constraint with updated roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN (
  'Директор',
  'Оқу-тәрбие ісі жөніндегі директор орынбасары 1',
  'Оқу-тәрбие ісі жөніндегі директор орынбасары 2',
  'Оқу-тәрбие ісі жөніндегі директор орынбасары 3',
  'Оқу-тәрбие ісі жөніндегі директор орынбасары 4',
  'Тәрбие ісі жөніндегі директор орынбасары 1',
  'Тәрбие ісі жөніндегі директор орынбасары 2',
  'Бейіндік ісі жөніндегі директор орынбасары 1',
  'Бейіндік ісі жөніндегі директор орынбасары 2',
  'Дарынды балалармен жұмыс үйлестіруші',
  'Әлеуметтік педагог',
  'Психолог'
));
