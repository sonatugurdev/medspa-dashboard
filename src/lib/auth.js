import { createContext, useContext } from "react";

export const AuthContext = createContext({ apiKey: "", login: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

const BASE = import.meta.env.VITE_API_BASE || "https://medspa-backend.onrender.com";

export function apiClient(apiKey) {
  const headers = {
    "Content-Type": "application/json",
    "X-Dashboard-Key": apiKey,
  };

  return {
    get: async (path) => {
      const res = await fetch(`${BASE}${path}`, { headers });
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  };
}
