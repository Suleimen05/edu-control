import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "orange" | "purple";
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-700",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    value: "text-green-700",
    border: "border-green-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    value: "text-red-700",
    border: "border-red-200",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    value: "text-orange-700",
    border: "border-orange-200",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    value: "text-purple-700",
    border: "border-purple-200",
  },
};

export function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={cn("rounded-xl border p-5 shadow-sm", c.bg, c.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.icon)}>
          <Icon size={20} />
        </div>
      </div>
      <div className={cn("text-3xl font-bold mb-1", c.value)}>{value}</div>
      <div className="text-sm font-medium text-gray-700">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
    </div>
  );
}
