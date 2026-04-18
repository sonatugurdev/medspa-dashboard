import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthContext } from "./lib/auth";

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("dashboard_key") || "");
  const [authed, setAuthed] = useState(false);

  const login = (key) => {
    sessionStorage.setItem("dashboard_key", key);
    setApiKey(key);
    setAuthed(true);
  };

  const logout = () => {
    sessionStorage.removeItem("dashboard_key");
    setApiKey("");
    setAuthed(false);
  };

  // If key is already in session, treat as authed (backend will 401 if invalid)
  useEffect(() => {
    if (apiKey) setAuthed(true);
  }, []);

  return (
    <AuthContext.Provider value={{ apiKey, login, logout }}>
      {authed ? <Dashboard onUnauth={() => setAuthed(false)} /> : <Login />}
    </AuthContext.Provider>
  );
}
