// ── ProgressPage.jsx ──────────────────────────────────────────
// Patient progress tracking with mock data.
// When real multi-session data exists, replace MOCK_PATIENT and
// MOCK_SESSIONS with API calls to /api/dashboard/patients/:id/progress
// ─────────────────────────────────────────────────────────────

const MOCK_PATIENT = {
  name: "Sarah Chen",
  age: 34,
  fitzpatrick: "Type II",
  glogau_start: "Class 2",
  first_visit: "Nov 14, 2025",
  primary_goals: ["Acne & Blemishes", "Pigmentation", "Pore Visibility"],
};

// Scores are 0–100 (higher = healthier skin, matching MakeupAR convention)
const MOCK_SESSIONS = [
  {
    id: 1,
    label: "Session 1",
    date: "Nov 14, 2025",
    treatment: "Initial Assessment",
    overall: 58,
    scores: { wrinkles: 72, pore: 54, acne: 41, age_spot: 63 },
    notes: "Baseline intake. Moderate acne activity across T-zone and cheeks. Visible pore dilation. Mild pigmentation from prior breakouts.",
    glogau: "Class 2",
  },
  {
    id: 2,
    label: "Session 2",
    date: "Jan 8, 2026",
    treatment: "Chemical Peel (Jessner's 20%)",
    overall: 67,
    scores: { wrinkles: 74, pore: 61, acne: 58, age_spot: 72 },
    notes: "Noticeable reduction in active lesions. Pore appearance improved post-peel. Some residual post-inflammatory hyperpigmentation persisting on left cheek.",
    glogau: "Class 2",
  },
  {
    id: 3,
    label: "Session 3",
    date: "Feb 22, 2026",
    treatment: "IPL Photofacial",
    overall: 74,
    scores: { wrinkles: 77, pore: 68, acne: 72, age_spot: 81 },
    notes: "Significant clearing of PIH. Active acne minimal. Pore tightening continuing. Age spot score improved sharply with IPL.",
    glogau: "Class 1-2",
  },
  {
    id: 4,
    label: "Session 4",
    date: "Apr 10, 2026",
    treatment: "Hydrafacial + LED",
    overall: 81,
    scores: { wrinkles: 80, pore: 75, acne: 84, age_spot: 86 },
    notes: "Skin in best condition since intake. Acne fully cleared. Pigmentation nearly resolved. Maintenance protocol recommended going forward.",
    glogau: "Class 1",
  },
];

const CONCERN_LABELS = {
  wrinkles: "Wrinkles",
  pore: "Pore Visibility",
  acne: "Acne / Blemishes",
  age_spot: "Age Spots",
};

const CONCERN_COLORS = {
  wrinkles: "#8B5CF6",
  pore: "#0E7A8A",
  age_spot: "#D97706",
  acne: "#DC2626",
};

function scoreColor(v) {
  if (v >= 80) return "var(--green)";
  if (v >= 60) return "var(--amber)";
  return "var(--red)";
}

function scoreDelta(curr, prev) {
  const d = curr - prev;
  if (d === 0) return null;
  return { value: d, positive: d > 0 };
}

