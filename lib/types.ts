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
  { login: "director",  password: "admin123",   email: "director@school.kz" },
  { login: "deputy1",   password: "dep1pass",   email: "deputy1@school.kz" },
  { login: "deputy2",   password: "dep2pass",   email: "deputy2@school.kz" },
  { login: "primary",   password: "primpass",   email: "primary@school.kz" },
  { login: "edu1",      password: "edu1pass",   email: "edu1@school.kz" },
  { login: "edu2",      password: "edu2pass",   email: "edu2@school.kz" },
  { login: "methodist", password: "methpass",   email: "methodist@school.kz" },
  { login: "profile",   password: "profpass",   email: "profile@school.kz" },
  { login: "gifted",    password: "giftpass",   email: "gifted@school.kz" },
  { login: "social",    password: "socpass",    email: "social@school.kz" },
];
