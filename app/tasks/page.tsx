"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import {
  Task,
  TaskStatus,
  Priority,
  ALL_ROLES,
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
  Filter,
} from "lucide-react";

type SortField = "deadline" | "priority" | "status" | "title";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<Priority, number> = { Жоғары: 0, Орташа: 1, Төмен: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = { Кешікті: 0, Процесте: 1, Орындалды: 2 };

export default function TasksPage() {
  const { tasks, users, isAdmin, currentUser, updateTask, deleteTask } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "Барлығы">("Барлығы");
  const [filterPriority, setFilterPriority] = useState<Priority | "Барлығы">("Барлығы");
  const [filterAssignee, setFilterAssignee] = useState<string>("Барлығы");
  const [sortField, setSortField] = useState<SortField>("deadline");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const visibleTasks = useMemo(() => {
    let list = isAdmin
      ? tasks
      : tasks.filter((t) => t.assignee_id === currentUser?.id);

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
      const user = users.find((u) => u.id === filterAssignee);
      list = list.filter((t) => t.assignee_id === user?.id);
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
  }, [tasks, isAdmin, currentUser, search, filterStatus, filterPriority, filterAssignee, sortField, sortDir, users]);

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
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тапсырмалар</h1>
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
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Тапсырманы іздеу..."
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
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

          {/* Priority filter */}
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

          {/* Assignee filter (admin only) */}
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
                  <button
                    onClick={() => toggleSort("title")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                  >
                    Тапсырма <SortIcon field="title" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  Жауапты
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("deadline")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                  >
                    Мерзімі <SortIcon field="deadline" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">
                  <button
                    onClick={() => toggleSort("priority")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                  >
                    Маңызд. <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("status")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                  >
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
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
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
                        <div className="text-gray-700">{task.assignee?.full_name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{task.assignee?.role}</div>
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
                            // Non-admin can only set to "Процесте"
                            if (!isAdmin && newStatus === "Орындалды") return;
                            updateTask(task.id, { status: newStatus });
                          }}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none",
                            STATUS_COLORS[task.status]
                          )}
                          disabled={task.status === "Орындалды" && !isAdmin}
                        >
                          <option value="Процесте">Процесте</option>
                          <option value="Орындалды">Орындалды</option>
                          <option value="Кешікті">Кешікті</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Жою"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
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
