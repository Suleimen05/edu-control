-- Sample tasks using real user UUIDs from your Supabase project
-- Director (created_by): 40a95382-f1c7-4179-92b2-e999c6bd8285

INSERT INTO public.tasks (title, description, assignee_id, deadline, priority, status, weekly_plan, created_by) VALUES

('Мұғалімдер жиналысын өткізу',
 'Апта сайынғы педагогикалық кеңес',
 '6b055d56-3a21-49d3-b360-89481cb42558',
 CURRENT_DATE - INTERVAL '2 days',
 'Жоғары', 'Кешікті', true,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Сабақ кестесін жаңарту',
 '2-тоқсан кестесін бекіту',
 'cf01a8f0-4e76-40fc-980f-1094de58e6ce',
 CURRENT_DATE + INTERVAL '1 day',
 'Жоғары', 'Процесте', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Бастауыш сынып олимпиадасын ұйымдастыру',
 '1-4 сыныптар арасында олимпиада',
 'e46ccfe8-dfd7-4d0c-b9c3-8f745f61a63b',
 CURRENT_DATE + INTERVAL '5 days',
 'Орташа', 'Процесте', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Тәрбие жоспарын тапсыру',
 'Ай сайынғы тәрбие жоспары',
 '7114583f-e501-41a4-bded-fd0f92a40b86',
 CURRENT_DATE + INTERVAL '10 days',
 'Орташа', 'Орындалды', true,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Мектеп газетін шығару',
 NULL,
 '953871c7-e150-4c02-99f0-58f3f2727166',
 CURRENT_DATE + INTERVAL '2 days',
 'Төмен', 'Процесте', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Әдістемелік кеңес есебі',
 NULL,
 '0fe1b3bb-f53c-4040-be29-73844a513fea',
 CURRENT_DATE + INTERVAL '7 days',
 'Орташа', 'Орындалды', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Бейінді сынып тізімін жаңарту',
 NULL,
 'dc4bc038-2c7c-4a09-900e-183cef185a4f',
 CURRENT_DATE + INTERVAL '3 days',
 'Жоғары', 'Процесте', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Дарынды оқушылар конкурсына қатысу',
 NULL,
 'adb9cdcd-d589-47ab-b179-7d2e5414e5a4',
 CURRENT_DATE + INTERVAL '14 days',
 'Жоғары', 'Процесте', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('Әлеуметтік паспорт жаңарту',
 NULL,
 '14b8545e-e6d7-4a72-9025-5e64f992ddcf',
 CURRENT_DATE - INTERVAL '1 day',
 'Жоғары', 'Кешікті', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285'),

('ҰБТ дайындық есебі',
 NULL,
 '6b055d56-3a21-49d3-b360-89481cb42558',
 CURRENT_DATE + INTERVAL '20 days',
 'Жоғары', 'Орындалды', false,
 '40a95382-f1c7-4179-92b2-e999c6bd8285');
