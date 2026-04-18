export default function PatientList({ patient: p, onSelectSession, selectedSessionId }) {
  const hasFlags = (p.medical_flags || []).length > 0;
  const sessions = p.sessions || [];

  return (
    <div>
      {/* Patient header */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "24px 28px", marginBottom: 24,
        display: "grid", gridTemplateColumns: "1fr auto",
        alignItems: "start", gap: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: `hsl(${((p.name.charCodeAt(0) * 7) % 360)}, 40%, 88%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
              color: `hsl(${((p.name.charCodeAt(0) * 7) % 360)}, 50%, 30%)`,
              flexShrink: 0,
            }}>
              {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px", fontFamily: "var(--font-display)", marginBottom: 3 }}>
                {p.name}
              </h1>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                {p.age && `Age ${p.age}`}
                {p.email && ` · ${p.email}`}
                {p.phone && ` · ${p.phone}`}
              </div>
            </div>
          </div>

          {/* Classification chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.fitzpatrick && <ClassChip label="Fitzpatrick" value={`Type ${p.fitzpatrick}`} />}
            {p.glogau && <ClassChip label="Glogau" value={`Class ${p.glogau}`} />}
            {p.skin_type && <ClassChip label="Skin Type" value={p.skin_type} />}
            {p.sensitivity && <ClassChip label="Sensitivity" value={p.sensitivity} />}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>Latest Score</div>
          {p.latest_score != null ? (
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              border: `3px solid ${scoreColor(p.latest_score)}`,
              background: `${scoreColor(p.latest_score)}12`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginLeft: "auto",
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(p.latest_score), fontFamily: "var(--font-display)" }}>
                {p.latest_score.toFixed(1)}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>—</span>
          )}
        </div>
      </div>

      {/* Medical flags */}
      {hasFlags && (
        <div style={{
          background: "var(--red-subtle)", border: "1px solid var(--red)",
          borderRadius: 10, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Clinical Flags</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.medical_flags.map((f, i) => (
                <span key={i} style={{
                  padding: "3px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500,
                  background: "white", border: "1px solid var(--red)",
                  color: "var(--red)",
                }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>
          Intake Sessions ({sessions.length})
        </div>
        {sessions.length === 0 ? (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "40px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No sessions yet for this patient.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                active={selectedSessionId === s.id}
                onClick={() => onSelectSession(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session: s, active, onClick }) {
  // has_analysis / skin_score / photo_count are populated on session detail load,
  // not in the patient list response — show what we have, degrade gracefully.
  const hasAnalysis = s.has_analysis;  // may be undefined until detail is fetched
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "var(--teal-subtle)" : "var(--surface)",
        border: `1px solid ${active ? "var(--teal)" : "var(--border)"}`,
        borderRadius: 10, padding: "16px 20px",
        cursor: "pointer", transition: "all 0.12s",
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center", gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "var(--teal)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Intake · {formatDate(s.created_at)}
          </span>
          {hasAnalysis === true && (
            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, background: "var(--teal-subtle)", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Analysis Ready</span>
          )}
          {hasAnalysis === false && (
            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 600, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>No Analysis</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {s.goals_summary ? `Goals: ${s.goals_summary}` : "Open to view session details"}
          {s.photo_count > 0 && ` · ${s.photo_count} photo${s.photo_count !== 1 ? "s" : ""}`}
        </div>
      </div>

      {s.skin_score != null && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 3 }}>Score</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(s.skin_score), fontFamily: "var(--font-display)" }}>{s.skin_score.toFixed(1)}</div>
        </div>
      )}

      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
        <path d="M6 3l5 5-5 5"/>
      </svg>
    </div>
  );
}

function ClassChip({ label, value }) {
  return (
    <div style={{
      display: "flex", gap: 0,
      border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden",
      fontSize: 11.5,
    }}>
      <span style={{ padding: "4px 8px", background: "var(--bg)", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ padding: "4px 9px", background: "var(--surface)", color: "var(--text-primary)", fontWeight: 600, borderLeft: "1px solid var(--border)" }}>{value}</span>
    </div>
  );
}

function scoreColor(s) {
  return s >= 7.5 ? "var(--green)" : s >= 5.5 ? "var(--teal)" : s >= 4 ? "var(--amber)" : "var(--red)";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
