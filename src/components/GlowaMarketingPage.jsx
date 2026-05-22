import { useState } from "react";

const channels = [
  {
    id: "instagram",
    label: "IG",
    name: "Instagram",
    handle: "@endlessyouthmedspa",
    iconBg: "#fdebef", iconColor: "#c13584",
    stats: [{ v: "3,412", k: "Followers" }, { v: "5.1%", k: "Engagement" }],
    connected: true,
  },
  {
    id: "google",
    label: "G",
    name: "Google Business",
    handle: "Endless Youth Medspa",
    iconBg: "#fef3e2", iconColor: "#ea8c00",
    stats: [{ v: "4.9", k: "Rating" }, { v: "47", k: "Reviews" }],
    connected: true,
  },
  {
    id: "realself",
    label: "RS",
    name: "RealSelf",
    handle: "Not connected",
    iconBg: "var(--bg)", iconColor: "var(--text-muted)",
    stats: [{ v: "—", k: "Worth It %" }, { v: "—", k: "Reviews" }],
    connected: false,
  },
];

const suggestions = [
  {
    title: "Renew your EMDR Botox Advanced cert",
    desc: "Expires in 34 days. Renewal requires 8 CE hours — 4 still needed.",
    action: "Plan renewal",
    iconPath: "M3 5h9M3 9h6M3 13h9",
  },
  {
    title: "Post a before/after treatment result on Instagram",
    desc: "Accounts in your category that post 3×/week see 38% more DM inquiries.",
    action: "Draft post",
    iconPath: "M4 6h16M4 12h10M4 18h16",
  },
  {
    title: "Claim your RealSelf directory listing",
    desc: "68% of medspa clients in your area check RealSelf before booking.",
    action: "Start",
    iconPath: "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M8 12l3 3 5-6",
  },
  {
    title: "Ask 3 long-standing clients for a Google review",
    desc: "We'll draft a privacy-conscious request you can adapt and send.",
    action: "Open template",
    iconPath: "M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z",
  },
];

