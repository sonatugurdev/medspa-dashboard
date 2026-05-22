import { useState } from "react";

const certs = [
  { name: "Licensed Aesthetician", issuer: "State Board of Cosmetology · Lic. #AE-229184", status: "active", expires: "Nov 30, 2027" },
  { name: "Botox & Neurotoxin Certification", issuer: "American Academy of Facial Aesthetics", status: "warn", expires: "Aug 14, 2026" },
  { name: "Dermal Filler Certification", issuer: "National Laser Institute · 16 CE hours", status: "active", expires: "No expiration" },
  { name: "CPR / BLS Certification", issuer: "American Heart Association", status: "bad", expires: "Expired Mar 02, 2026" },
  { name: "HIPAA Privacy & Security", issuer: "Annual compliance · 2026", status: "active", expires: "Dec 31, 2026" },
  { name: "Laser Safety Officer", issuer: "NCLE · Lic. #LSO-44821", status: "active", expires: "Feb 20, 2028" },
];

const upcoming = [
  { month: "Jun", day: "11", title: "Advanced PDO Thread Lift Techniques", meta: ["8 CE hours", "Virtual · 10:00 AM PT", "Aesthetic Immersion"], status: "registered" },
  { month: "Jun", day: "25", title: "Regenerative Aesthetics & Exosomes", meta: ["6 CE hours · 1 day", "In-person · Beverly Hills"], status: "registered" },
  { month: "Jul", day: "14", title: "Medical Spa Compliance & Risk Management", meta: ["2 CE hours", "On-demand"], status: "saved" },
  { month: "Aug", day: "19", title: "Combination Treatment Planning for Anti-Aging", meta: ["12 CE hours · 2 days", "Aesthetic Academy"], status: null },
];

const recommended = [
  { title: "Sculptra & Biostimulators Masterclass", meta: ["10 CE hours", "AAFE · On-demand"], tag: "Trending" },
  { title: "IV Therapy & Wellness Infusions", meta: ["4 CE hours", "Virtual · July"], tag: "New" },
  { title: "Social Media Marketing for Medspas", meta: ["2 CE hours", "On-demand"], tag: null },
  { title: "Microneedling with RF: Advanced Protocols", meta: ["6 CE hours", "In-person"], tag: null },
  { title: "Functional Medicine Basics for Aesthetics", meta: ["8 CE hours", "Virtual"], tag: null },
  { title: "Weight Loss & Semaglutide Protocols", meta: ["3 CE hours", "On-demand"], tag: "Popular" },
];

const statusConfig = {
  active: { label: "Active", bg: "var(--green-subtle)", color: "var(--green)", border: "#bbddd0" },
  warn: { label: "Expiring soon", bg: "var(--amber-subtle)", color: "var(--amber)", border: "#f5d9a0" },
  bad: { label: "Expired", bg: "var(--red-subtle)", color: "var(--red)", border: "#f5c6c6" },
};

