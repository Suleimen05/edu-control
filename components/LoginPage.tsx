"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { USER_CREDENTIALS } from "@/lib/types";
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react";

export function LoginPage() {
  const { users, setCurrentUser } = useApp();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!login.trim() || !password.trim()) {
      setError("Логин мен құпия сөзді енгізіңіз");
      return;
    }

    setIsLoading(true);

    // Find matching credentials
    const cred = USER_CREDENTIALS.find(
      (c) => c.login === login.trim() && c.password === password
    );

    if (!cred) {
      setError("Логин немесе құпия сөз қате");
      setIsLoading(false);
      return;
    }

    // Find the user in DB by email
    const user = users.find((u) => u.email === cred.email);
    if (!user) {
      setError("Пайдаланушы табылмады. Кейінірек қайталаңыз");
      setIsLoading(false);
      return;
    }

    setCurrentUser(user);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EDU CONTROL</h1>
          <p className="text-blue-200 text-sm mt-1">Мектеп басқарма жүйесі</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Логин
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => { setLogin(e.target.value); setError(""); }}
              placeholder="Логинді енгізіңіз"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Құпия сөз
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Құпия сөзді енгізіңіз"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || users.length === 0}
            className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : users.length === 0 ? (
              "Жүктелуде..."
            ) : (
              <>
                <LogIn size={18} />
                Жүйеге кіру
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
