"use client";

import { useApp } from "@/context/AppContext";
import { WEEKLY_EVENTS } from "@/lib/mock-data";
import { WeekDay } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS: WeekDay[] = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма"];

const DAY_COLORS = [
  "border-blue-400 bg-blue-50",
  "border-purple-400 bg-purple-50",
  "border-green-400 bg-green-50",
  "border-orange-400 bg-orange-50",
  "border-pink-400 bg-pink-50",
];

const DAY_HEADER_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-green-600",
  "bg-orange-500",
  "bg-pink-600",
];

export default function WeeklyPlanPage() {
  const { tasks, isAdmin, currentUser, updateTask } = useApp();

  const weeklyTasks = tasks.filter((t) => t.weekly_plan);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays size={24} className="text-blue-600" />
          Апталық жоспар
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Аптаның негізгі іс-шаралары мен тапсырмалары
        </p>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS.map((day, idx) => {
          const dayEvents = WEEKLY_EVENTS.filter((e) => e.day === day);

          return (
            <div
              key={day}
              className={cn(
                "rounded-xl border-2 overflow-hidden shadow-sm",
                DAY_COLORS[idx]
              )}
            >
              {/* Day Header */}
              <div className={cn("px-3 py-2.5 text-white font-bold text-sm", DAY_HEADER_COLORS[idx])}>
                {day}
              </div>

              {/* Events */}
              <div className="p-3 space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg p-2.5 shadow-sm border border-white/60"
                  >
                    <div className="font-semibold text-gray-800 text-xs leading-snug">
                      {event.title}
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <Clock size={10} />
                        <span className="text-xs">{event.time}</span>
                      </div>
                    )}
                    {event.responsible && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {event.responsible}
                      </div>
                    )}
                  </div>
                ))}

                {dayEvents.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Іс-шара жоқ
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Tasks */}
      {weeklyTasks.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-600 rounded-full" />
            Апталық тапсырмалар
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyTasks
              .filter((t) =>
                isAdmin ? true : t.assignee_id === currentUser?.id
              )
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onStatusChange={(id, status) => updateTask(id, { status })}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
