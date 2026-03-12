"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Task } from "@/lib/types";
import { supabase } from "@/lib/supabase"; // used for users fetch + realtime

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at"> & { assignee_ids?: string[] }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refetchTasks: () => Promise<void>;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Helper — call our server-side API routes (they use service_role key)
async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users AND validate stored user against real DB IDs
  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .order("full_name")
      .then(({ data }) => {
        if (!data) return;
        const dbUsers = data as User[];
        setUsers(dbUsers);

        const stored = localStorage.getItem("edu_current_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as User;
            const realUser = dbUsers.find((u) => u.id === parsed.id);
            if (realUser) {
              setCurrentUserState(realUser);
            } else {
              localStorage.removeItem("edu_current_user");
            }
          } catch {
            localStorage.removeItem("edu_current_user");
          }
        }
      });
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/tasks");
      setTasks(data as Task[]);
    } catch (e) {
      console.error("fetchTasks error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) localStorage.setItem("edu_current_user", JSON.stringify(user));
    else localStorage.removeItem("edu_current_user");
  };

  const addTask = async (task: Omit<Task, "id" | "created_at" | "updated_at"> & { assignee_ids?: string[] }) => {
    const { assignee, assignees, ...rest } = task as Task & { assignee?: User; assignees?: User[]; assignee_ids?: string[] };
    const newTask = await api("/api/tasks", "POST", rest) as Task;
    setTasks((prev) => [...prev, newTask].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    ));
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await api(`/api/tasks/${id}`, "PATCH", updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = async (id: string) => {
    await api(`/api/tasks/${id}`, "DELETE");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        refetchTasks: fetchTasks,
        isAdmin: currentUser?.is_admin ?? false,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
