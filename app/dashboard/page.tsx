"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { StatsCard } from "@/components/StatsCard";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { ALL_ROLES } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListChecks,
  Plus,
  Filter,
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

  // Filter tasks by role (admin sees all, user sees own)
  const visibleTasks = useMemo(() => {
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
  }, [tasks, isAdmin, currentUser, filterRole, users]);

  const stats = useMemo(() => {
    const total = visibleTasks.length;
    const completed = visibleTasks.filter((t) => t.status === "Орындалды").length;
    const overdue = visibleTasks.filter((t) => t.status === "Кешікті").length;
    const inProgress = visibleTasks.filter((t) => t.status === "Процесте").length;
    return { total, completed, overdue, inProgress };
  }, [visibleTasks]);

  const chartData = [
    { name: "Орындалды", value: stats.completed, color: "#22c55e" },
    { name: "Процесте", value: stats.inProgress, color: "#3b82f6" },
    { name: "Кешікті", value: stats.overdue, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Upcoming tasks (not completed, sorted by deadline)
  const upcomingTasks = useMemo(
    () =>
      visibleTasks
        .filter((t) => t.status !== "Орындалды")
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 6),
    [visibleTasks]
  );

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
            Сәлем, {currentUser?.full_name}! Жұмысыңыз жақсы болсын.
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Барлық тапсырмалар"
          value={stats.total}
          icon={ListChecks}
          color="blue"
        />
        <StatsCard
          title="Орындалды"
          value={stats.completed}
          icon={CheckCircle2}
          color="green"
          subtitle={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%"}
        />
        <StatsCard
          title="Процесте"
          value={stats.inProgress}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Кешіктірілген"
          value={stats.overdue}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            Орындалуы керек тапсырмалар
          </h2>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-green-300" />
              <p className="text-sm">Барлық тапсырмалар орындалды!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onStatusChange={(id, status) => updateTask(id, { status })}
                  compact
                />
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

      {/* Create Task Modal */}
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
