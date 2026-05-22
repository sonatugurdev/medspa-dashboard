import { useState, useMemo } from "react";

const STATUS_CONFIG = {
  high: { label: "High Priority", bg: "var(--red-subtle)", color: "var(--red)", border: "#f5c6c6" },
  follow: { label: "Follow-up", bg: "var(--amber-subtle)", color: "var(--amber)", border: "#f5d9a0" },
  ontrack: { label: "On Track", bg: "var(--green-subtle)", color: "var(--green)", border: "#bbddd0" },
  noscan: { label: "Needs Scan", bg: "var(--bg)", color: "var(--text-muted)", border: "var(--border)" },
};

function getStatus(p) {
  if (p.latest_score == null) return "noscan";
  if (p.latest_score < 4) return "high";
  if (p.latest_score < 5.5) return "follow";
  return "ontrack";
}

function scoreStars(score) {
  if (score == null) return 0;
  return Math.round((score / 10) * 5);
}

export default function PatientsPage({ patients, loading, onSelectPatient, search, onSearchChange }) {
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    let list = [...patients];
    if (search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      list = list.filter(p => getStatus(p) === filterStatus);
    }
    list.sort((a, b) => {
      if (sortBy === "recent") return new Date(b.last_session_at || 0) - new Date(a.last_session_at || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "score") return (b.latest_score ?? -1) - (a.latest_score ?? -1);
      if (sortBy === "priority") return (a.latest_score ?? 99) - (b.latest_score ?? 99);
      return 0;
    });
    return list;
  }, [patients, search, filterStatus, sortBy]);

  const counts = useMemo(() => ({
    all: patients.length,
    high: patients.filter(p => getStatus(p) === "high").length,
    follow: patients.filter(p => getStatus(p) === "follow").length,
    ontrack: patients.filter(p => getStatus(p) === "ontrack").length,
    noscan: patients.filter(p => getStatus(p) === "noscan").length,
  }), [patients]);

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Patients
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
            {loading ? "Loading…" : `${counts.all} patient${counts.all !== 1 ? "s" : ""} in your practice`}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={ghostBtn}>
            <DownloadIcon /> Export
          </button>
          <button style={primaryBtn}>
            <PlusIcon /> Add patient
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
        padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
        marginBottom: 16, flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="5.5" cy="5.5" r="3.5" /><path d="M11 11l-2.2-2.2" />
          </svg>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search patients…"
            style={{
              padding: "6px 10px 6px 28px", borderRadius: 6,
              border: "1px solid var(--border)", background: "var(--bg)",
              fontSize: 12.5, color: "var(--text-primary)", outline: "none",
              width: "100%", fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

        {/* Status filter */}
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Status</span>
        {[["all", "All"], ["high", "High Priority"], ["follow", "Follow-up"], ["ontrack", "On Track"], ["noscan", "Needs Scan"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilterStatus(key)} style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            border: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-body)",
            background: filterStatus === key ? "var(--teal-subtle)" : "transparent",
            color: filterStatus === key ? "var(--teal)" : "var(--text-muted)",
          }}>
            {label}
            {key !== "all" && <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts[key]})</span>}
            {key === "all" && <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts.all})</span>}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Sort</span>
          {[["recent", "Recent"], ["priority", "Priority"], ["score", "Score"], ["name", "Name"]].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)} style={{
              padding: "5px 9px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              border: `1px solid ${sortBy === val ? "var(--teal)" : "var(--border)"}`,
              background: sortBy === val ? "var(--teal-subtle)" : "transparent",
              color: sortBy === val ? "var(--teal)" : "var(--text-muted)",
              cursor: "pointer", fontFamily: "var(--font-body)",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "28px 1fr 130px 140px 100px 80px 80px 100px",
          gap: 0, padding: "8px 18px",
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
        }}>
          {["", "Patient", "Status", "Top Concern", "Score", "Sessions", "Last Scan", ""].map((h, i) => (
            <div key={i} style={{
              fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--text-muted)", padding: "4px 0",
            }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading patients…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>No patients found</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{search ? `No results for "${search}"` : "Try a different filter"}</div>
          </div>
        ) : filtered.map((p, i) => (
          <PatientRow key={p.id} patient={p} even={i % 2 === 0} onClick={() => onSelectPatient(p)} isLast={i === filtered.length - 1} />
        ))}
      </div>

      {filtered.length > 0 && !loading && (
        <div style={{ padding: "12px 4px", fontSize: 12, color: "var(--text-muted)" }}>
          Showing {filtered.length} of {counts.all} patients
        </div>
      )}
    </div>
  );
}

function PatientRow({ patient: p, even, onClick, isLast }) {
  const status = getStatus(p);
  const sc = STATUS_CONFIG[status];
  const stars = scoreStars(p.latest_score);

  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr 130px 140px 100px 80px 80px 100px",
        gap: 0, padding: "11px 18px",
        background: even ? "var(--surface)" : "var(--bg)",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        cursor: "pointer", alignItems: "center",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--teal-subtle)"}
      onMouseLeave={e => e.currentTarget.style.background = even ? "var(--surface)" : "var(--bg)"}
    >
      {/* Avatar */}
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: `hsl(${(p.name.charCodeAt(0) * 7) % 360}, 40%, 88%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9.5, fontWeight: 700,
        color: `hsl(${(p.name.charCodeAt(0) * 7) % 360}, 50%, 30%)`,
        flexShrink: 0,
      }}>
        {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>

      {/* Name + email */}
      <div style={{ paddingLeft: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>
          {p.age && `Age ${p.age}`}{p.email && ` · ${p.email}`}
        </div>
      </div>

      {/* Status pill */}
      <div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11.5, fontWeight: 600, padding: "3px 9px",
          borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color }} />
          {sc.label}
        </span>
      </div>

      {/* Top concern */}
      <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
        {p.top_concern || <span style={{ color: "var(--text-muted)" }}>—</span>}
      </div>

      {/* Score + stars */}
      <div>
        {p.latest_score != null ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(p.latest_score), fontFamily: "var(--font-mono)", marginBottom: 3 }}>
              {p.latest_score.toFixed(1)}
            </div>
            <div style={{ display: "flex", gap: 1 }}>
              {[...Array(5)].map((_, j) => (
                <svg key={j} width="9" height="9" viewBox="0 0 9 9" fill={j < stars ? "#d8b330" : "var(--border)"}>
                  <path d="M4.5 1L5.4 3.5H8L5.9 5.1 6.7 7.7 4.5 6.1 2.3 7.7 3.1 5.1 1 3.5H3.6z" />
                </svg>
              ))}
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
        )}
      </div>

      {/* Sessions */}
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
        {p.session_count ?? 0}
      </div>

      {/* Last scan */}
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {p.last_session_at ? timeAgo(p.last_session_at) : "—"}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button onClick={onClick} style={{
          padding: "4px 9px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
          border: "1px solid var(--border)", background: "var(--surface)",
          color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)",
        }}>View</button>
      </div>
    </div>
  );
}

function scoreColor(s) {
  return s >= 7.5 ? "var(--green)" : s >= 5.5 ? "var(--teal)" : s >= 4 ? "var(--amber)" : "var(--red)";
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

const ghostBtn = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 7, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, padding: "8px 13px", cursor: "pointer", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)" };
const primaryBtn = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 7, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, padding: "8px 13px", cursor: "pointer", border: "none", background: "var(--teal)", color: "#fff" };

const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 2v9M2 6.5h9" /></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6.5 2v7M4 7l2.5 2.5L9 7" /><path d="M2 11h9" /></svg>;
