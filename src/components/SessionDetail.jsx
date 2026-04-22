import { useState } from "react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "skin_analysis", label: "Skin Analysis" },
  { id: "clinical", label: "Clinical Intel" },
  { id: "treatment", label: "Treatment Plan" },
  { id: "intake", label: "Intake Data" },
];

export default function SessionDetail({ session, detail, loading }) {
  const [tab, setTab] = useState("overview");

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading session analysis…</div>
      </div>
    );
  }

  if (!detail) return null;

  const analysis = detail.analysis || {};
  const cv = analysis.cv_scores || {};
  // Merge top-level fitzpatrick/glogau into clinical so OverviewTab reads one place
  const clinical = {
    ...(analysis.clinical || {}),
    fitzpatrick_type: analysis.fitzpatrick_type || (analysis.clinical || {}).fitzpatrick_type,
    fitzpatrick_description: analysis.fitzpatrick_description,
    glogau_class: analysis.glogau_class || (analysis.clinical || {}).glogau_class,
    glogau_description: analysis.glogau_description,
  };
  const patient = detail.patient || {};
  // consent.hipaa or consent.photo = has consented
  const consentOnFile = detail.session?.consent?.hipaa || detail.session?.consent?.photo;

  return (
    <div>
      {/* Session meta */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px", fontFamily: "var(--font-display)", marginBottom: 3 }}>
            Session Analysis
          </h2>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            {formatDateTime(detail.session?.created_at)}
            {consentOnFile && (
              <span style={{ marginLeft: 10, color: "var(--green)", fontWeight: 600 }}>✓ Consent on file</span>
            )}
          </div>
        </div>
        {analysis.skin_score != null && (
          <ScoreBadge score={analysis.skin_score} />
        )}
      </div>

      {/* Two-column layout: photo + tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Photo */}
        <div>
          <PhotoPanel photos={detail.photos || []} />
          {analysis.headline_summary && (
            <div style={{
              marginTop: 14,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>AI Summary</div>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {analysis.headline_summary}
              </p>
            </div>
          )}

          {/* Flags */}
          {(patient.medical_flags || []).length > 0 && (
            <div style={{
              marginTop: 14,
              background: "var(--red-subtle)", border: "1px solid var(--red)",
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)", marginBottom: 8 }}>⚠ Clinical Flags</div>
              {patient.medical_flags.map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--red)", marginBottom: 3 }}>· {f}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div>
          {/* Tab bar */}
          <div style={{
            display: "flex", gap: 2,
            background: "var(--bg)", borderRadius: 9, padding: 4,
            border: "1px solid var(--border)", marginBottom: 20,
          }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "7px 8px",
                background: tab === t.id ? "var(--surface)" : "transparent",
                border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
                borderRadius: 6, fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer", fontFamily: "var(--font-body)",
                transition: "all 0.12s",
                boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "overview" && <OverviewTab analysis={analysis} clinical={clinical} patient={patient} session={detail.session} />}
          {tab === "skin_analysis" && <SkinAnalysisTab cv={cv} concerns={detail.concerns || []} maskUrls={analysis.mask_urls || {}} />}
          {tab === "clinical" && <ClinicalTab clinical={clinical} analysis={analysis} />}
          {tab === "treatment" && <TreatmentTab analysis={analysis} concerns={detail.concerns || []} />}
          {tab === "intake" && <IntakeTab patient={patient} session={detail.session} skinProfile={detail.session?.skin_profile} />}
        </div>
      </div>
    </div>
  );
}

// ── Photo Panel ──
function PhotoPanel({ photos }) {
  const [selected, setSelected] = useState(0);
  const frontal = photos.filter(p => p.photo_type === "frontal" || !p.photo_type);
  const others = photos.filter(p => p.photo_type !== "frontal" && p.photo_type);
  const ordered = [...frontal, ...others];

  if (ordered.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 10, aspectRatio: "3/4",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--border)" strokeWidth="1.5">
          <rect x="4" y="8" width="32" height="26" rx="4"/>
          <circle cx="20" cy="20" r="6"/>
          <path d="M14 8l3-4h6l3 4"/>
        </svg>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No photos</span>
      </div>
    );
  }

  const current = ordered[selected];

  return (
    <div>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 10, overflow: "hidden", aspectRatio: "3/4",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <img
          src={current.signed_url}
          alt={current.photo_type || "Intake photo"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(0,0,0,0.6)", borderRadius: 5,
          padding: "4px 8px", fontSize: 11, color: "white", fontWeight: 600,
          textTransform: "capitalize",
        }}>
          {current.photo_type || "Frontal"}
        </div>
      </div>
      {ordered.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {ordered.map((p, i) => (
            <div key={i} onClick={() => setSelected(i)} style={{
              width: 56, height: 56, borderRadius: 6, overflow: "hidden",
              border: `2px solid ${selected === i ? "var(--teal)" : "var(--border)"}`,
              cursor: "pointer", flexShrink: 0,
              background: "var(--bg)",
            }}>
              <img src={p.signed_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ──
function OverviewTab({ analysis, clinical, patient, session }) {
  const cv = analysis.cv_scores || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Classifications */}
      <SectionCard title="Skin Classification">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <ClassRow label="Fitzpatrick" value={clinical.fitzpatrick_type ? `Type ${toRoman(clinical.fitzpatrick_type)}` : "—"} desc={FITZPATRICK_DESC[toRoman(clinical.fitzpatrick_type)] || ""} />
          <ClassRow label="Glogau" value={clinical.glogau_class ? `Class ${clinical.glogau_class}` : (clinical.glogau_description ? "See desc." : "—")} desc={GLOGAU_DESC[clinical.glogau_class] || clinical.glogau_description || ""} />
          <ClassRow label="Skin Type" value={patient.skin_type || "—"} />
          <ClassRow label="Sensitivity" value={patient.sensitivity || "—"} />
        </div>
      </SectionCard>

      {/* CV Score summary */}
      {Object.keys(cv).length > 0 && (
        <SectionCard title="Skin Health Scores">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {CV_METRICS.map(m => {
              const val = cv[m.key];
              if (val == null) return null;
              return <CVMetricRow key={m.key} label={m.label} value={val} max={m.max} />;
            })}
          </div>
          <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--bg)", borderRadius: 7, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
            MakeupAR HD Analysis · Higher score = healthier skin (0–100)
          </div>
        </SectionCard>
      )}

      {/* Goals */}
      {(session?.goals_text || session?.biggest_concern) && (
        <SectionCard title="Patient Goals">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {session.biggest_concern && (
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Biggest Concern</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{session.biggest_concern}</div>
              </div>
            )}
            {session.goals_text && (
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Goals</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{session.goals_text}</div>
              </div>
            )}
            {session.timeline_type && (
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: "var(--teal-subtle)", color: "var(--teal)", border: "1px solid var(--teal)" }}>
                  {session.timeline_type}
                </span>
                {session.budget_range && (
                  <span style={{ padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    Budget: {session.budget_range.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── Skin Analysis Tab ──
function SkinAnalysisTab({ cv, concerns, maskUrls }) {
  const [activeMask, setActiveMask] = useState(null);

  const masks = CV_METRICS
    .map(m => ({ ...m, url: (maskUrls[m.key] || [])[0] }))
    .filter(m => m.url);

  // Auto-select first mask
  const selectedMask = activeMask || (masks[0]?.key ?? null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Mask overlays */}
      {masks.length > 0 && (
        <SectionCard title="Zone Analysis Overlays">
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {masks.map(m => {
              const val = cvValue(cv[m.key]);
              const isActive = selectedMask === m.key;
              const color = val == null ? "var(--text-muted)" : val >= 80 ? "var(--green)" : val >= 55 ? "var(--amber)" : "var(--red)";
              return (
                <button key={m.key} onClick={() => setActiveMask(m.key)} style={{
                  flex: 1, padding: "8px 6px", borderRadius: 7, cursor: "pointer",
                  border: `2px solid ${isActive ? color : "var(--border)"}`,
                  background: isActive ? `${color}12` : "var(--bg)",
                  fontFamily: "var(--font-body)", transition: "all 0.12s",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? color : "var(--text-muted)", marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color }}>{val != null ? Math.round(val) : "—"}</div>
                </button>
              );
            })}
          </div>
          {masks.map(m => m.key === selectedMask && (
            <div key={m.key} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{
                background: "var(--surface)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxHeight: 420,
                padding: "0 16px",
              }}>
                <img
                  src={m.url}
                  alt={m.label + " overlay"}
                  style={{
                    maxHeight: 420,
                    width: "auto",
                    maxWidth: "100%",
                    display: "block",
                    objectFit: "contain",
                    borderRadius: 6,
                  }}
                />
              </div>
              <div style={{ padding: "8px 12px", background: "var(--bg)", fontSize: 11.5, color: "var(--text-muted)" }}>
                {m.desc} · MakeupAR HD overlay
              </div>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Concerns */}
      {concerns.length > 0 && (
        <SectionCard title={`Patient Concerns (${concerns.length})`}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {concerns.map((c, i) => (
              <span key={i} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                background: "var(--teal-subtle)", color: "var(--teal)",
                border: "1px solid var(--teal)",
              }}>{c.label || c.name || c.concern_label || c.key}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {masks.length === 0 && concerns.length === 0 && (
        <EmptyState message="No skin analysis data for this session." />
      )}
    </div>
  );
}

// ── Clinical Intel Tab ──
const CATEGORY_LABELS = {
  volume_loss: "Volume Loss",
  skin_laxity: "Skin Laxity",
  texture: "Skin Texture",
  tone_evenness: "Tone & Evenness",
  hydration: "Hydration",
  redness_vascular: "Redness / Vascular",
  firmness: "Firmness",
  radiance: "Radiance",
  dark_circles: "Dark Circles",
  eye_bags: "Eye Bags",
  skin_quality: "Overall Skin Quality",
};

const SEV_STYLE = {
  none:     { bg: "var(--green-subtle)",  fg: "var(--green)" },
  mild:     { bg: "var(--teal-subtle)",   fg: "var(--teal)" },
  moderate: { bg: "var(--amber-subtle)",  fg: "var(--amber)" },
  severe:   { bg: "var(--red-subtle)",    fg: "var(--red)" },
};

function ClinicalTab({ clinical, analysis }) {
  // clinical_observations lives at analysis.clinical (array) OR analysis.clinical_observations
  const rawObs = Array.isArray(analysis.clinical)
    ? analysis.clinical
    : Array.isArray(analysis.clinical_observations)
      ? analysis.clinical_observations
      : [];
  const observations = rawObs.filter(o => o.severity && o.severity !== "none");

  const sevOrder = ["severe", "moderate", "mild"];
  const sorted = [...observations].sort((a, b) => {
    const ai = sevOrder.indexOf(a.severity), bi = sevOrder.indexOf(b.severity);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const contraindications = Array.isArray(analysis.contraindications) ? analysis.contraindications : [];
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const improvements = Array.isArray(analysis.improvements) ? analysis.improvements : [];
  const crossView = Array.isArray(analysis.cross_view_observations) ? analysis.cross_view_observations : [];

  const hasContent = observations.length > 0 || contraindications.length > 0 || strengths.length > 0 || crossView.length > 0;
  if (!hasContent) {
    return <EmptyState message="No clinical observations recorded for this session." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Pre-visit baseline strip ── */}
      <div style={{
        background: "var(--teal-subtle)", border: "1px solid var(--teal)30",
        borderRadius: 10, padding: "12px 16px",
        display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.08em", flex: "0 0 auto" }}>
          Pre-Visit Baseline
        </div>
        {[
          { label: "Fitzpatrick", value: clinical.fitzpatrick_type ? `Type ${toRoman(clinical.fitzpatrick_type)}` : null, desc: FITZPATRICK_DESC[toRoman(clinical.fitzpatrick_type)] },
          { label: "Glogau", value: clinical.glogau_class ? `Class ${clinical.glogau_class}` : null, desc: GLOGAU_DESC[clinical.glogau_class] || clinical.glogau_description },
          { label: "Skin Age", value: analysis.skin_age ? `${analysis.skin_age}` : null, desc: "estimated" },
        ].filter(r => r.value).map((r, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{r.value}</div>
            {r.desc && <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{r.desc}</div>}
          </div>
        ))}
      </div>

      {/* ── Contraindication flags ── */}
      {contraindications.length > 0 && (
        <div style={{ background: "#FFF0EE", border: "1px solid var(--red)40", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            ⚠ Contraindication Flags
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {contraindications.map((c, i) => (
              <div key={i} style={{ fontSize: 13, color: "#8B2020", lineHeight: 1.5 }}>
                {typeof c === "string" ? `• ${c}` : `• ${c.flag || c.reason || JSON.stringify(c)}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Severity summary ── */}
      {observations.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {sevOrder.map(sev => {
              const count = observations.filter(o => o.severity === sev).length;
              const s = SEV_STYLE[sev] || SEV_STYLE.mild;
              return (
                <div key={sev} style={{ padding: "10px 14px", borderRadius: 8, background: s.bg, border: `1px solid ${s.fg}30`, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.fg, fontFamily: "var(--font-display)" }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.fg, textTransform: "capitalize", letterSpacing: "0.05em" }}>{sev}</div>
                </div>
              );
            })}
          </div>

          {/* Observation cards */}
          {sorted.map((obs, i) => {
            const sev = obs.severity || "mild";
            const s = SEV_STYLE[sev] || SEV_STYLE.mild;
            const label = CATEGORY_LABELS[obs.category] || (obs.category || "Observation").replace(/_/g, " ");
            const confidence = obs.confidence != null ? Math.round(obs.confidence * 100) : null;
            return (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderLeft: `4px solid ${s.fg}`, borderRadius: 8, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: obs.description ? 8 : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", flex: 1, textTransform: "capitalize" }}>{label}</span>
                  {obs.zone && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 7px" }}>
                      {obs.zone}
                    </span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.fg, textTransform: "capitalize" }}>
                    {sev}
                  </span>
                </div>
                {obs.description && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, marginBottom: confidence ? 10 : 0 }}>
                    {obs.description}
                  </p>
                )}
                {confidence != null && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 3 }}>
                      <span>AI Confidence</span><span>{confidence}%</span>
                    </div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                      <div style={{ width: `${confidence}%`, height: "100%", background: s.fg, borderRadius: 2 }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── Strengths ── */}
      {strengths.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Skin Strengths
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>✓ {s}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Areas for improvement ── */}
      {improvements.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Areas for Improvement
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {improvements.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>→ {s}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cross-view notes ── */}
      {crossView.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "4px solid var(--text-muted)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Recommend In-Person Assessment
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {crossView.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {typeof s === "string" ? `• ${s}` : `• ${s.observation || s.note || JSON.stringify(s)}`}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


// ── Treatment Plan Tab ──
function TreatmentTab({ analysis, concerns }) {
  const recs = analysis.treatment_recommendations || [];
  const contras = analysis.contraindications || [];

  if (!recs.length && !contras.length && !concerns.length) {
    return <EmptyState message="No treatment recommendations available." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {recs.length > 0 && (
        <SectionCard title="Prioritized Recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recs.map((r, i) => {
              const label = typeof r === "string" ? r : r.concern || r.treatment || r.recommendation || r.text || "Treatment";
              const approaches = typeof r === "object" && Array.isArray(r.approaches) ? r.approaches : [];
              const notes = typeof r === "object" ? r.notes : null;
              return (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: i % 2 === 0 ? "var(--bg)" : "var(--surface)",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: approaches.length || notes ? 8 : 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{label}</span>
                    {r.priority && <PriorityBadge priority={r.priority} />}
                  </div>
                  {approaches.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: notes ? 6 : 0 }}>
                      {approaches.map((a, j) => (
                        <span key={j} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 11.5, background: "var(--teal-subtle)", color: "var(--teal)", border: "1px solid var(--teal)" }}>{a}</span>
                      ))}
                    </div>
                  )}
                  {notes && <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontStyle: "italic" }}>{notes}</div>}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {contras.length > 0 && (
        <SectionCard title="⚠️ Contraindications">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contras.map((c, i) => {
              const name = typeof c === "string" ? c : c.name || "Contraindication";
              const blocks = typeof c === "object" && Array.isArray(c.blocks) ? c.blocks : [];
              const message = typeof c === "object" ? c.message : null;
              const severity = typeof c === "object" ? c.severity : null;
              const isAbsolute = severity === "ABSOLUTE";
              return (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: isAbsolute ? "var(--red-subtle)" : "var(--amber-subtle)",
                  border: `1px solid ${isAbsolute ? "var(--red)" : "var(--amber)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: blocks.length || message ? 6 : 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isAbsolute ? "var(--red)" : "var(--amber)", flex: 1 }}>{name}</span>
                    {severity && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: isAbsolute ? "var(--red)" : "var(--amber)", color: "white" }}>{severity}</span>}
                  </div>
                  {blocks.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: message ? 6 : 0 }}>
                      {blocks.map((b, j) => (
                        <span key={j} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11.5, background: "white", border: `1px solid ${isAbsolute ? "var(--red)" : "var(--amber)"}`, color: isAbsolute ? "var(--red)" : "var(--amber)" }}>No {b}</span>
                      ))}
                    </div>
                  )}
                  {message && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{message}</div>}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

    </div>
  );
}

// ── Intake Data Tab ──
function IntakeTab({ patient, session }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Medical history */}
      {session?.medical_history && (
        <>
          {Object.keys(session.medical_history.conditions || {}).some(k => session.medical_history.conditions[k]) && (
            <SectionCard title="Medical Conditions">
              <FlagGrid data={session.medical_history.conditions} />
            </SectionCard>
          )}
          {Object.keys(session.medical_history.medication_flags || {}).some(k => session.medical_history.medication_flags[k]) && (
            <SectionCard title="Medication Flags">
              <FlagGrid data={session.medical_history.medication_flags} />
            </SectionCard>
          )}
        </>
      )}

      {/* Allergies & lifestyle */}
      {session?.allergies_lifestyle && (
        <>
          {Object.keys(session.allergies_lifestyle.known_allergies || {}).some(k => session.allergies_lifestyle.known_allergies[k]) && (
            <SectionCard title="Known Allergies">
              <FlagGrid data={session.allergies_lifestyle.known_allergies} />
            </SectionCard>
          )}
          {(session.allergies_lifestyle.lifestyle_factors || []).length > 0 && (
            <SectionCard title="Lifestyle Factors">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {session.allergies_lifestyle.lifestyle_factors.map((f, i) => (
                  <span key={i} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {f.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
          {session.allergies_lifestyle.other_allergies && (
            <SectionCard title="Other Allergies">
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{session.allergies_lifestyle.other_allergies}</p>
            </SectionCard>
          )}
        </>
      )}

      {/* Skin profile */}
      {session?.skin_profile && (
        <SectionCard title="Skin Profile">
          <DataGrid data={{
            "Skin Type": session.skin_profile.skin_type,
            "SPF Usage": session.skin_profile.spf_usage,
            "Skincare Routine": session.skin_profile.skincare_routine || null,
            "Previous Treatments": (session.skin_profile.previous_treatments || []).join(", ") || null,
          }} />
        </SectionCard>
      )}

      {/* Consent */}
      {session?.consent && (
        <SectionCard title="Consent">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              ["Photo Consent", session.consent.photo],
              ["HIPAA", session.consent.hipaa],
              ["Side Effects", session.consent.side_effects],
              ["Communications", session.consent.comms],
              ["Marketing", session.consent.marketing],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: "8px 10px", borderRadius: 6, background: val ? "var(--green-subtle)" : "var(--bg)", border: `1px solid ${val ? "var(--green)" : "var(--border)"}`, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: val ? "var(--green)" : "var(--text-muted)", fontSize: 13 }}>{val ? "✓" : "—"}</span>
                <span style={{ fontSize: 12, color: val ? "var(--green)" : "var(--text-muted)", fontWeight: val ? 600 : 400 }}>{label}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── Reusable bits ──

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.07em", color: "var(--text-secondary)",
        background: "var(--bg)",
      }}>{title}</div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 7.5 ? "var(--green)" : score >= 5.5 ? "var(--teal)" : score >= 4 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        border: `3px solid ${color}`,
        background: `${color}12`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-display)", lineHeight: 1 }}>{score.toFixed(1)}</div>
        <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</div>
      </div>
    </div>
  );
}


function cvValue(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object") {
    // MakeupAR returns {ui_score, raw_score} — ui_score is 0-100 display value
    return v.ui_score ?? v.raw_score ?? null;
  }
  return null;
}
function CVBar({ label, value, desc }) {
  const pct = Math.min(100, cvValue(value) ?? 0);
  const value_display = cvValue(value);
  // MakeupAR ui_score: higher = healthier skin, so green at top, red at bottom
  const color = pct >= 80 ? "var(--green)" : pct >= 55 ? "var(--amber)" : "var(--red)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{value_display != null ? Math.round(value_display) : "—"}</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{desc}</div>}
    </div>
  );
}

function CVMetricRow({ label, value, max }) {
  const num = cvValue(value);
  const pct = num != null ? (num / (max || 100)) * 100 : 0;
  // MakeupAR ui_score: higher = healthier
  const color = pct >= 80 ? "var(--green)" : pct >= 55 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{
      padding: "10px 12px", background: "var(--bg)", borderRadius: 7, border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{num != null ? Math.round(num) : "—"}</div>
    </div>
  );
}

function ClassRow({ label, value, desc }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 7, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
    </div>
  );
}

function ConcernCard({ concern: c }) {
  const [open, setOpen] = useState(false);
  const sev = c.severity || "mild";
  const sevC = { notable: "var(--red)", moderate: "var(--amber)", mild: "var(--green)", severe: "var(--red)" }[sev] || "var(--teal)";
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 8,
      overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "12px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          background: open ? "var(--bg)" : "var(--surface)",
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sevC, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name || c.concern}</span>
        {c.zone && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.zone}</span>}
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
          background: `${sevC}18`, color: sevC,
          textTransform: "capitalize",
        }}>{sev}</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M2 4l3.5 3.5L9 4"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
          {c.description && <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: c.confidence != null ? 10 : 0 }}>{c.description}</p>}
          {c.confidence != null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>AI Confidence</span><span>{c.confidence}%</span>
              </div>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ width: `${c.confidence}%`, height: "100%", background: "var(--teal)", borderRadius: 2 }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = { high: ["var(--red-subtle)", "var(--red)"], medium: ["var(--amber-subtle)", "var(--amber)"], low: ["var(--green-subtle)", "var(--green)"] };
  const [bg, fg] = colors[priority] || ["var(--bg)", "var(--text-muted)"];
  return (
    <span style={{ padding: "3px 9px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: bg, color: fg, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {priority}
    </span>
  );
}


function FlagGrid({ data }) {
  if (!data) return null;
  const active = Object.entries(data).filter(([_, v]) => v);
  if (!active.length) return <div style={{ fontSize: 12, color: "var(--text-muted)" }}>None reported</div>;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {active.map(([k]) => (
        <span key={k} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: "var(--amber-subtle)", color: "var(--amber)", border: "1px solid var(--amber)" }}>
          {k.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

function safeDisplay(v) {
  if (v == null) return null;
  if (typeof v === "boolean") return v ? "Yes" : null;
  if (typeof v === "string") return v || null;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return null;
    // Array of primitives → join; array of objects → JSON
    return v.every(i => typeof i !== "object") ? v.join(", ") : JSON.stringify(v);
  }
  if (typeof v === "object") {
    // Nested object — render as indented sub-keys
    const entries = Object.entries(v).filter(([, val]) => val != null && val !== false && val !== "");
    if (!entries.length) return null;
    return entries.map(([k, val]) => `${k.replace(/_/g, " ")}: ${safeDisplay(val)}`).join(" · ");
  }
  return String(v);
}

function DataGrid({ data }) {
  if (!data || typeof data !== "object") return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {Object.entries(data).map(([k, v]) => {
        const displayV = safeDisplay(v);
        if (displayV == null) return null;
        return (
          <div key={k} style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 2 }}>
              {k.replace(/_/g, " ")}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{displayV}</div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "48px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{message}</div>
    </div>
  );
}

// ── Constants ──
const CV_METRICS = [
  { key: "hd_wrinkle", label: "Wrinkles", max: 100, desc: "Surface wrinkle density (MakeupAR CV)" },
  { key: "hd_pore", label: "Pore Visibility", max: 100, desc: "Enlarged pore detection" },
  { key: "hd_acne", label: "Acne / Blemishes", max: 100, desc: "Active blemish severity" },
  { key: "hd_age_spot", label: "Age Spots", max: 100, desc: "Hyperpigmentation / age spot coverage" },
];


const FITZPATRICK_ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };
function toRoman(v) {
  if (!v && v !== 0) return null;
  return FITZPATRICK_ROMAN[parseInt(v)] || String(v);
}
const FITZPATRICK_DESC = {
  "I": "Always burns, never tans",
  "II": "Usually burns, tans minimally",
  "III": "Sometimes burns, tans uniformly",
  "IV": "Burns minimally, always tans",
  "V": "Rarely burns, tans profusely",
  "VI": "Never burns, deeply pigmented",
};

const GLOGAU_DESC = {
  "I": "No wrinkles — mild photoaging",
  "II": "Wrinkles in motion — moderate",
  "III": "Wrinkles at rest — advanced",
  "IV": "Only wrinkles — severe",
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
