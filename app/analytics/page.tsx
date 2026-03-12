"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { AnalyticsData } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function RatingBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-500 text-lg">🥇</span>;
  if (rank === 2) return <span className="text-gray-400 text-lg">🥈</span>;
  if (rank === 3) return <span className="text-orange-500 text-lg">🥉</span>;
  return (
    <span className="text-xs font-bold text-gray-400 w-6 text-center">
      {rank}
    </span>
  );
}

export default function AnalyticsPage() {
  const { tasks, users, isAdmin } = useApp();

  const analytics: AnalyticsData[] = useMemo(() => {
    const staffUsers = users.filter((u) => !u.is_admin);

    return staffUsers
      .map((user) => {
        const userTasks = tasks.filter((t) => t.assignee_id === user.id);
        const total = userTasks.length;
        const completed = userTasks.filter((t) => t.status === "Орындалды").length;
        const overdue = userTasks.filter((t) => t.status === "Кешікті").length;
        const inProgress = userTasks.filter((t) => t.status === "Процесте").length;
        const completionRate =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        return { user, total, completed, overdue, in_progress: inProgress, completion_rate: completionRate };
      })
      .sort((a, b) => b.completion_rate - a.completion_rate);
  }, [tasks, users]);

  const chartData = analytics.map((a) => ({
    name: a.user.full_name.split(" ")[0], // First name for chart
    fullName: a.user.full_name,
    role: a.user.role,
    rate: a.completion_rate,
    completed: a.completed,
    total: a.total,
    overdue: a.overdue,
  }));

  const avgRate =
    analytics.length > 0
      ? Math.round(
          analytics.reduce((sum, a) => sum + a.completion_rate, 0) /
            analytics.length
        )
      : 0;

  const topPerformer = analytics[0];
  const worstPerformer = analytics[analytics.length - 1];

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="mx-auto text-yellow-500 mb-2" />
          <h2 className="font-bold text-gray-900 mb-1">Қол жеткізу шектелген</h2>
          <p className="text-gray-600 text-sm">
            Аналитика тек директорға қолжетімді.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={24} className="text-blue-600" />
          Аналитика
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Орынбасарлардың тапсырмаларды орындау рейтингі
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-3xl font-bold text-blue-700 mb-1">{avgRate}%</div>
          <div className="text-sm font-medium text-gray-700">Орташа орындалу</div>
          <div className="text-xs text-gray-500">барлық қызметкерлер бойынша</div>
        </div>

        {topPerformer && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-yellow-500" />
              <span className="text-xs font-semibold text-green-700 uppercase">Үздік</span>
            </div>
            <div className="font-bold text-gray-900">{topPerformer.user.full_name}</div>
            <div className="text-xs text-gray-500 mb-2 truncate">{topPerformer.user.role}</div>
            <div className="text-2xl font-bold text-green-700">
              {topPerformer.completion_rate}%
            </div>
          </div>
        )}

        {worstPerformer && worstPerformer !== topPerformer && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-500" />
              <span className="text-xs font-semibold text-red-700 uppercase">Назар аудару керек</span>
            </div>
            <div className="font-bold text-gray-900">{worstPerformer.user.full_name}</div>
            <div className="text-xs text-gray-500 mb-2 truncate">{worstPerformer.user.role}</div>
            <div className="text-2xl font-bold text-red-700">
              {worstPerformer.completion_rate}%
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-6">
          Орындалу пайызы (%) — қызметкерлер бойынша
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Орындалу"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: string, payload: any[]) =>
                payload?.[0]?.payload?.fullName ?? label
              }
            />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.rate >= 80
                      ? "#22c55e"
                      : entry.rate >= 50
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-gray-900">Рейтинг кестесі</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-10">Орын</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Қызметкер</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Барлығы</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Орындалды</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Кешікті</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Орындалу %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.map((item, idx) => (
                <tr
                  key={item.user.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    idx === 0 && "bg-yellow-50/50"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <RatingBadge rank={idx + 1} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {item.user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.user.full_name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">{item.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-700">{item.total}</td>
                  <td className="px-5 py-3.5 text-center text-green-600 font-medium">{item.completed}</td>
                  <td className="px-5 py-3.5 text-center text-red-500 font-medium">{item.overdue}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="flex-1 max-w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            item.completion_rate >= 80
                              ? "bg-green-500"
                              : item.completion_rate >= 50
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          )}
                          style={{ width: `${item.completion_rate}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "font-bold text-sm w-12 text-right",
                          item.completion_rate >= 80
                            ? "text-green-600"
                            : item.completion_rate >= 50
                            ? "text-yellow-600"
                            : "text-red-500"
                        )}
                      >
                        {item.completion_rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
