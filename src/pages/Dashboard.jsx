import { useState, useEffect, useCallback } from "react";
import { useAuth, apiClient } from "../lib/auth";
import PatientList from "../components/PatientList";
import SessionDetail from "../components/SessionDetail";
import OverviewPanel from "../components/OverviewPanel";
import ProgressPage from "../components/ProgressPage";

export default function Dashboard({ onUnauth }) {
  const { apiKey, logout } = useAuth();
  const client = apiClient(apiKey);

  const [screen, setScreen] = useState("overview"); // "overview" | "patient" | "session"
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const data = await client.get("/api/dashboard/patients");
      setPatients(data.patients || []);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") { logout(); onUnauth(); }
      else setError("Failed to load patients");
    }
    setLoadingPatients(false);
  }, [apiKey]);

  const fetchSession = useCallback(async (sessionId) => {
    setLoadingSession(true);
    setSessionDetail(null);
    try {
      const data = await client.get(`/api/dashboard/sessions/${sessionId}`);
      setSessionDetail(data);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") { logout(); onUnauth(); }
      else setError("Failed to load session");
    }
    setLoadingSession(false);
  }, [apiKey]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedSession(null);
    setSessionDetail(null);
    setScreen("patient");
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    fetchSession(session.id);
    setScreen("session");
  };

  const handleBack = () => {
    if (screen === "session") {
      setScreen("patient");
      setSelectedSession(null);
      setSessionDetail(null);
    } else {
      setScreen("overview");
      setSelectedPatient(null);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 20px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="3" stroke="white" strokeWidth="1.4"/>
              <path d="M2.5 14c0-3 2.4-5 5.5-5s5.5 2 5.5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px", fontFamily: "var(--font-display)", lineHeight: 1 }}>Lucida</div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>Clinical Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
          <SideNavSection label="Practice">
            <NavItem icon={<HomeIcon />} label="Overview" active={screen === "overview"} onClick={() => { setScreen("overview"); setSelectedPatient(null); setSelectedSession(null); }} />
            <NavItem icon={<PatientsIcon />} label="Patients" active={["patient","session"].includes(screen)} onClick={() => { setScreen("overview"); }} badge={patients.length || null} />
            <NavItem icon={<ProgressIcon />} label="Progress" active={screen === "progress"} onClick={() => { setScreen("progress"); setSelectedPatient(null); setSelectedSession(null); }} />
          </SideNavSection>

          {selectedPatient && (
            <SideNavSection label={selectedPatient.name.split(" ")[0]}>
              <NavItem icon={<ProfileIcon />} label="Intake Summary" active={screen === "patient"} onClick={() => { setScreen("patient"); setSelectedSession(null); setSessionDetail(null); }} />
              {selectedPatient.sessions?.map(s => (
                <NavItem
                  key={s.id}
                  icon={<ScanIcon />}
                  label={`Scan ${formatDate(s.created_at)}`}
                  active={selectedSession?.id === s.id}
                  onClick={() => handleSelectSession(s)}
                  indent
                />
              ))}
            </SideNavSection>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.4 }}>
            <span style={{ color: "var(--teal)", fontWeight: 600 }}>●</span> Connected to backend
          </div>
          <button onClick={() => { logout(); onUnauth(); }} style={{
            width: "100%", padding: "7px 10px",
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: 6, fontSize: 12, color: "var(--text-muted)",
            cursor: "pointer", textAlign: "left",
            fontFamily: "var(--font-body)",
          }}>Sign out →</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          height: 56, flexShrink: 0,
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", padding: "0 24px",
          gap: 16,
        }}>
          {screen !== "overview" && (
            <button onClick={handleBack} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 12,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", cursor: "pointer",
              fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 5,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
              Back
            </button>
          )}
          <Breadcrumb screen={screen} patient={selectedPatient} session={selectedSession} />
          <div style={{ flex: 1 }} />
          {/* Search — only show on patient list */}
          {(screen === "overview") && (
            <div style={{ position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="6" cy="6" r="4"/><path d="M12 12l-2.5-2.5"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients…"
                style={{
                  padding: "7px 12px 7px 30px", borderRadius: 7,
                  border: "1px solid var(--border)", background: "var(--bg)",
                  fontSize: 13, color: "var(--text-primary)", outline: "none",
                  width: 220, fontFamily: "var(--font-body)",
                }}
              />
            </div>
          )}
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px" }}>
          {error && (
            <div style={{ background: "var(--red-subtle)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          )}

          {screen === "overview" && (
            <OverviewPanel
              patients={filteredPatients}
              loading={loadingPatients}
              onSelectPatient={handleSelectPatient}
              search={search}
            />
          )}

          {screen === "patient" && selectedPatient && (
            <PatientList
              patient={selectedPatient}
              onSelectSession={handleSelectSession}
              selectedSessionId={selectedSession?.id}
            />
          )}

          {screen === "session" && (
            <SessionDetail
              session={selectedSession}
              detail={sessionDetail}
              loading={loadingSession}
            />
          )}
          {screen === "progress" && (
            <ProgressPage />
          )}
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SideNavSection({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.09em", color: "var(--text-muted)",
        padding: "0 10px 6px",
      }}>{label}</div>
      {children}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge, indent }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 9,
      padding: `7px ${indent ? "8px 7px 28px" : "10px 10px 10px"}`,
      borderRadius: 7, border: "none", cursor: "pointer",
      background: active ? "var(--teal-subtle)" : "transparent",
      color: active ? "var(--teal)" : "var(--text-secondary)",
      fontSize: 13, fontWeight: active ? 600 : 400,
      fontFamily: "var(--font-body)",
      textAlign: "left", transition: "all 0.12s",
      marginBottom: 1,
    }}>
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: "var(--teal-subtle)", color: "var(--teal)",
          borderRadius: 10, padding: "1px 6px",
        }}>{badge}</span>
      )}
    </button>
  );
}

function Breadcrumb({ screen, patient, session }) {
  const parts = ["Patients"];
  if (patient) parts.push(patient.name);
  if (session) parts.push(`Scan · ${formatDate(session.created_at)}`);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
          <span style={{ color: i === parts.length - 1 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: i === parts.length - 1 ? 600 : 400 }}>{p}</span>
        </span>
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Icons
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l5.5-4.5L13 6v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z"/>
    <path d="M5.5 14V8.5h4V14"/>
  </svg>
);
const PatientsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="4.5" r="2.5"/>
    <path d="M1 13c0-2.5 1.8-4 4-4s4 1.5 4 4"/>
    <circle cx="11" cy="5" r="2"/>
    <path d="M14 13c0-2 1-3 0-3"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="1" width="11" height="13" rx="2"/>
    <path d="M5 5h5M5 8h3"/>
  </svg>
);
const ScanIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="1" y="1" width="11" height="11" rx="2"/>
    <path d="M4 6.5h5M6.5 4v5"/>
  </svg>
);

const ProgressIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1.5,10 4.5,6 7,8 11.5,3"/>
    <path d="M9.5 3h2v2"/>
  </svg>
);