export default function ProgressPage() {
  const first = MOCK_SESSIONS[0];
  const last = MOCK_SESSIONS[MOCK_SESSIONS.length - 1];
  const [activeSession, setActiveSession] = useState(last.id);
  const selected = MOCK_SESSIONS.find(s => s.id === activeSession);
  const prevSession = MOCK_SESSIONS.find(s => s.id === activeSession - 1);

  const overallDelta = last.overall - first.overall;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Patient Progress
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            {MOCK_PATIENT.name}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            {MOCK_PATIENT.age} yrs · {MOCK_PATIENT.fitzpatrick} · First visit {MOCK_PATIENT.first_visit}
          </div>
        </div>
        <MockBadge />
      </div>

      {/* ── Top KPI strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiCard
          label="Overall Improvement"
          value={`+${overallDelta} pts`}
          sub={`${first.overall} → ${last.overall}`}
          color="var(--green)"
        />
        <KpiCard
          label="Sessions Completed"
          value={MOCK_SESSIONS.length}
          sub={`${first.date} – ${last.date}`}
          color="var(--teal)"
        />
        <KpiCard
          label="Best Improvement"
          value="Acne / Blemishes"
          sub={`+${last.scores.acne - first.scores.acne} pts`}
          color={CONCERN_COLORS.acne}
        />
        <KpiCard
          label="Current Glogau"
          value={last.glogau}
          sub={`Started at ${first.glogau}`}
          color="var(--text-secondary)"
        />
      </div>

      {/* ── Score trend chart ── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <SectionHeader title="Score Trends Over Time" />
        <div style={{ padding: "20px 24px" }}>
          <TrendChart sessions={MOCK_SESSIONS} />
        </div>
      </div>

      {/* ── Session timeline + detail ── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <SectionHeader title="Session Timeline" />
          {MOCK_SESSIONS.map((s, i) => {
            const isActive = s.id === activeSession;
            const prev = MOCK_SESSIONS[i - 1];
            const delta = prev ? s.overall - prev.overall : null;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  borderBottom: i < MOCK_SESSIONS.length - 1 ? "1px solid var(--border)" : "none",
                  background: isActive ? "var(--teal-subtle)" : "transparent",
                  borderLeft: `3px solid ${isActive ? "var(--teal)" : "transparent"}`,
                  transition: "all 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "var(--teal)" : "var(--text-primary)" }}>
                    {s.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {delta !== null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? "var(--green)" : "var(--red)" }}>
                        {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
                      </span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(s.overall) }}>{s.overall}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{s.date}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontStyle: "italic" }}>{s.treatment}</div>
              </div>
            );
          })}
        </div>

        {/* Session detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Treatment header */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    {selected.label} — {selected.treatment}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{selected.date}</div>
                </div>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  border: `3px solid ${scoreColor(selected.overall)}`,
                  background: `${scoreColor(selected.overall)}12`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(selected.overall), lineHeight: 1, fontFamily: "var(--font-display)" }}>{selected.overall}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>score</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                {selected.notes}
              </p>
            </div>

            {/* Per-concern scores */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <SectionHeader title="Concern Scores" />
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(selected.scores).map(([key, val]) => {
                  const delta = prevSession ? scoreDelta(val, prevSession.scores[key]) : null;
                  const baseline = first.scores[key];
                  const totalDelta = val - baseline;
                  const color = CONCERN_COLORS[key] || "var(--teal)";
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{CONCERN_LABELS[key]}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {delta && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: delta.positive ? "var(--green)" : "var(--red)" }}>
                              {delta.positive ? "▲" : "▼"} {Math.abs(delta.value)} this session
                            </span>
                          )}
                          {selected.id > 1 && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {totalDelta > 0 ? "+" : ""}{totalDelta} from baseline
                            </span>
                          )}
                          <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(val), minWidth: 28, textAlign: "right" }}>{val}</span>
                        </div>
                      </div>
                      {/* Stacked bar: baseline ghost + current fill */}
                      <div style={{ position: "relative", height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                        {/* Baseline ghost */}
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${baseline}%`,
                          background: `${color}28`,
                          borderRadius: 4,
                        }} />
                        {/* Current fill */}
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${val}%`,
                          background: color,
                          borderRadius: 4,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Baseline: {baseline}</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Current: {val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Concern-by-concern improvement summary ── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <SectionHeader title="Full Progress Summary — Baseline vs. Latest" />
        <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {Object.keys(first.scores).map(key => {
            const start = first.scores[key];
            const end = last.scores[key];
            const delta = end - start;
            const color = CONCERN_COLORS[key] || "var(--teal)";
            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{CONCERN_LABELS[key]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Start</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(start), fontFamily: "var(--font-display)" }}>{start}</div>
                  </div>
                  <div style={{ fontSize: 18, color: "var(--text-muted)" }}>→</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Now</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(end), fontFamily: "var(--font-display)" }}>{end}</div>
                  </div>
                </div>
                <div style={{
                  textAlign: "center", fontSize: 12, fontWeight: 700,
                  color: delta > 0 ? "var(--green)" : "var(--red)",
                  background: delta > 0 ? "var(--green-subtle)" : "var(--red-subtle)",
                  borderRadius: 6, padding: "4px 0",
                }}>
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function MockBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#FFF7ED", border: "1px solid #FED7AA",
      borderRadius: 6, padding: "6px 12px", flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706" }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>Mock Data — Replace with real patient sessions</span>
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1.1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{
      padding: "12px 20px", borderBottom: "1px solid var(--border)",
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.07em", color: "var(--text-secondary)",
      background: "var(--bg)",
    }}>{title}</div>
  );
}

function TrendChart({ sessions }) {
  const concerns = Object.keys(sessions[0].scores);
  const width = 600;
  const height = 180;
  const padL = 36, padR = 16, padT = 16, padB = 32;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const xStep = chartW / (sessions.length - 1);

  function yPos(val) {
    return padT + chartH - ((val - 30) / 70) * chartH;
  }

  function xPos(i) {
    return padL + i * xStep;
  }

  function pathFor(key) {
    return sessions.map((s, i) => {
      const x = xPos(i);
      const y = yPos(s.scores[key]);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");
  }

  // Overall score path
  function overallPath() {
    return sessions.map((s, i) => {
      const x = xPos(i);
      const y = yPos(s.overall);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");
  }

  // Y-axis gridlines
  const gridLines = [40, 55, 70, 85, 100];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Grid lines */}
        {gridLines.map(v => (
          <g key={v}>
            <line
              x1={padL} y1={yPos(v)} x2={width - padR} y2={yPos(v)}
              stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4"
            />
            <text x={padL - 6} y={yPos(v) + 4} textAnchor="end" fontSize={9} fill="var(--text-muted)">{v}</text>
          </g>
        ))}

        {/* Concern lines */}
        {concerns.map(key => (
          <path
            key={key}
            d={pathFor(key)}
            fill="none"
            stroke={CONCERN_COLORS[key]}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Overall score line — bold */}
        <path
          d={overallPath()}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Overall score dots */}
        {sessions.map((s, i) => (
          <circle
            key={s.id}
            cx={xPos(i)} cy={yPos(s.overall)}
            r={4}
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth={2}
          />
        ))}

        {/* X-axis labels */}
        {sessions.map((s, i) => (
          <g key={s.id}>
            <text x={xPos(i)} y={height - 4} textAnchor="middle" fontSize={9} fill="var(--text-muted)">{s.label}</text>
            <text x={xPos(i)} y={height - 14} textAnchor="middle" fontSize={8} fill="var(--border)">{s.date.split(",")[0]}</text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingLeft: padL }}>
        <LegendItem color="var(--teal)" label="Overall Score" bold />
        {concerns.map(key => (
          <LegendItem key={key} color={CONCERN_COLORS[key]} label={CONCERN_LABELS[key]} />
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label, bold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: bold ? 18 : 14, height: bold ? 3 : 2, background: color, borderRadius: 2, opacity: bold ? 1 : 0.6 }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: bold ? 700 : 400 }}>{label}</span>
    </div>
  );
}

// Need useState import at the top — add it here
import { useState } from "react";
