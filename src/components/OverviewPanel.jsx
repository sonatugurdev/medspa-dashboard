import { useMemo } from "react";

export default function OverviewPanel({ patients, loading, onSelectPatient, search }) {
  const data = useMemo(() => {
    const total = patients.length;
    const analyzed = patients.filter(p => p.latest_score != null).length;
    const highPriority = patients.filter(p => p.latest_score != null && p.latest_score < 4.5).length;
    const recentScans = patients.filter(p => {
      if (!p.last_session_at) return false;
      return (Date.now() - new Date(p.last_session_at)) / 86400000 <= 30;
    }).length;

    // Top concerns frequency
    const concernMap = {};
    patients.forEach(p => { if (p.top_concern) concernMap[p.top_concern] = (concernMap[p.top_concern] || 0) + 1; });
    const topConcerns = Object.entries(concernMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Score distribution buckets
    const scoreBuckets = { "Excellent (8–10)": 0, "Good (6–8)": 0, "Fair (4–6)": 0, "Needs Attention (<4)": 0 };
    patients.forEach(p => {
      if (p.latest_score == null) return;
      if (p.latest_score >= 8) scoreBuckets["Excellent (8–10)"]++;
      else if (p.latest_score >= 6) scoreBuckets["Good (6–8)"]++;
      else if (p.latest_score >= 4) scoreBuckets["Fair (4–6)"]++;
      else scoreBuckets["Needs Attention (<4)"]++;
    });

    // Fitzpatrick distribution
    const fitzMap = {};
    patients.forEach(p => { if (p.fitzpatrick) fitzMap[p.fitzpatrick] = (fitzMap[p.fitzpatrick] || 0) + 1; });

    // Priority patients: high score concern, most recent
    const priority = [...patients]
      .filter(p => p.latest_score != null)
      .sort((a, b) => a.latest_score - b.latest_score)
      .slice(0, 5);

    // Avg score
    const scored = patients.filter(p => p.latest_score != null);
    const avgScore = scored.length ? (scored.reduce((s, p) => s + p.latest_score, 0) / scored.length).toFixed(1) : null;

    // Unanalyzed
    const unanalyzed = total - analyzed;

    return { total, analyzed, highPriority, recentScans, topConcerns, scoreBuckets, fitzMap, priority, avgScore, unanalyzed };
  }, [patients]);

  const insights = useMemo(() => {
    const list = [];
    if (data.highPriority > 0) {
      list.push({
        type: "warn",
        title: `${data.highPriority} patient${data.highPriority > 1 ? "s" : ""} need immediate attention`,
        desc: `Skin scores below 4.5 — recommend scheduling follow-up consultations.`,
        cta: "Review patients",
      });
    }
    if (data.unanalyzed > 0) {
      list.push({
        type: "info",
        title: `${data.unanalyzed} patient${data.unanalyzed > 1 ? "s" : ""} haven't been analyzed yet`,
        desc: `Completing AI skin analysis could reveal treatment opportunities.`,
        cta: "View unanalyzed",
      });
    }
    if (data.topConcerns[0]) {
      list.push({
        type: "teal",
        title: `"${data.topConcerns[0][0]}" is your most common patient concern`,
        desc: `${data.topConcerns[0][1]} patient${data.topConcerns[0][1] > 1 ? "s" : ""} share this as their top skin concern. Consider featuring related treatments.`,
        cta: "See breakdown",
      });
    }
    while (list.length < 3) {
      list.push({
        type: "teal",
        title: `Average skin score across practice: ${data.avgScore || "—"}`,
        desc: `Based on ${data.analyzed} analyzed patients. Track this over time to measure treatment effectiveness.`,
        cta: null,
      });
    }
    return list.slice(0, 3);
  }, [data]);

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Practice Overview
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Patient intelligence across your full practice
          {search && ` · Filtering for "${search}"`}
        </p>
      </div>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KPITile label="Total Patients" value={loading ? "—" : data.total} sub="In database" />
        <KPITile label="AI Analyzed" value={loading ? "—" : data.analyzed} sub={`${data.total ? Math.round((data.analyzed / data.total) * 100) : 0}% of roster`} accent />
        <KPITile label="High Priority" value={loading ? "—" : data.highPriority} sub="Score below 4.5" warn={data.highPriority > 0} />
        <KPITile label="Scans This Month" value={loading ? "—" : data.recentScans} sub="Last 30 days" />
      </div>

      {/* Insights row */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
        </div>
      )}

      {/* Two-column: priority list + analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>

        {/* Priority patients */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Patients needing attention</div>
              <div style={cardSub}>Lowest skin scores — prioritized for follow-up.</div>
            </div>
            <button onClick={() => {}} style={linkBtn}>View all patients →</button>
          </div>

          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
          ) : data.priority.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No analyzed patients yet.</div>
          ) : data.priority.map((p, i) => (
            <div key={p.id} onClick={() => onSelectPatient(p)} style={{
              display: "grid", gridTemplateColumns: "36px 1fr auto auto",
              alignItems: "center", gap: 12,
              padding: "12px 18px",
              borderBottom: i < data.priority.length - 1 ? "1px solid var(--border)" : "none",
              cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: `hsl(${(p.name.charCodeAt(0) * 7) % 360}, 40%, 88%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11.5, fontWeight: 700,
                color: `hsl(${(p.name.charCodeAt(0) * 7) % 360}, 50%, 30%)`,
              }}>
                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                  {p.top_concern || "No concern noted"}
                  {p.last_session_at && ` · ${timeAgo(p.last_session_at)}`}
                </div>
              </div>
              <UrgencyPill score={p.latest_score} />
              <ScoreBadge score={p.latest_score} />
            </div>
          ))}
        </div>

        {/* Analytics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Top concerns */}
          <div style={card}>
            <div style={cardHead}>
              <div style={cardTitle}>Top patient concerns</div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              {data.topConcerns.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>No data yet.</div>
              ) : data.topConcerns.map(([concern, count], i) => {
                const max = data.topConcerns[0][1];
                return (
                  <div key={i} style={{ marginBottom: i < data.topConcerns.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{concern}</span>
                      <span style={{ color: "var(--text-muted)" }}>{count}</span>
                    </div>
                    <div style={{ background: "var(--bg)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: "var(--teal)", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score distribution */}
          <div style={card}>
            <div style={cardHead}>
              <div style={cardTitle}>Score distribution</div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              {Object.entries(data.scoreBuckets).map(([label, count], i, arr) => {
                const colors = ["var(--green)", "var(--teal)", "var(--amber)", "var(--red)"];
                const max = Math.max(...Object.values(data.scoreBuckets), 1);
                return (
                  <div key={label} style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                      <span style={{ color: "var(--text-muted)" }}>{count}</span>
                    </div>
                    <div style={{ background: "var(--bg)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: colors[i], borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const colors = {
    warn: { bg: "var(--amber-subtle)", border: "#f5d9a0", dot: "var(--amber)", text: "var(--amber)" },
    info: { bg: "#e5edfb", border: "#c9d8f3", dot: "#2a6fdb", text: "#2a6fdb" },
    teal: { bg: "var(--teal-subtle)", border: "#b3d8db", dot: "var(--teal)", text: "var(--teal)" },
  };
  const c = colors[insight.type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.35 }}>{insight.title}</div>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: insight.cta ? 12 : 0, paddingLeft: 16 }}>{insight.desc}</div>
      {insight.cta && (
        <div style={{ paddingLeft: 16 }}>
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: c.text, fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-body)" }}>
            {insight.cta} →
          </button>
        </div>
      )}
    </div>
  );
}

function KPITile({ label, value, sub, accent, warn }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12, padding: "15px 17px",
      border: warn ? "1px solid #f5d9a0" : "1px solid var(--border)",
      borderLeft: warn ? "4px solid var(--amber)" : accent ? "4px solid var(--teal)" : "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1,
        color: warn ? "var(--amber)" : accent ? "var(--teal)" : "var(--text-primary)",
      }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 7 }}>{sub}</div>
    </div>
  );
}

function UrgencyPill({ score }) {
  if (score == null) return <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>No scan</span>;
  if (score < 4) return <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "var(--red-subtle)", border: "1px solid #f5c6c6", color: "var(--red)" }}>High priority</span>;
  if (score < 5.5) return <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "var(--amber-subtle)", border: "1px solid #f5d9a0", color: "var(--amber)" }}>Follow-up</span>;
  return <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "var(--green-subtle)", border: "1px solid #bbddd0", color: "var(--green)" }}>On track</span>;
}

function ScoreBadge({ score }) {
  if (score == null) return <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: 32, textAlign: "right" }}>—</span>;
  const color = score >= 7.5 ? "var(--green)" : score >= 5.5 ? "var(--teal)" : score >= 4 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%",
      border: `2px solid ${color}`, background: `${color}15`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-mono)",
    }}>
      {score.toFixed(1)}
    </div>
  );
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Shared styles
const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" };
const cardHead = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--border)" };
const cardTitle = { fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-primary)", fontWeight: 400 };
const cardSub = { fontSize: 12, color: "var(--text-muted)", marginTop: 1 };
const linkBtn = { background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-body)", padding: 0, whiteSpace: "nowrap" };
