import { type ClassValue, clsx } from "clsx";
import { format, parseISO, differenceInDays } from "date-fns";
import { kk } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd.MM.yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateKaz(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy", { locale: kk });
  } catch {
    return dateStr;
  }
}

export function daysUntilDeadline(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  return differenceInDays(deadlineDate, today);
}

export function deadlineLabel(deadline: string): string {
  const days = daysUntilDeadline(deadline);
  if (days < 0) return `${Math.abs(days)} күн кешікті`;
  if (days === 0) return "Бүгін мерзімі аяқталады";
  if (days === 1) return "Ертең мерзімі аяқталады";
  return `${days} күн қалды`;
}
