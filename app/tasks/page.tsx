"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import {
  Task,
  TaskStatus,
  Priority,
  TaskComment,
  getDeadlineStatus,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/types";
import { formatDate, deadlineLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

type SortField = "deadline" | "priority" | "status" | "title";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<Priority, number> = { Жоғары: 0, Орташа: 1, Төмен: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = { Кешікті: 0, Процесте: 1, Орындалды: 2 };

async function apiCall(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

export default function TasksPage() {
  const { tasks, users, isAdmin, currentUser, updateTask, deleteTask } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "Барлығы">("Барлығы");
  const [filterPriority, setFilterPriority] = useState<Priority | "Барлығы">("Барлығы");
  const [filterAssignee, setFilterAssignee] = useState<string>("Барлығы");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    let list = isAdmin
      ? tasks
      : tasks.filter((t) =>
          t.assignees?.some((a) => a.id === currentUser?.id) || t.assignee_id === currentUser?.id
        );

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filterStatus !== "Барлығы") {
      list = list.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== "Барлығы") {
      list = list.filter((t) => t.priority === filterPriority);
    }
    if (filterAssignee !== "Барлығы") {
      list = list.filter((t) =>
        t.assignees?.some((a) => a.id === filterAssignee) || t.assignee_id === filterAssignee
      );
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "deadline") {
        cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortField === "priority") {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (sortField === "status") {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else {
        cmp = a.title.localeCompare(b.title, "kk");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [tasks, isAdmin, currentUser, search, filterStatus, filterPriority, filterAssignee, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null;

  const trafficDot: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-400",
    green: "bg-green-500",
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Тапсырмалар</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {visibleTasks.length} тапсырма табылды
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Тапсырма қосу
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-3 md:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Тапсырманы іздеу..."
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "Барлығы")}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Барлығы">Барлық статус</option>
            <option>Процесте</option>
            <option>Орындалды</option>
            <option>Кешікті</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | "Барлығы")}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Барлығы">Барлық маңыздылық</option>
            <option>Жоғары</option>
            <option>Орташа</option>
            <option>Төмен</option>
          </select>
          {isAdmin && (
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Барлығы">Барлық орынбасарлар</option>
              {users.filter((u) => !u.is_admin).map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-8">№</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("title")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700">
                    Тапсырма <SortIcon field="title" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Жауапты</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("deadline")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700">
                    Мерзімі <SortIcon field="deadline" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  <button onClick={() => toggleSort("priority")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700">
                    Маңызд. <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("status")} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700">
                    Статус <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Тапсырмалар табылмады
                  </td>
                </tr>
              ) : (
                visibleTasks.map((task, idx) => {
                  const light = getDeadlineStatus(task.deadline, task.status);
                  const isExpanded = expandedTask === task.id;
                  return (
                    <>
                      <tr key={task.id} className={cn("hover:bg-gray-50 transition-colors", isExpanded && "bg-blue-50/30")}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <span className={cn("w-2.5 h-2.5 rounded-full mt-1 shrink-0", trafficDot[light])} />
                            <div>
                              <div className="font-medium text-gray-900">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">{task.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {task.assignees && task.assignees.length > 1 ? (
                            <div className="space-y-0.5">
                              {task.assignees.map((a) => (
                                <div key={a.id} className="text-gray-700 text-xs">{a.full_name}</div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="text-gray-700">{task.assignees?.[0]?.full_name || task.assignee?.full_name}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[160px]">{task.assignees?.[0]?.role || task.assignee?.role}</div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{formatDate(task.deadline)}</div>
                          <div className={cn("text-xs", light === "red" ? "text-red-500" : light === "orange" ? "text-orange-500" : "text-gray-400")}>
                            {deadlineLabel(task.deadline)}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as TaskStatus;
                              if (!isAdmin && newStatus === "Орындалды") return;
                              updateTask(task.id, { status: newStatus });
                            }}
                            className={cn("text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none", STATUS_COLORS[task.status])}
                            disabled={task.status === "Орындалды" && !isAdmin}
                          >
                            <option value="Процесте">Процесте</option>
                            <option value="Орындалды">Орындалды</option>
                            <option value="Кешікті">Кешікті</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isExpanded
                                  ? "text-blue-600 bg-blue-100"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                              )}
                              title="Пікірлер"
                            >
                              <MessageCircle size={15} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Жою"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${task.id}-comments`}>
                          <td colSpan={7} className="p-0">
                            <TaskCommentsPanel
                              taskId={task.id}
                              userId={currentUser?.id || ""}
                              isAdmin={isAdmin}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ============================================================
// Task Comments Panel
// ============================================================
function TaskCommentsPanel({ taskId, userId, isAdmin }: { taskId: string; userId: string; isAdmin: boolean }) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await apiCall(`/api/tasks/${taskId}/comments`);
      setComments(data as TaskComment[]);
    } catch (e) {
      console.error("Fetch comments error:", e);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const sendComment = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const newComment = await apiCall(`/api/tasks/${taskId}/comments`, "POST", {
        user_id: userId,
        content: text.trim(),
      });
      setComments((prev) => [...prev, newComment as TaskComment]);
      setText("");
    } catch (e) {
      console.error("Send comment error:", e);
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await apiCall(`/api/tasks/${taskId}/comments?comment_id=${commentId}`, "DELETE");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error("Delete comment error:", e);
    }
  };

  return (
    <div className="bg-gray-50 border-t border-b border-blue-100 px-4 md:px-8 py-4">
      <div className="max-w-2xl">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MessageCircle size={13} /> Пікірлер
        </h4>

        {loading ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2" />
          </div>
        ) : (
          <>
            {/* Comments list */}
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 mb-3">Пікірлер жоқ</p>
            ) : (
              <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 group">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 mt-0.5">
                      {c.user?.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-gray-800">{c.user?.full_name || "—"}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleDateString("kk-KZ", { day: "2-digit", month: "2-digit" })}{" "}
                          {new Date(c.created_at).toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {(isAdmin || c.user_id === userId) && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New comment input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendComment()}
                placeholder="Пікір жазу..."
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={sendComment}
                disabled={!text.trim() || sending}
                className="px-3.5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