export default function GlowaAcademyPage() {
  const [trainingTab, setTrainingTab] = useState("upcoming");

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Glowa Academy
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", maxWidth: 520 }}>
            Track your certifications, CE hours, and professional training in one place.
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={ghostBtn}>
            <DownloadIcon /> Export
          </button>
          <button style={primaryBtn}>
            <PlusIcon /> Add credential
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatTile
          icon={<CertIcon />}
          label="Active certificates"
          value="6"
          foot={<><span style={{ color: "var(--amber)", fontWeight: 600 }}>2 expiring</span> in 60 days</>}
        />
        <StatTile
          icon={<CalIcon />}
          label="Upcoming trainings"
          value="3"
          foot={<>Next: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>PDO Thread Lift</span></>}
        />
        <StatTile
          icon={<CheckCircleIcon />}
          label="CE hours this year"
          value={<>22.5 <span style={{ color: "var(--text-muted)", fontSize: 18, fontWeight: 400 }}>/ 40</span></>}
          foot={<><span style={{ color: "var(--green)", fontWeight: 600 }}>+6.5</span> since last month</>}
        />
        <StatTile
          icon={<TrophyIcon />}
          label="Completed trainings"
          value="18"
          foot="All time across providers"
        />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>

        {/* Certificates */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Certificates & Licenses</div>
              <div style={cardSub}>Renewals, CE credits, and credentials.</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <button style={linkBtn}>View all</button>
              <button style={{ ...ghostBtn, padding: "5px 10px", fontSize: 12 }}>+ Add</button>
            </div>
          </div>

          {certs.map((c, i) => {
            const sc = statusConfig[c.status];
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto auto",
                alignItems: "center", gap: 14,
                padding: "13px 18px",
                borderBottom: i < certs.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{c.issuer}</div>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11.5, fontWeight: 600, padding: "3px 9px",
                  borderRadius: 999, border: `1px solid ${sc.border}`,
                  background: sc.bg, color: sc.color,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color }} />
                  {sc.label}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", minWidth: 130, textAlign: "right" }}>{c.expires}</span>
                <button style={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
                  <ChevronRightIcon />
                </button>
              </div>
            );
          })}
        </div>

        {/* Trainings */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Trainings</div>
              <div style={cardSub}>Upcoming, completed, and recommended.</div>
            </div>
            <button style={linkBtn}>Browse catalog →</button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, padding: "0 18px", borderBottom: "1px solid var(--border)" }}>
            {[["upcoming", "Upcoming", 3], ["completed", "Completed", 18], ["recommended", "Recommended", 6]].map(([key, label, count]) => (
              <button key={key} onClick={() => setTrainingTab(key)} style={{
                padding: "11px 12px", fontSize: 13, fontWeight: 600,
                color: trainingTab === key ? "var(--teal)" : "var(--text-muted)",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                borderBottom: `2px solid ${trainingTab === key ? "var(--teal)" : "transparent"}`,
                background: "transparent", cursor: "pointer",
                marginBottom: -1, fontFamily: "var(--font-body)",
              }}>
                {label} <span style={{ color: trainingTab === key ? "var(--teal)" : "var(--text-muted)", fontWeight: 400 }}>{count}</span>
              </button>
            ))}
          </div>

          {trainingTab === "upcoming" && (
            <div>
              {upcoming.map((t, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "52px 1fr auto",
                  gap: 13, padding: "13px 18px",
                  borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}>
                  <div style={{
                    width: 52, height: 52, background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 8, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1,
                  }}>
                    <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{t.month}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)" }}>{t.day}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{t.title}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {t.meta.map((m, j) => <span key={j}>{j > 0 && <span style={{ opacity: 0.4, marginRight: 10 }}>·</span>}{m}</span>)}
                    </div>
                  </div>
                  {t.status === "registered" && (
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "#e5edfb", color: "#2a6fdb", border: "1px solid #c9d8f3", whiteSpace: "nowrap" }}>
                      Registered
                    </span>
                  )}
                  {t.status === "saved" && (
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                      Saved
                    </span>
                  )}
                  {!t.status && (
                    <button style={{ ...ghostBtn, padding: "5px 10px", fontSize: 12, whiteSpace: "nowrap" }}>Register</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {trainingTab === "recommended" && (
            <div>
              {recommended.map((t, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 13,
                  padding: "13px 18px",
                  borderBottom: i < recommended.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                      {t.title}
                      {t.tag && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "var(--teal)", color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
                          {t.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3, display: "flex", gap: 10 }}>
                      {t.meta.map((m, j) => <span key={j}>{j > 0 && <span style={{ opacity: 0.4, marginRight: 10 }}>·</span>}{m}</span>)}
                    </div>
                  </div>
                  <button style={{ ...ghostBtn, padding: "5px 10px", fontSize: 12 }}>Save</button>
                </div>
              ))}
            </div>
          )}

          {trainingTab === "completed" && (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              18 completed trainings · <span style={{ color: "var(--teal)", cursor: "pointer", fontWeight: 600 }}>View full history →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, foot }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "15px 17px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>{foot}</div>
    </div>
  );
}

// Shared styles
const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" };
const cardHead = { display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderBottom: "1px solid var(--border)" };
const cardTitle = { fontFamily: "var(--font-display)", fontSize: 17, color: "var(--text-primary)", fontWeight: 400 };
const cardSub = { fontSize: 12.5, color: "var(--text-muted)", marginTop: 1 };
const ghostBtn = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 7, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, padding: "8px 13px", cursor: "pointer", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)" };
const primaryBtn = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 7, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, padding: "8px 13px", cursor: "pointer", border: "none", background: "var(--teal)", color: "#fff" };
const linkBtn = { background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-body)", padding: 0 };

// Icons
const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 2v9M2 6.5h9" /></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6.5 2v7M4 7l2.5 2.5L9 7" /><path d="M2 11h9" /></svg>;
const ChevronRightIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 3l4 3.5L5 10" /></svg>;
const CertIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h6l2.5 3.5L8 12 1.5 5.5z" /></svg>;
const CalIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="2.5" width="10" height="9" rx="1.5" /><path d="M1.5 5.5h10M4 1.5v2M9 1.5v2" /></svg>;
const CheckCircleIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="5" /><path d="M4 6.5l1.8 1.8 3.2-3.6" /></svg>;
const TrophyIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 1.5h4v4a2 2 0 01-4 0v-4z" /><path d="M1.5 2h3v2.5a1.5 1.5 0 01-3 0V2z" /><path d="M8.5 2h3v2.5a1.5 1.5 0 01-3 0V2z" /><path d="M6.5 7.5v3M4 10.5h5" /></svg>;
