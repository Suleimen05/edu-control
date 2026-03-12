"use client";

import { useApp } from "@/context/AppContext";
import { WeeklyEvent, WeekDay } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { Clock, CalendarDays, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

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

  const [events, setEvents] = useState<WeeklyEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDay, setAddDay] = useState<WeekDay>("Дүйсенбі");

  // New event form state
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newResponsible, setNewResponsible] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/weekly-events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data as WeeklyEvent[]);
      }
    } catch (e) {
      console.error("fetchEvents error:", e);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/weekly-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: addDay,
          title: newTitle.trim(),
          time: newTime.trim() || null,
          responsible: newResponsible.trim() || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setEvents((prev) => [...prev, created]);
        setNewTitle("");
        setNewTime("");
        setNewResponsible("");
        setShowAddForm(false);
      }
    } catch (e) {
      console.error("addEvent error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/weekly-events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error("deleteEvent error:", e);
    }
  };

  const weeklyTasks = tasks.filter((t) => t.weekly_plan);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays size={24} className="text-blue-600" />
            Апталық жоспар
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Аптаның негізгі іс-шаралары мен тапсырмалары
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Іс-шара қосу
          </button>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Жаңа іс-шара</h2>
              <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Күні</label>
                <select
                  value={addDay}
                  onChange={(e) => setAddDay(e.target.value as WeekDay)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Атауы *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Іс-шара атауы"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уақыты</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Жауапты</label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  placeholder="Жауапты адам"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Бас тарту
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Қосу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS.map((day, idx) => {
          const dayEvents = events.filter((e) => e.day === day);

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
                    className="bg-white rounded-lg p-2.5 shadow-sm border border-white/60 group relative"
                  >
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="absolute top-1.5 right-1.5 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        title="Жою"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <div className="font-semibold text-gray-800 text-xs leading-snug pr-5">
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
