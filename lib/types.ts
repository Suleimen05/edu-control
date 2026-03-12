// ============================================================
// EDU CONTROL — TypeScript Types
// ============================================================

export type Priority = "Жоғары" | "Орташа" | "Төмен";
export type TaskStatus = "Орындалды" | "Процесте" | "Кешікті";

export type Role =
  | "Директор"
  | "Оқу ісі жөніндегі директор орынбасары 1"
  | "Оқу ісі жөніндегі директор орынбасары 2"
  | "Бастауыш сынып жөніндегі директор орынбасары"
  | "Тәрбие ісі жөніндегі директор орынбасары 1"
  | "Тәрбие ісі жөніндегі директор орынбасары 2"
  | "Әдіскер"
  | "Бейінді оқыту жөніндегі директор орынбасары"
  | "Дарынды балалар маманы"
  | "Әлеуметтік педагог";

export const ALL_ROLES: Role[] = [
  "Директор",
  "Оқу ісі жөніндегі директор орынбасары 1",
  "Оқу ісі жөніндегі директор орынбасары 2",
  "Бастауыш сынып жөніндегі директор орынбасары",
  "Тәрбие ісі жөніндегі директор орынбасары 1",
  "Тәрбие ісі жөніндегі директор орынбасары 2",
  "Әдіскер",
  "Бейінді оқыту жөніндегі директор орынбасары",
  "Дарынды балалар маманы",
  "Әлеуметтік педагог",
];

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_admin: boolean;
  telegram_chat_id?: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id: string;
  assignee?: User;
  assignees?: User[];
  deadline: string; // ISO date string
  priority: Priority;
  status: TaskStatus;
  weekly_plan: boolean;
  file_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyEvent {
  id: string;
  day: WeekDay;
  title: string;
  time?: string;
  responsible?: string;
}

export type WeekDay =
  | "Дүйсенбі"
  | "Сейсенбі"
  | "Сәрсенбі"
  | "Бейсенбі"
  | "Жұма";

export interface AnalyticsData {
  user: User;
  total: number;
  completed: number;
  overdue: number;
  in_progress: number;
  completion_rate: number;
}

// Traffic light logic
export type DeadlineStatus = "red" | "orange" | "green";

export function getDeadlineStatus(
  deadline: string,
  status: TaskStatus
): DeadlineStatus {
  if (status === "Орындалды") return "green";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "red";
  if (diffDays <= 3) return "orange";
  return "green";
}

export const DEADLINE_COLORS: Record<DeadlineStatus, string> = {
  red: "bg-red-100 border-red-400 text-red-800",
  orange: "bg-orange-100 border-orange-400 text-orange-800",
  green: "bg-green-100 border-green-400 text-green-800",
};

export const DEADLINE_BADGE: Record<DeadlineStatus, string> = {
  red: "bg-red-500 text-white",
  orange: "bg-orange-400 text-white",
  green: "bg-green-500 text-white",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  Орындалды: "bg-green-100 text-green-800 border border-green-300",
  Процесте: "bg-blue-100 text-blue-800 border border-blue-300",
  Кешікті: "bg-red-100 text-red-800 border border-red-300",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Жоғары: "bg-red-100 text-red-700",
  Орташа: "bg-yellow-100 text-yellow-700",
  Төмен: "bg-gray-100 text-gray-600",
};

// ============================================================
// Credentials (login/password for each role)
// ============================================================
export interface Credentials {
  login: string;
  password: string;
  email: string; // maps to user.email in DB
}

export const USER_CREDENTIALS: Credentials[] = [
  { login: "aben",            password: "Edu@dir2026",   email: "aben@school.kz" },
  { login: "bisenova",        password: "Bisen@oku1",    email: "bisenova@school.kz" },
  { login: "aimagambetova",   password: "Aimag@oku2",    email: "aimagambetova@school.kz" },
  { login: "ismagambetova",   password: "Ismag@bast",    email: "ismagambetova@school.kz" },
  { login: "mailyk",          password: "Mailyk@adis",   email: "mailyk@school.kz" },
  { login: "gabbasova",       password: "Gabbas@tarb1",  email: "gabbasova@school.kz" },
  { login: "konisbaeva",      password: "Konis@tarb2",   email: "konisbaeva@school.kz" },
  { login: "dosmagambetova",  password: "Dosmag@bein",   email: "dosmagambetova@school.kz" },
  { login: "abdikalykova",    password: "Abdik@daryn",   email: "abdikalykova@school.kz" },
  { login: "social",          password: "Social@ped1",   email: "social@school.kz" },
];
