// ============================================================
// Weekly events — initial seed data (used for DB seeding only)
// ============================================================
import { WeeklyEvent } from "./types";

export const SEED_WEEKLY_EVENTS: WeeklyEvent[] = [
  {
    id: "we-1",
    day: "Дүйсенбі",
    title: "Директор жиналысы",
    time: "08:00",
    responsible: "Директор",
  },
  {
    id: "we-2",
    day: "Дүйсенбі",
    title: "Ту жиналысы",
    time: "08:30",
    responsible: "Тәрбие жөніндегі директор орынбасары 1",
  },
  {
    id: "we-3",
    day: "Сейсенбі",
    title: "Оқу комиссиясы",
    time: "14:00",
    responsible: "Оқу ісі жөніндегі директор орынбасары 1",
  },
  {
    id: "we-4",
    day: "Сәрсенбі",
    title: "Әдістемелік кеңес",
    time: "15:00",
    responsible: "Әдіскер",
  },
  {
    id: "we-5",
    day: "Бейсенбі",
    title: "Бастауыш мектеп жиналысы",
    time: "14:00",
    responsible: "Бастауыш сынып жөніндегі директор орынбасары",
  },
  {
    id: "we-6",
    day: "Жұма",
    title: "Апта қорытындысы",
    time: "15:30",
    responsible: "Директор",
  },
  {
    id: "we-7",
    day: "Жұма",
    title: "Ата-аналар кеңесі",
    time: "17:00",
    responsible: "Тәрбие жөніндегі директор орынбасары 2",
  },
];
