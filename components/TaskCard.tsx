"use client";

import { Task, getDeadlineStatus, DEADLINE_COLORS, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/types";
import { formatDate, deadlineLabel } from "@/lib/utils";
import { Calendar, User, Flag, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: Task["status"]) => void;
  isAdmin?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, onStatusChange, isAdmin, compact }: TaskCardProps) {
  const trafficLight = getDeadlineStatus(task.deadline, task.status);
  const colorClass = DEADLINE_COLORS[trafficLight];

  const trafficDot: Record<typeof trafficLight, string> = {
    red: "bg-red-500",
    orange: "bg-orange-400",
    green: "bg-green-500",
  };

  if (compact) {
    return (
      <div className={cn("rounded-lg border-l-4 p-3 flex items-center justify-between gap-3", colorClass)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", trafficDot[trafficLight])} />
          <span className="font-medium text-sm truncate">{task.title}</span>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full shrink-0", STATUS_COLORS[task.status])}>
          {task.status}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border-l-4 p-4 shadow-sm bg-white", colorClass)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("w-3 h-3 rounded-full shrink-0 mt-0.5", trafficDot[trafficLight])} />
          <h3 className="font-semibold text-gray-900 leading-snug">{task.title}</h3>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium shrink-0", PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 pl-5">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pl-5 mb-3">
        <span className="flex items-center gap-1">
          <User size={12} />
          {task.assignee?.full_name ?? "—"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(task.deadline)}
        </span>
        <span className="font-medium">{deadlineLabel(task.deadline)}</span>
        {task.file_url && (
          <span className="flex items-center gap-1 text-blue-600">
            <Paperclip size={12} />
            Файл тіркелген
          </span>
        )}
      </div>

      {/* Status + Actions */}
      <div className="flex items-center justify-between pl-5">
        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", STATUS_COLORS[task.status])}>
          {task.status}
        </span>

        {onStatusChange && task.status !== "Орындалды" && (
          <div className="flex gap-2">
            {task.status === "Кешікті" || task.status === "Процесте" ? (
              <button
                onClick={() => onStatusChange(task.id, "Процесте")}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Процесте
              </button>
            ) : null}
            {isAdmin && (
              <button
                onClick={() => onStatusChange(task.id, "Орындалды")}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Орындалды ✓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
