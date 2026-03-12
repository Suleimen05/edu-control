"use client";

import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { LoginPage } from "@/components/LoginPage";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
