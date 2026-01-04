import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [authError, setAuthError] = useState("");

  async function refreshUser() {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(username, password) {
    setAuthError("");
    const u = await api.login({ username, password });
    setUser(u);
    return u;
  }

  async function register(username, password) {
    setAuthError("");
    const u = await api.register({ username, password });
    setUser(u);
    return u;
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      authError,
      setAuthError,
      refreshUser,
      login,
      register,
      logout
    }),
    [user, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
