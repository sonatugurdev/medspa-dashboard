import { useState } from "react";

const URGENCY_COLORS = {
  high: { bg: "var(--red-subtle)", fg: "var(--red)", dot: "var(--red)" },
  medium: { bg: "var(--amber-subtle)", fg: "var(--amber)", dot: "var(--amber)" },
  low: { bg: "var(--green-subtle)", fg: "var(--green)", dot: "var(--green)" },
  preventive: { bg: "var(--teal-subtle)", fg: "var(--teal)", dot: "var(--teal)" },
};

const FITZPATRICK_LABELS = { I: "Very fair", II: "Fair", III: "Medium", IV: "Olive", V: "Brown", VI: "Dark" };

export default function OverviewPanel({ patients, loading, onSelectPatient, search }) {
  const [sortBy, setSortBy] = useState("recent");

  const sorted = [...patients].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.last_session_at || 0) - new Date(a.last_session_at || 0);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "score") return (b.latest_score || 0) - (a.latest_score || 0);
    return 0;
  });

  const totalPatients = patients.length;
  const withAnalysis = patients.filter(p => p.latest_score != null).length;
  const recentScans = patients.filter(p => {
    if (!p.last_session_at) return false;
    const days = (Date.now() - new Date(p.last_session_at)) / 86400000;
    return days <= 30;
  }).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", fontFamily: "var(--font-display)", marginBottom: 4 }}>
          Patient Intelligence
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Pre-visit skin analysis for {totalPatients} patient{totalPatients !== 1 ? "s" : ""}
          {search && ` · Showing results for "${search}"`}
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <KPICard label="Total Patients" value={totalPatients} sub="In database" accent={false} />
        <KPICard label="With AI Analysis" value={withAnalysis} sub="Skin scores available" accent={true} />
        <KPICard label="Scans This Month" value={recentScans} sub="Last 30 days" accent={false} />
      </div>

      {/* Patient table */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {/* Table header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            Patients {search && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({sorted.length} results)</span>}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {[["recent", "Recent"], ["name", "Name"], ["score", "Score"]].map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)} style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 11.5,
                fontWeight: 500, cursor: "pointer",
                border: `1px solid ${sortBy === val ? "var(--teal)" : "var(--border)"}`,
                background: sortBy === val ? "var(--teal-subtle)" : "transparent",
                color: sortBy === val ? "var(--teal)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading patients…</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>No patients found</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Try a different search term</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["Patient", "Fitzpatrick / Glogau", "Top Concern", "Skin Score", "Last Scan", "Sessions", ""].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: 10.5, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <PatientRow key={p.id} patient={p} even={i % 2 === 0} onClick={() => onSelectPatient(p)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PatientRow({ patient: p, even, onClick }) {
  const scoreColor = p.latest_score >= 7.5 ? "var(--green)" : p.latest_score >= 5.5 ? "var(--teal)" : p.latest_score >= 4 ? "var(--amber)" : "var(--red)";
  const fitz = p.fitzpatrick || "—";
  const glogau = p.glogau || "—";

  return (
    <tr
      onClick={onClick}
      style={{
        background: even ? "var(--surface)" : "var(--bg)",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--teal-subtle)"}
      onMouseLeave={e => e.currentTarget.style.background = even ? "var(--surface)" : "var(--bg)"}
    >
      {/* Patient name + avatar */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: `hsl(${((p.name.charCodeAt(0) * 7) % 360)}, 40%, 88%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            color: `hsl(${((p.name.charCodeAt(0) * 7) % 360)}, 50%, 30%)`,
          }}>
            {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>
              {p.age ? `Age ${p.age}` : "—"}
              {p.email && ` · ${p.email}`}
            </div>
          </div>
        </div>
      </td>

      {/* Fitzpatrick / Glogau */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{
            padding: "3px 8px", borderRadius: 5,
            background: "var(--bg)", border: "1px solid var(--border)",
            fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}>F-{fitz}</span>
          <span style={{
            padding: "3px 8px", borderRadius: 5,
            background: "var(--bg)", border: "1px solid var(--border)",
            fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}>G-{glogau}</span>
        </div>
      </td>

      {/* Top concern */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        {p.top_concern ? (
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p.top_concern}</span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No analysis yet</span>
        )}
      </td>

      {/* Score */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        {p.latest_score != null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `${scoreColor}18`,
              border: `2px solid ${scoreColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11.5, fontWeight: 700, color: scoreColor,
              fontFamily: "var(--font-mono)",
            }}>
              {p.latest_score.toFixed(1)}
            </div>
            <ScoreBar score={p.latest_score} color={scoreColor} />
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
        )}
      </td>

      {/* Last scan */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
          {p.last_session_at ? formatDate(p.last_session_at) : "—"}
        </span>
      </td>

      {/* Session count */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 5, padding: "3px 8px",
          color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
        }}>{p.session_count || 0}</span>
      </td>

      {/* CTA */}
      <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "var(--teal)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          View <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5.5h7M6 2.5l3 3-3 3"/></svg>
        </span>
      </td>
    </tr>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ width: 56, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${(score / 10) * 100}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--surface)", border: `1px solid ${accent ? "var(--teal)" : "var(--border)"}`,
      borderRadius: 10, padding: "20px 22px",
      borderLeft: accent ? "4px solid var(--teal)" : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: accent ? "var(--teal)" : "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
