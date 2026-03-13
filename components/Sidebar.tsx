"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  StickyNote,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Басқару панелі", icon: LayoutDashboard },
  { href: "/tasks", label: "Тапсырмалар", icon: ClipboardList },
  { href: "/weekly-plan", label: "Апталық жоспар", icon: CalendarDays },
  { href: "/notes", label: "Жазбалар", icon: StickyNote },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, isAdmin } = useApp();
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white/20">
            <img src="/avatars/image.png" alt="Logo" className="w-9 h-9 object-contain" />
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
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
            )}
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
            onClick={() => setOpen(false)}
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
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={() => { setCurrentUser(null); setOpen(false); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={18} />
          Шығу
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-blue-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <img src="/avatars/image.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm">EDU CONTROL</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex-col shadow-xl shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