const repBreakdown = [
  { stars: 5, count: 38, pct: 80 },
  { stars: 4, count: 7, pct: 15 },
  { stars: 3, count: 2, pct: 4 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

const reviews = [
  { source: "Google", date: "May 20, 2026", stars: 5, body: "\"Absolutely love this place. The staff is incredible and the results speak for themselves. Couldn't be happier with my filler treatment.\"" },
  { source: "Yelp", date: "Apr 11, 2026", stars: 5, body: "\"Felt so comfortable from the moment I walked in. The consultation was honest, not pushy at all. Will definitely be back.\"" },
];

const goals = [
  { label: "Grow Instagram to 5,000 followers", current: 3412, total: 5000 },
  { label: "Reach 50 Google reviews", current: 47, total: 50 },
  { label: "Publish 2 blog posts / month", current: 1, total: 2 },
  { label: "Respond to all reviews within 48 hrs", current: 9, total: 12 },
];

const resources = [
  { title: "Client intake templates", desc: "Editable forms vetted by clinical & legal advisors.", link: "Browse templates →", iconPath: "M4 19V6a2 2 0 012-2h8l6 6v9a2 2 0 01-2 2H6a2 2 0 01-2-2z M14 4v6h6" },
  { title: "Content calendar starter", desc: "12 weeks of post ideas tailored to your specialty.", link: "Open calendar →", iconPath: "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M12 7v5l3 2" },
  { title: "Instagram for medspas guide", desc: "Grow your practice with proven aesthetic content strategies.", link: "Read guide →", iconPath: "M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.7 1.7 4.8 4.8.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.1-1.6 4.7-4.8 4.8-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.1-.1-4.7-1.6-4.8-4.8C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.2 8.4 2.2 8.8 2.2 12 2.2z M12 7a5 5 0 100 10A5 5 0 0012 7z" },
];

export default function GlowaMarketingPage() {
  const [repTab, setRepTab] = useState("overview");

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Glowa Marketing
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", maxWidth: 520 }}>
            Your online presence, reputation, and growth actions — all in one command center.
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={ghostBtn}>
            <DownloadIcon /> Export
          </button>
          <button style={primaryBtn}>
            <PlusIcon /> Add channel
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatTile icon={<StarIcon />} label="Reputation score" value="4.9" foot={<>Based on <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>47 reviews</span></>} />
        <StatTile icon={<UsersIcon />} label="Total audience" value="3,412" foot={<><span style={{ color: "var(--green)", fontWeight: 600 }}>+8%</span> across channels this month</>} />
        <StatTile icon={<ChartIcon />} label="Avg engagement" value="5.1%" foot={<><span style={{ color: "var(--green)", fontWeight: 600 }}>+0.4%</span> vs last month</>} />
        <StatTile icon={<ZapIcon />} label="Pending actions" value="4" foot="Suggested steps waiting" />
      </div>

      {/* Row 1: Channels + Suggestions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Connected channels */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Connected channels</div>
              <div style={cardSub}>Performance across your public-facing profiles.</div>
            </div>
            <button style={{ ...linkBtn, marginLeft: "auto" }}>Manage connections</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {channels.map((ch, i) => (
              <div key={ch.id} style={{
                padding: "16px 18px",
                borderRight: i < channels.length - 1 ? "1px solid var(--border)" : "none",
                opacity: ch.connected ? 1 : 0.75,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: ch.iconBg, color: ch.iconColor,
                    display: "grid", placeItems: "center",
                    fontWeight: 700, fontSize: 12.5,
                    border: "1px solid var(--border)",
                  }}>{ch.label}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{ch.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{ch.handle}</div>
                  </div>
                </div>
                {ch.connected ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {ch.stats.map(s => (
                      <div key={s.k}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--text-primary)", lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{s.k}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button style={{ ...ghostBtn, width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 10px", marginTop: 8 }}>
                    + Connect profile
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggested next steps */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Suggested next steps</div>
              <div style={cardSub}>Small actions that compound over time.</div>
            </div>
            <button style={{ ...linkBtn, marginLeft: "auto" }}>Dismiss all</button>
          </div>

          {suggestions.map((s, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "28px 1fr auto",
              gap: 12, padding: "13px 18px",
              borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "start",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--teal-subtle)", color: "var(--teal)", display: "grid", placeItems: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.iconPath} />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
              <button style={{ ...ghostBtn, padding: "5px 10px", fontSize: 12, whiteSpace: "nowrap", alignSelf: "center" }}>{s.action}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Reputation + Business goals */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Reputation */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Reputation</div>
              <div style={cardSub}>Aggregated from connected directories & review sites.</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {["overview", "reviews"].map(t => (
                <button key={t} onClick={() => setRepTab(t)} style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                  border: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-body)",
                  background: repTab === t ? "var(--teal-subtle)" : "var(--surface)",
                  color: repTab === t ? "var(--teal)" : "var(--text-muted)",
                }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {repTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center", padding: "18px 18px", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1, color: "var(--text-primary)" }}>
                    4.9<span style={{ fontSize: 20, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>/5</span>
                  </div>
                  <div style={{ display: "flex", gap: 2, marginTop: 5, color: "#d8b330" }}>
                    {[...Array(5)].map((_, i) => <StarFilledIcon key={i} />)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>Based on 47 reviews</div>
                </div>
                <div style={{ display: "grid", gap: 5 }}>
                  {repBreakdown.map(r => (
                    <div key={r.stars} style={{ display: "grid", gridTemplateColumns: "18px 1fr 28px", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      <span>{r.stars}★</span>
                      <div style={{ background: "var(--bg)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${r.pct}%`, height: "100%", background: "var(--teal)", borderRadius: 3 }} />
                      </div>
                      <span>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {reviews.map((r, i) => (
                <div key={i} style={{ padding: "13px 18px", borderBottom: i < reviews.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12, color: "var(--text-muted)" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{r.source}</span>
                    <span>·</span><span>{r.date}</span>
                    <span>·</span><span style={{ color: "#d8b330" }}>{"★".repeat(r.stars)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{r.body}</div>
                </div>
              ))}
            </>
          )}

          {repTab === "reviews" && (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              47 total reviews across Google, Yelp, and RealSelf · <span style={{ color: "var(--teal)", cursor: "pointer", fontWeight: 600 }}>Connect more sources →</span>
            </div>
          )}
        </div>

        {/* Business goals */}
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Quarterly business goals</div>
              <div style={cardSub}>Targets set in Settings → Goals.</div>
            </div>
            <button style={{ ...linkBtn, marginLeft: "auto" }}>Edit goals</button>
          </div>

          {goals.map((g, i) => {
            const pct = Math.round((g.current / g.total) * 100);
            return (
              <div key={i} style={{ padding: "14px 18px", borderBottom: i < goals.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{g.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{g.current.toLocaleString()}</span> / {g.total.toLocaleString()}
                  </div>
                </div>
                <div style={{ background: "var(--bg)", height: 7, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`, height: "100%",
                    background: pct >= 90 ? "var(--green)" : "var(--teal)",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-primary)", marginBottom: 14, fontWeight: 400 }}>Resources for your practice</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {resources.map((r, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "17px 18px", display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--teal-subtle)", color: "var(--teal)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={r.iconPath} />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-primary)", marginBottom: 4, fontWeight: 400 }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{r.desc}</div>
                <div style={{ color: "var(--teal)", fontSize: 12.5, fontWeight: 600, marginTop: 8, cursor: "pointer" }}>{r.link}</div>
              </div>
            </div>
          ))}
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
const StarIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 1.5l1.4 3.4 3.6.3-2.7 2.4 0.9 3.5L6.5 9.4 3.3 11.1l0.9-3.5-2.7-2.4 3.6-.3z" /></svg>;
const StarFilledIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1.5l1.6 3.9 4.2.4-3.1 2.7 1 4L7 10.2 4.3 12.5l1-4-3.1-2.7 4.2-.4z" /></svg>;
const UsersIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="4.5" cy="4" r="2.2" /><path d="M1 11c.7-2.2 2.2-3.5 3.5-3.5S7.8 8.8 8.5 11" /><circle cx="9.5" cy="4.5" r="1.8" /><path d="M12 10c-.3-1.5-1.4-2.5-2.7-2.5" /></svg>;
const ChartIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,9.5 4,6 6,7.5 10,3" /><path d="M8.5 3h1.5v1.5" /></svg>;
const ZapIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1.5L3 7h4l-1.5 4.5L11 6H7z" /></svg>;
