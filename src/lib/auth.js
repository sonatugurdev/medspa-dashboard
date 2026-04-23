import { createContext, useContext } from "react";

export const AuthContext = createContext({ apiKey: "", login: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

const BASE = import.meta.env.VITE_API_BASE || "https://medspa-backend.onrender.com";
export const PRACTICE_SLUG = import.meta.env.VITE_PRACTICE_SLUG || "default";

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
    patch: async (path, body) => {
      const res = await fetch(`${BASE}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    post: async (path, body) => {
      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  };
}