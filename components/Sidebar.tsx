"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  LogOut,
  GraduationCap,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Басқару панелі", icon: LayoutDashboard },
  { href: "/tasks", label: "Тапсырмалар", icon: ClipboardList },
  { href: "/weekly-plan", label: "Апталық жоспар", icon: CalendarDays },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, isAdmin } = useApp();

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">EDU CONTROL</div>
            <div className="text-blue-300 text-xs">Мектеп басқарма жүйесі</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{currentUser.full_name}</div>
              <div className="text-blue-300 text-xs truncate">{currentUser.role}</div>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full inline-block font-semibold">
              Администратор
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-white/20 text-white shadow-inner"
                : "text-blue-200 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700 space-y-1">
        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={18} />
          Шығу
        </button>
      </div>
    </aside>
  );
}
