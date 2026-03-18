"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { StatsCard } from "@/components/StatsCard";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { Task, ALL_ROLES, STATUS_COLORS, PRIORITY_COLORS, getDeadlineStatus, DEADLINE_COLORS } from "@/lib/types";
import { formatDate, deadlineLabel } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListChecks,
  Plus,
  Filter,
  X,
  Calendar,
  Users,
  Paperclip,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { tasks, users, isAdmin, currentUser, updateTask, loading } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("Барлығы");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks by role (admin sees all, user sees own)
  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (!isAdmin) {
      filtered = filtered.filter((t) =>
        t.assignees?.some((a) => a.id === currentUser?.id) || t.assignee_id === currentUser?.id
      );
    } else if (filterRole !== "Барлығы") {
      const user = users.find((u) => u.role === filterRole);
      filtered = filtered.filter((t) =>
        t.assignees?.some((a) => a.id === user?.id) || t.assignee_id === user?.id
      );
    }

    // Apply status filter from stats cards
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    return filtered;
  }, [tasks, isAdmin, currentUser, filterRole, users, statusFilter]);

  const stats = useMemo(() => {
    // Stats are calculated from non-status-filtered tasks
    const baseTasks = (() => {
      if (!isAdmin) {
        return tasks.filter((t) =>
          t.assignees?.some((a) => a.id === currentUser?.id) || t.assignee_id === currentUser?.id
        );
      }
      if (filterRole === "Барлығы") return tasks;
      const user = users.find((u) => u.role === filterRole);
      return tasks.filter((t) =>
        t.assignees?.some((a) => a.id === user?.id) || t.assignee_id === user?.id
      );
    })();
    const total = baseTasks.length;
    const completed = baseTasks.filter((t) => t.status === "Орындалды").length;
    const overdue = baseTasks.filter((t) => t.status === "Кешікті").length;
    const inProgress = baseTasks.filter((t) => t.status === "Процесте").length;
    return { total, completed, overdue, inProgress };
  }, [tasks, isAdmin, currentUser, filterRole, users]);

  const chartData = [
    { name: "Орындалды", value: stats.completed, color: "#22c55e" },
    { name: "Процесте", value: stats.inProgress, color: "#3b82f6" },
    { name: "Кешікті", value: stats.overdue, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Upcoming tasks (not completed, sorted by deadline)
  const upcomingTasks = useMemo(
    () =>
      visibleTasks
        .filter((t) => statusFilter ? true : t.status !== "Орындалды")
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 6),
    [visibleTasks, statusFilter]
  );

  const handleStatsClick = (status: string | null) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Деректер жүктелуде...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Басқару панелі</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Сәлем, {currentUser?.full_name}!
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Тапсырма қосу
          </button>
        )}
      </div>

      {/* Role Filter (Admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Сүзгі:</span>
          {["Барлығы", ...ALL_ROLES.filter((r) => r !== "Директор")].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
                filterRole === role
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-700"
              )}
            >
              {role === "Барлығы"
                ? "Барлығы"
                : role.length > 20
                ? role.slice(0, 20) + "…"
                : role}
            </button>
          ))}
        </div>
      )}

      {/* Stats - clickable for filtering */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => handleStatsClick(null)} className="cursor-pointer">
          <StatsCard
            title="Барлық тапсырмалар"
            value={stats.total}
            icon={ListChecks}
            color="blue"
            active={statusFilter === null}
          />
        </div>
        <div onClick={() => handleStatsClick("Орындалды")} className="cursor-pointer">
          <StatsCard
            title="Орындалды"
            value={stats.completed}
            icon={CheckCircle2}
            color="green"
            subtitle={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%"}
            active={statusFilter === "Орындалды"}
          />
        </div>
        <div onClick={() => handleStatsClick("Процесте")} className="cursor-pointer">
          <StatsCard
            title="Процесте"
            value={stats.inProgress}
            icon={Clock}
            color="orange"
            active={statusFilter === "Процесте"}
          />
        </div>
        <div onClick={() => handleStatsClick("Кешікті")} className="cursor-pointer">
          <StatsCard
            title="Кешіктірілген"
            value={stats.overdue}
            icon={AlertCircle}
            color="red"
            active={statusFilter === "Кешікті"}
          />
        </div>
      </div>

      {/* Active filter indicator */}
      {statusFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Сүзгі:</span>
          <span className={cn("text-xs px-3 py-1 rounded-full font-medium", STATUS_COLORS[statusFilter as keyof typeof STATUS_COLORS])}>
            {statusFilter}
          </span>
          <button
            onClick={() => setStatusFilter(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            {statusFilter ? `${statusFilter} тапсырмалар` : "Орындалуы керек тапсырмалар"}
          </h2>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-green-300" />
              <p className="text-sm">
                {statusFilter ? `"${statusFilter}" статусындағы тапсырма жоқ` : "Барлық тапсырмалар орындалды!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer">
                  <TaskCard
                    task={task}
                    isAdmin={isAdmin}
                    onStatusChange={(id, status) => updateTask(id, { status })}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ListChecks size={18} className="text-blue-600" />
            Статистика
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} тапсырма`]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400 text-sm">
              Деректер жоқ
            </div>
          )}

          {/* Traffic Light Legend */}
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Светофор индикаторы
            </p>
            {[
              { color: "bg-green-500", label: "3 күннен астам уақыт бар" },
              { color: "bg-orange-400", label: "3 күн немесе аз қалды" },
              { color: "bg-red-500", label: "Мерзімі өтіп кетті" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isAdmin={isAdmin}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(id, status) => {
            updateTask(id, { status });
            setSelectedTask((prev) => prev ? { ...prev, status } : null);
          }}
        />
      )}

      {/* Create Task Modal */}
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function TaskDetailModal({
  task,
  isAdmin,
  onClose,
  onStatusChange,
}: {
  task: Task;
  isAdmin: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}) {
  const trafficLight = getDeadlineStatus(task.deadline, task.status);
  const trafficDot: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-400",
    green: "bg-green-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn("w-3.5 h-3.5 rounded-full shrink-0", trafficDot[trafficLight])} />
            <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg shrink-0">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status & Priority */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn("text-sm px-3 py-1 rounded-full font-medium border", STATUS_COLORS[task.status])}>
              {task.status}
            </span>
            <span className={cn("text-sm px-3 py-1 rounded-full font-medium", PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                <FileText size={12} className="inline mr-1" />
                Сипаттама
              </label>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{task.description}</p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              <Users size={12} className="inline mr-1" />
              Жауаптылар
            </label>
            <div className="flex flex-wrap gap-2">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((a) => (
                  <span key={a.id} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    {a.full_name}
                  </span>
                ))
              ) : task.assignee ? (
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {task.assignee.full_name}
                </span>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              <Calendar size={12} className="inline mr-1" />
              Мерзімі
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{formatDate(task.deadline)}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                trafficLight === "green" ? "bg-green-100 text-green-700" :
                trafficLight === "orange" ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              )}>
                {deadlineLabel(task.deadline)}
              </span>
            </div>
          </div>

          {/* File */}
          {task.file_url && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                <Paperclip size={12} className="inline mr-1" />
                Тіркелген файл
              </label>
              <a
                href={task.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Файлды ашу
              </a>
            </div>
          )}

          {/* Status Change Buttons */}
          <div className="border-t pt-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
              Статусты өзгерту
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onStatusChange(task.id, "Процесте")}
                disabled={task.status === "Процесте"}
                className={cn(
                  "text-sm px-4 py-2 rounded-lg font-medium transition-colors",
                  task.status === "Процесте"
                    ? "bg-blue-200 text-blue-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                )}
              >
                Процесте
              </button>
              <button
                onClick={() => onStatusChange(task.id, "Орындалды")}
                disabled={task.status === "Орындалды"}
                className={cn(
                  "text-sm px-4 py-2 rounded-lg font-medium transition-colors",
                  task.status === "Орындалды"
                    ? "bg-green-200 text-green-400 cursor-not-allowed"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                )}
              >
                Орындалды
              </button>
              <button
                onClick={() => onStatusChange(task.id, "Кешікті")}
                disabled={task.status === "Кешікті"}
                className={cn(
                  "text-sm px-4 py-2 rounded-lg font-medium transition-colors",
                  task.status === "Кешікті"
                    ? "bg-red-200 text-red-400 cursor-not-allowed"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                )}
              >
                Кешікті
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
