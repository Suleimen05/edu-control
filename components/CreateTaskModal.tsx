"use client";

import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Priority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreateTaskModalProps {
  onClose: () => void;
}

export function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const { users, currentUser, addTask } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Орташа" as Priority,
    weekly_plan: false,
  });

  const staffUsers = users.filter((u) => !u.is_admin);

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedAssignees.length === staffUsers.length) {
      setSelectedAssignees([]);
    } else {
      setSelectedAssignees(staffUsers.map((u) => u.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || selectedAssignees.length === 0 || !form.deadline) return;

    setSubmitting(true);
    setError("");

    try {
      await addTask({
        title: form.title,
        description: form.description || undefined,
        assignee_id: selectedAssignees[0],
        assignee_ids: selectedAssignees,
        deadline: form.deadline,
        priority: form.priority,
        status: "Процесте" as TaskStatus,
        weekly_plan: form.weekly_plan,
        created_by: currentUser?.id ?? "",
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Қате: ${msg}`);
      console.error("addTask error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Жаңа тапсырма қосу</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тапсырма атауы *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Тапсырманы жазыңыз..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сипаттама
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Қосымша мәліметтер..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Assignees (multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Жауапты тұлғалар * ({selectedAssignees.length} таңдалды)
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedAssignees.length === staffUsers.length ? "Бәрін алып тастау" : "Бәрін таңдау"}
              </button>
            </div>
            <div className="border rounded-lg max-h-44 overflow-y-auto divide-y">
              {staffUsers.map((u) => {
                const isSelected = selectedAssignees.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAssignee(u.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {u.full_name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{u.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Мерзімі *
              </label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Маңыздылығы
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Жоғары</option>
                <option>Орташа</option>
                <option>Төмен</option>
              </select>
            </div>
          </div>

          {/* Weekly plan */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.weekly_plan}
              onChange={(e) => setForm({ ...form, weekly_plan: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Апталық жоспарға қосу</span>
          </label>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              disabled={submitting || selectedAssignees.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Сақталуда...
                </>
              ) : (
                "Тапсырма қосу"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
