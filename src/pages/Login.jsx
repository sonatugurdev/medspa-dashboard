import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError("");
    // Validate key against backend
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || "https://medspa-backend.onrender.com"}/api/dashboard/patients`,
        { headers: { "X-Dashboard-Key": key.trim() } }
      );
      if (res.status === 401) {
        setError("Invalid API key. Check your credentials.");
      } else {
        login(key.trim());
      }
    } catch {
      setError("Cannot reach server. Check your connection.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Background accent */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(15,123,140,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: 420, padding: "48px 44px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.12)",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3.5" stroke="white" strokeWidth="1.5"/>
                <path d="M3 15.5c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", fontFamily: "var(--font-display)" }}>
              Endless Youth
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              background: "var(--teal-subtle)", color: "var(--teal)",
              padding: "3px 7px", borderRadius: 4, textTransform: "uppercase"
            }}>Medspa</span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            Practitioner dashboard · Sign in with your API key
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.07em",
              color: "var(--text-secondary)", marginBottom: 8
            }}>API Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-dash-••••••••••••••••"
              autoFocus
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--bg)", border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
                borderRadius: 8, fontSize: 13.5, color: "var(--text-primary)",
                fontFamily: "var(--font-mono)", outline: "none",
                transition: "border-color 0.15s",
              }}
            />
            {error && (
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--red)" }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !key.trim()}
            style={{
              width: "100%", padding: "12px",
              background: loading || !key.trim() ? "var(--border)" : "var(--teal)",
              color: loading || !key.trim() ? "var(--text-muted)" : "white",
              border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
              cursor: loading || !key.trim() ? "default" : "pointer",
              transition: "all 0.15s", letterSpacing: "0.01em",
            }}
          >
            {loading ? "Verifying…" : "Enter Dashboard →"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 11.5, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
          Protected by Glowa AI Auth.<br/>Keys are session-only and never stored.
        </p>
      </div>
    </div>
  );
}
