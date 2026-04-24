// ── ProgressPage.jsx ──────────────────────────────────────────
// Patient progress tracking — generalized view that reads a
// PatientProgress object (see src/lib/progressTypes.js).
//
// v1 scope:
//   - Renders the injectables patient (Maya Rodriguez) via the
//     Paired Expression Gallery preset.
//   - Session picker (pick any two sessions to compare).
//   - Treatment events, session notes, supporting score deltas.
//
// Follow-up passes will add:
//   - IPL / vascular patient (angle-timeline grid preset)
//   - Sarah Chen migration (skin-journey preset with score trend)
//   - Per-photo annotations (data is scaffolded; UI deferred)
//   - Expected trajectory overlays (deferred)
// ──────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react';
import { MOCK_PATIENT_LIST } from '../data/mockPatients';
import {
  EXPRESSION_LABELS,
  EXPRESSION_CLINICAL_INTENT,
  ANGLE_LABELS,
  groupPhotosByKey,
} from '../lib/progressTypes';

// ── Utilities ─────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Collapse long session labels like "Session 3 \u2014 8 Week Final" down to
// "Session 3" for use in tight spaces (slider pills, etc.). Labels without
// an em-dash are returned as-is.
function shortSessionLabel(label) {
  if (!label) return '';
  const idx = label.indexOf(' \u2014 ');
  return idx === -1 ? label : label.slice(0, idx);
}

function scoreColor(v) {
  if (v >= 80) return 'var(--green)';
  if (v >= 60) return 'var(--amber)';
  return 'var(--red)';
}

// Canonical order for paired expressions so the gallery reads naturally.
const EXPRESSION_ORDER = [
  'neutral',
  'smile',
  'pout',
  'bunny_scrunch',
  'forehead_raise',
  'squint',
  'wide_eyes',
];

function buildPairedKeys(sessionA, sessionB) {
  const mapA = groupPhotosByKey(sessionA.photos);
  const mapB = groupPhotosByKey(sessionB.photos);
  const shared = Object.keys(mapA).filter((k) => k in mapB);
  return shared.sort((a, b) => {
    const [angleA, exprA] = a.split('__');
    const [angleB, exprB] = b.split('__');
    const iA = EXPRESSION_ORDER.indexOf(exprA || 'neutral');
    const iB = EXPRESSION_ORDER.indexOf(exprB || 'neutral');
    if (iA !== iB) return iA - iB;
    return angleA.localeCompare(angleB);
  });
}

function buildUnpairedPhotos(sessionA, sessionB) {
  const mapA = groupPhotosByKey(sessionA.photos);
  const mapB = groupPhotosByKey(sessionB.photos);
  const onlyA = Object.keys(mapA).filter((k) => !(k in mapB)).map((k) => ({ session: 'a', key: k, photo: mapA[k] }));
  const onlyB = Object.keys(mapB).filter((k) => !(k in mapA)).map((k) => ({ session: 'b', key: k, photo: mapB[k] }));
  return [...onlyA, ...onlyB];
}

// Clinical captions keyed by photo identity (angle + expression) and the
// selected session pair. Will be generalized to read from
// notes.per_photo_notes or per-treatment templates in a later pass.
function pairedCaption({ patientId, baselineId, comparisonId, angle, expression }) {
  if (patientId === 'maya-rodriguez') {
    return {
      neutral:        'At rest: lip volume increased; no asymmetry; brow position natural.',
      smile:          'Full smile preserved. Lateral canthal lines softer. No unnatural freeze.',
      pout:           'Upper lip projection ~2 mm greater. Cupid\u2019s bow maintained, no duck-lip.',
      squint:         'Orbicularis oculi response softened. Crow\u2019s feet visibly reduced at lateral canthus.',
      forehead_raise: 'Mild residual frontalis activation at lateral brow. Candidate for 2\u20134u touch-up if patient prefers fuller freeze, though current result preserves natural animation.',
    }[expression || 'neutral'] || null;
  }

  if (patientId === 'james-callahan') {
    // James has only neutral photos. The interesting variable is WHICH pair
    // of sessions the user is comparing, because his vascular improvement
    // unfolds across three visits.
    const pair = `${baselineId}__${comparisonId}`;
    const byAngle = {
      frontal: {
        'james-s1__james-s2': 'Frontal view: diffuse cheek/nose erythema reduced after one IPL pass. Residual pinkness and a few perinasal vessels remain.',
        'james-s2__james-s3': 'Frontal view: final result. Skin tone essentially even; no discrete vessels visible on inspection.',
        'james-s1__james-s3': 'Frontal view: full vascular clearance over two IPL sessions. Baseline diffuse erythema and telangiectasia resolved.',
      },
      left_45: {
        'james-s1__james-s2': 'Left 45\u00B0: cheek erythema visibly reduced. Malar area still carries mild residual pinkness.',
        'james-s2__james-s3': 'Left 45\u00B0: final result. Cheek tone uniform with surrounding skin.',
        'james-s1__james-s3': 'Left 45\u00B0: complete resolution of malar erythema. Prominent pre-treatment vascularity no longer visible.',
      },
    };
    return (byAngle[angle] && byAngle[angle][pair]) || null;
  }

  return null;
}

// ── Main Component ────────────────────────────────────────────

export default function ProgressPage() {
  const [patientId, setPatientId] = useState(MOCK_PATIENT_LIST[0].id);
  const patient = MOCK_PATIENT_LIST.find((p) => p.id === patientId);

  const sessions = patient.sessions;
  const [baselineId, setBaselineId] = useState(sessions[0].id);
  const [comparisonId, setComparisonId] = useState(sessions[sessions.length - 1].id);

  const baseline = sessions.find((s) => s.id === baselineId);
  const comparison = sessions.find((s) => s.id === comparisonId);

  const pairedKeys = useMemo(() => buildPairedKeys(baseline, comparison), [baseline, comparison]);
  const unpaired = useMemo(() => buildUnpairedPhotos(baseline, comparison), [baseline, comparison]);

  // Which paired pose the practitioner is currently viewing. Defaults to
  // the first key (which is `neutral` due to EXPRESSION_ORDER). If the
  // user swaps sessions and the old key is no longer paired, fall back
  // transparently.
  const [selectedKey, setSelectedKey] = useState(pairedKeys[0] || null);
  const effectiveSelectedKey =
    selectedKey && pairedKeys.includes(selectedKey) ? selectedKey : (pairedKeys[0] || null);

  const baselineMap = groupPhotosByKey(baseline.photos);
  const comparisonMap = groupPhotosByKey(comparison.photos);

  const treatmentSummary = baseline.treatments && baseline.treatments.length > 0 ? baseline.treatments : null;

  // Heuristic: a patient "uses expressions" if any photo across any session
  // has a non-neutral expression. For those patients (injectables), the
  // dropdown labels poses by expression. For angle-driven patients (vascular,
  // skin-journey), the dropdown labels poses by angle.
  const usesExpressions = useMemo(
    () => sessions.some((s) => s.photos.some((p) => p.expression && p.expression !== 'neutral')),
    [sessions]
  );

  const scoreDelta = useMemo(() => {
    if (!baseline.scores || !comparison.scores) return null;
    // Iterate union of keys so new score dimensions (e.g., redness/vascularity
    // for vascular patients) surface automatically without a code change here.
    const keys = Array.from(new Set([
      ...Object.keys(baseline.scores),
      ...Object.keys(comparison.scores),
    ]));
    const out = {};
    for (const k of keys) {
      if (baseline.scores[k] != null && comparison.scores[k] != null) {
        out[k] = { start: baseline.scores[k], end: comparison.scores[k], delta: comparison.scores[k] - baseline.scores[k] };
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }, [baseline, comparison]);

  // Whole-journey trend data. Only meaningful with 3+ scored sessions;
  // for 2-session patients (e.g., injectables pre/post) a trend adds no info.
  const trendData = useMemo(() => {
    const scored = sessions.filter((s) => s.scores);
    return scored.length >= 3 ? scored : null;
  }, [sessions]);

  const weeksBetween = Math.round(
    (new Date(comparison.date) - new Date(baseline.date)) / (1000 * 60 * 60 * 24 * 7)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <PatientAvatar name={patient.name} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Patient Progress
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>{patient.age} yrs</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Fitzpatrick {patient.fitzpatrick}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>First visit {formatDate(patient.first_visit)}</span>
              <TrackBadge track={patient.treatment_track} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {MOCK_PATIENT_LIST.length > 1 && (
            <PatientPicker
              value={patientId}
              options={MOCK_PATIENT_LIST}
              onChange={(id) => {
                setPatientId(id);
                const p = MOCK_PATIENT_LIST.find((x) => x.id === id);
                setBaselineId(p.sessions[0].id);
                setComparisonId(p.sessions[p.sessions.length - 1].id);
              }}
            />
          )}
          <MockBadge />
        </div>
      </div>

      {/* ── Session Comparison Picker ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '18px 22px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center',
      }}>
        <SessionPickerSlot
          label="Baseline"
          sessions={sessions}
          value={baselineId}
          onChange={setBaselineId}
        />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '0 12px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {weeksBetween} week{weeksBetween !== 1 ? 's' : ''}
          </div>
        </div>
        <SessionPickerSlot
          label="Comparison"
          sessions={sessions}
          value={comparisonId}
          onChange={setComparisonId}
          align="right"
        />
      </div>

      {/* ── Treatment summary + supporting scores ── */}
      <div style={{ display: 'grid', gridTemplateColumns: treatmentSummary ? '1.6fr 1fr' : '1fr', gap: 16 }}>
        {treatmentSummary && <TreatmentCard session={baseline} />}
        {scoreDelta && <ScoreDeltaCard scoreDelta={scoreDelta} treatmentTrack={patient.treatment_track} />}
      </div>

      {/* ── Whole-journey score trend (only with 3+ scored sessions) ── */}
      {trendData && (
        <TrendChartCard
          sessions={trendData}
          highlightIds={[baselineId, comparisonId]}
          treatmentTrack={patient.treatment_track}
        />
      )}

      {/* ── Paired Expression Gallery ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <PairedGalleryHeader
          pairedKeys={pairedKeys}
          selectedKey={effectiveSelectedKey}
          onSelectKey={setSelectedKey}
          usesExpressions={usesExpressions}
        />
        <div style={{ padding: '20px 24px' }}>
          {pairedKeys.length === 0 || !effectiveSelectedKey ? (
            <EmptyPaired baseline={baseline} comparison={comparison} />
          ) : (
            (() => {
              const beforePhoto = baselineMap[effectiveSelectedKey];
              const afterPhoto = comparisonMap[effectiveSelectedKey];
              const caption = pairedCaption({
                patientId: patient.id,
                baselineId,
                comparisonId,
                angle: beforePhoto.angle,
                expression: beforePhoto.expression,
              });
              return (
                <PairedExpressionCard
                  key={effectiveSelectedKey}
                  before={beforePhoto}
                  after={afterPhoto}
                  beforeLabel={shortSessionLabel(baseline.label)}
                  afterLabel={shortSessionLabel(comparison.label)}
                  caption={caption}
                  usesExpressions={usesExpressions}
                />
              );
            })()
          )}
        </div>
      </div>

      {/* ── Unpaired photos notice ── */}
      {unpaired.length > 0 && (
        <UnpairedNotice unpaired={unpaired} baselineLabel={baseline.label} comparisonLabel={comparison.label} />
      )}

      {/* ── Session notes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <NotesCard session={baseline} label="Baseline Notes" />
        <NotesCard session={comparison} label="Follow-up Notes" accent />
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function PatientAvatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const hue = (name.charCodeAt(0) * 7) % 360;
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: `hsl(${hue}, 40%, 88%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700,
      color: `hsl(${hue}, 50%, 30%)`,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function TrackBadge({ track }) {
  const map = {
    injectables: { label: 'Injectables', color: '#8B5CF6', bg: '#F5F3FF' },
    skin_journey: { label: 'Skin Journey', color: 'var(--teal)', bg: 'var(--teal-subtle)' },
    vascular: { label: 'Vascular', color: 'var(--red)', bg: 'var(--red-subtle)' },
    generic: { label: 'General', color: 'var(--text-muted)', bg: 'var(--bg)' },
  };
  const t = map[track] || map.generic;
  return (
    <span style={{
      marginLeft: 4,
      padding: '3px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 700,
      background: t.bg, color: t.color,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{t.label}</span>
  );
}

function MockBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'var(--amber-subtle)', border: '1px solid #FED7AA',
      borderRadius: 6, padding: '6px 12px', flexShrink: 0,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Demo Patient</span>
    </div>
  );
}

function PatientPicker({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '6px 12px', borderRadius: 7,
        border: '1px solid var(--border)', background: 'var(--surface)',
        fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {options.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}

function SessionPickerSlot({ label, sessions, value, onChange, align = 'left' }) {
  const session = sessions.find((s) => s.id === value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: align }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px', borderRadius: 7,
          border: '1px solid var(--border)', background: 'var(--bg)',
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          textAlign: align,
          textAlignLast: align,
        }}
      >
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>{s.label} — {formatDate(s.date)}</option>
        ))}
      </select>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {session.photos.length} photo{session.photos.length !== 1 ? 's' : ''} • {session.visit_type.replace('_', ' ')}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{
      padding: '14px 22px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-secondary)',
      }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ── Paired gallery section header (with inline view picker) ─────

function PairedGalleryHeader({ pairedKeys, selectedKey, onSelectKey, usesExpressions }) {
  const title = usesExpressions ? 'Paired Expression Comparison' : 'Paired Photo Comparison';

  // No matched poses yet — render the plain header without a picker.
  if (pairedKeys.length === 0) {
    return (
      <SectionHeader
        title={title}
        subtitle="No matched poses between these two sessions"
      />
    );
  }

  const countText = `${pairedKeys.length} matched pose${pairedKeys.length !== 1 ? 's' : ''}`;

  return (
    <div style={{
      padding: '12px 22px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-secondary)',
        }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
          {countText} • drag the slider or tap the toggle to compare
        </div>
      </div>
      <ExpressionPicker
        pairedKeys={pairedKeys}
        selectedKey={selectedKey}
        onSelectKey={onSelectKey}
        usesExpressions={usesExpressions}
      />
    </div>
  );
}

function ExpressionPicker({ pairedKeys, selectedKey, onSelectKey, usesExpressions }) {
  const pickerLabel = usesExpressions ? 'Expression' : 'Angle';

  // Build option label for a key. Keys look like "frontal__pout" or just "frontal".
  //   - For expression-driven patients: show expression label, fall back to angle
  //   - For angle-driven patients: show angle label
  const optionLabel = (k) => {
    const [angle, expr] = k.split('__');
    if (usesExpressions) {
      return EXPRESSION_LABELS[expr || 'neutral'] || ANGLE_LABELS[angle] || 'Frontal';
    }
    return ANGLE_LABELS[angle] || 'Frontal';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220 }}>
      <label
        htmlFor="expression-picker"
        style={{
          fontSize: 9.5, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-muted)',
        }}
      >{pickerLabel}</label>
      <select
        id="expression-picker"
        value={selectedKey || ''}
        onChange={(e) => onSelectKey(e.target.value)}
        style={{
          padding: '8px 12px', borderRadius: 7,
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {pairedKeys.map((k) => (
          <option key={k} value={k}>{optionLabel(k)}</option>
        ))}
      </select>
    </div>
  );
}

// ── Treatment summary card ────────────────────────────────────

const TREATMENT_ICONS = {
  botox: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M7 2v5M7 7l3 3M7 7l-3 3M2 12h10"/>
    </svg>
  ),
  filler: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4"/><path d="M7 5v4M5 7h4"/>
    </svg>
  ),
  ipl: (
    // Sun / light-burst glyph for pulsed light treatments
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7" cy="7" r="2.4"/>
      <path d="M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6M3.1 3.1l1.1 1.1M9.8 9.8l1.1 1.1M3.1 10.9l1.1-1.1M9.8 4.2l1.1-1.1"/>
    </svg>
  ),
  peel: (
    // Layered droplet glyph for chemical peels
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2 L10 7.5 A3.2 3.2 0 0 1 4 7.5 Z"/>
      <path d="M7 10.5c1.5 0 2.5-.7 2.5-1.8"/>
    </svg>
  ),
  hydrafacial: (
    // Wave glyph for hydration-based treatments
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 5c1.2-1 2.5-1 3.5 0s2.3 1 3.5 0 2.3-1 3.5 0"/>
      <path d="M1.5 8.5c1.2-1 2.5-1 3.5 0s2.3 1 3.5 0 2.3-1 3.5 0"/>
      <path d="M1.5 12c1.2-1 2.5-1 3.5 0s2.3 1 3.5 0 2.3-1 3.5 0"/>
    </svg>
  ),
  laser: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1.5 7h11M4 4l-2.5 3L4 10M10 4l2.5 3L10 10"/>
    </svg>
  ),
};

function TreatmentCard({ session }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <SectionHeader title="Treatment Administered" subtitle={`${session.label} • ${formatDate(session.date)}`} />
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {session.treatments.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--teal-subtle)', color: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {TREATMENT_ICONS[t.type] || <span>•</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.product}</span>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.type}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {t.sites.map((s, j) => (
                  <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{s.area}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.amount}</span>
                  </div>
                ))}
              </div>
              {t.notes && (
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>
                  {t.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score delta card ──────────────────────────────────────────

const CONCERN_LABELS = {
  wrinkles: 'Wrinkles',
  pore: 'Pore Visibility',
  acne: 'Acne / Blemishes',
  age_spot: 'Age Spots',
  redness: 'Redness / Erythema',
  vascularity: 'Telangiectasia',
  overall: 'Overall',
};

// Canonical ordering so the score table reads consistently across
// patients. Keys not in this list get appended alphabetically.
const CONCERN_ORDER = [
  'overall',
  'wrinkles',
  'redness',
  'vascularity',
  'pore',
  'acne',
  'age_spot',
];

function orderedConcernEntries(scoreDelta) {
  return Object.entries(scoreDelta).sort(([a], [b]) => {
    const iA = CONCERN_ORDER.indexOf(a);
    const iB = CONCERN_ORDER.indexOf(b);
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    return a.localeCompare(b);
  });
}

function scoreCardSubtitle(treatmentTrack) {
  // Attribute the source per treatment track. MakeupAR is our HD skin
  // analysis API; vascular scores are clinician-assigned in the dashboard.
  if (treatmentTrack === 'vascular') return 'Clinician-assessed vascular grading';
  return 'Supporting MakeupAR skin analysis';
}

function ScoreDeltaCard({ scoreDelta, treatmentTrack }) {
  const rows = orderedConcernEntries(scoreDelta).filter(([k, v]) => k === 'overall' || v.delta !== 0);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <SectionHeader title="Clinical Scores" subtitle={scoreCardSubtitle(treatmentTrack)} />
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: k === 'overall' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: k === 'overall' ? 700 : 500 }}>
              {CONCERN_LABELS[k] || k}
            </span>
            <span style={{ fontSize: 13, color: scoreColor(v.start), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{v.start}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: scoreColor(v.end),
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {v.end}
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: v.delta > 0 ? 'var(--green)' : v.delta < 0 ? 'var(--red)' : 'var(--text-muted)',
              }}>
                {v.delta > 0 ? '+' : ''}{v.delta}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trend chart card (whole-journey, 3+ scored sessions) ──────

// Per-concern color palette for the trend lines. Keeps visual identity
// stable across patients (wrinkles always purple, redness always red, etc.).
const CONCERN_COLORS = {
  overall:     'var(--teal)',
  wrinkles:    '#8B5CF6',
  pore:        '#0E7A8A',
  acne:        '#DC2626',
  age_spot:    '#D97706',
  redness:     '#EF4444',
  vascularity: '#BE185D',
};

function TrendChartCard({ sessions, highlightIds, treatmentTrack }) {
  // Union of score keys across any scored session. Ordered canonically so
  // the legend is stable.
  const allKeys = useMemo(() => {
    const set = new Set();
    for (const s of sessions) {
      if (s.scores) Object.keys(s.scores).forEach((k) => set.add(k));
    }
    return orderedConcernEntries(
      Object.fromEntries(Array.from(set).map((k) => [k, null]))
    ).map(([k]) => k);
  }, [sessions]);

  // Which concerns to actually plot. User toggles via the legend.
  // When allKeys changes (patient switch \u2192 different concerns), reset so
  // every concern is visible by default for the new patient.
  const [visibleKeys, setVisibleKeys] = useState(() => new Set(allKeys));
  useEffect(() => {
    setVisibleKeys(new Set(allKeys));
  }, [allKeys]);
  const toggle = (k) => {
    const next = new Set(visibleKeys);
    if (next.has(k)) next.delete(k); else next.add(k);
    setVisibleKeys(next);
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <SectionHeader
        title="Progress Over Time"
        subtitle={`${sessions.length} sessions scored • highlighted points show the selected comparison`}
      />
      <div style={{ padding: '20px 24px 22px' }}>
        <TrendChart sessions={sessions} visibleKeys={visibleKeys} highlightIds={highlightIds} />
        <TrendLegend
          keys={allKeys}
          visibleKeys={visibleKeys}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}

function TrendChart({ sessions, visibleKeys, highlightIds }) {
  // SVG geometry. viewBox lets it scale responsively.
  const W = 680, H = 220;
  const padL = 40, padR = 16, padT = 18, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xStep = sessions.length > 1 ? chartW / (sessions.length - 1) : 0;
  const xPos = (i) => padL + i * xStep;

  // y: 30–100 maps to the chart area. Matches the score scale we use.
  const Y_MIN = 30, Y_MAX = 100;
  const yPos = (v) => padT + chartH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * chartH;

  const gridLines = [40, 55, 70, 85, 100];

  const pathFor = (key) => {
    const points = sessions
      .map((s, i) => (s.scores && s.scores[key] != null ? { i, v: s.scores[key] } : null))
      .filter(Boolean);
    if (points.length === 0) return '';
    return points.map((p, idx) => {
      const x = xPos(p.i);
      const y = yPos(p.v);
      return idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid lines */}
      {gridLines.map((v) => (
        <g key={v}>
          <line x1={padL} y1={yPos(v)} x2={W - padR} y2={yPos(v)} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={padL - 6} y={yPos(v) + 3} textAnchor="end" fontSize={9} fill="var(--text-muted)">{v}</text>
        </g>
      ))}

      {/* Non-overall concern lines (drawn under, thinner) */}
      {Array.from(visibleKeys).filter((k) => k !== 'overall').map((k) => (
        <path
          key={k}
          d={pathFor(k)}
          fill="none"
          stroke={CONCERN_COLORS[k] || 'var(--text-muted)'}
          strokeWidth={1.6}
          strokeOpacity={0.55}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* Overall line (bold, drawn on top) */}
      {visibleKeys.has('overall') && (
        <path
          d={pathFor('overall')}
          fill="none"
          stroke={CONCERN_COLORS.overall}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Overall dots with highlight ring for selected baseline/comparison */}
      {visibleKeys.has('overall') && sessions.map((s, i) => {
        if (!s.scores || s.scores.overall == null) return null;
        const isHi = highlightIds.includes(s.id);
        return (
          <g key={s.id}>
            {isHi && (
              <circle cx={xPos(i)} cy={yPos(s.scores.overall)} r={9} fill="var(--teal)" fillOpacity={0.12} />
            )}
            <circle
              cx={xPos(i)} cy={yPos(s.scores.overall)}
              r={isHi ? 5.5 : 4}
              fill="var(--surface)"
              stroke={CONCERN_COLORS.overall}
              strokeWidth={isHi ? 2.5 : 2}
            />
          </g>
        );
      })}

      {/* X-axis labels */}
      {sessions.map((s, i) => {
        const isHi = highlightIds.includes(s.id);
        const date = new Date(s.date);
        const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        // Collapse session labels to short form (e.g. "S1", "S2") so they fit.
        const shortLabel = s.label.replace(/^Session\s*/, 'S').replace(/\s*—.*$/, '');
        return (
          <g key={s.id}>
            <text
              x={xPos(i)} y={H - 20}
              textAnchor="middle" fontSize={10}
              fill={isHi ? 'var(--text-primary)' : 'var(--text-muted)'}
              fontWeight={isHi ? 700 : 400}
            >{shortLabel.length > 14 ? shortLabel.slice(0, 12) + '…' : shortLabel}</text>
            <text
              x={xPos(i)} y={H - 8}
              textAnchor="middle" fontSize={9} fill="var(--text-muted)"
            >{dateLabel}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TrendLegend({ keys, visibleKeys, onToggle }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '8px 16px',
      marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)',
    }}>
      {keys.map((k) => {
        const on = visibleKeys.has(k);
        const color = CONCERN_COLORS[k] || 'var(--text-muted)';
        return (
          <button
            key={k}
            onClick={() => onToggle(k)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '4px 2px',
              fontFamily: 'var(--font-body)',
              opacity: on ? 1 : 0.4,
              transition: 'opacity 0.12s',
            }}
          >
            <span style={{
              width: k === 'overall' ? 20 : 14,
              height: k === 'overall' ? 3 : 2,
              background: color,
              borderRadius: 2,
            }} />
            <span style={{
              fontSize: 11.5, fontWeight: k === 'overall' ? 700 : 500,
              color: on ? 'var(--text-secondary)' : 'var(--text-muted)',
            }}>{CONCERN_LABELS[k] || k}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Paired Expression Card (the hero) ─────────────────────────

function PairedExpressionCard({ before, after, beforeLabel, afterLabel, caption, usesExpressions }) {
  const [mode, setMode] = useState('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const expr = before.expression;

  // Label choice:
  //   - For expression-driven patients (injectables): use expression label,
  //     including "Neutral at rest" as a meaningful baseline pose.
  //   - For angle-driven patients (vascular, skin-journey): use angle label.
  const label = usesExpressions
    ? (EXPRESSION_LABELS[expr || 'neutral'] || ANGLE_LABELS[before.angle])
    : (ANGLE_LABELS[before.angle] || 'Frontal');
  const intent = usesExpressions ? EXPRESSION_CLINICAL_INTENT[expr || 'neutral'] : null;

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {label}
          </div>
          {intent && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{intent}</div>
          )}
        </div>
        <CompareModeToggle mode={mode} setMode={setMode} />
      </div>

      <div style={{ padding: 16 }}>
        {mode === 'slider' ? (
          <SliderCompare
            beforeUrl={before.url}
            afterUrl={after.url}
            pos={sliderPos}
            setPos={setSliderPos}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
          />
        ) : (
          <SideBySideCompare
            beforeUrl={before.url}
            afterUrl={after.url}
            beforeLabel={beforeLabel}
            afterLabel={afterLabel}
          />
        )}

        {caption && (
          <div style={{
            marginTop: 14,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--teal)',
            borderRadius: 6, padding: '10px 14px',
            fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 6 }}>
              Clinical note
            </span>
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

function CompareModeToggle({ mode, setMode }) {
  const options = [
    { id: 'slider', label: 'Slider' },
    { id: 'sideBySide', label: 'Side by side' },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--bg)', borderRadius: 7,
      border: '1px solid var(--border)', padding: 2,
    }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setMode(o.id)}
          style={{
            padding: '5px 12px', border: 'none', borderRadius: 5,
            background: mode === o.id ? 'var(--surface)' : 'transparent',
            boxShadow: mode === o.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            fontSize: 11.5, fontWeight: 600,
            color: mode === o.id ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all 0.12s',
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function SliderCompare({ beforeUrl, afterUrl, pos, setPos, beforeLabel, afterLabel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 8, overflow: 'hidden',
          aspectRatio: '3 / 4', maxHeight: 520, maxWidth: 390,
          margin: '0 auto',
          width: '100%',
          background: '#000',
          cursor: 'ew-resize',
          userSelect: 'none',
        }}
      >
        <img
          src={afterUrl}
          alt="After"
          draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
            pointerEvents: 'none',
          }}
        >
          <img
            src={beforeUrl}
            alt="Before"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '4px 10px', borderRadius: 5,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          pointerEvents: 'none',
          maxWidth: 'calc(50% - 14px)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>Before · {beforeLabel}</div>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 10px', borderRadius: 5,
          background: 'rgba(14,122,138,0.9)', color: '#fff',
          fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          pointerEvents: 'none',
          maxWidth: 'calc(50% - 14px)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>After · {afterLabel}</div>

        <div
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${pos}%`, width: 2,
            background: '#fff', boxShadow: '0 0 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', left: `${pos}%`,
            transform: 'translate(-50%, -50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round">
            <path d="M6 4l-3 4 3 4M10 4l3 4-3 4"/>
          </svg>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={pos}
          onChange={(e) => setPos(parseFloat(e.target.value))}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'ew-resize', margin: 0,
          }}
        />
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center' }}>
        Drag the slider to compare
      </div>
    </div>
  );
}

function SideBySideCompare({ beforeUrl, afterUrl, beforeLabel, afterLabel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 800, margin: '0 auto' }}>
      <CompareImage url={beforeUrl} label={`Before · ${beforeLabel}`} accentBg="rgba(0,0,0,0.6)" />
      <CompareImage url={afterUrl} label={`After · ${afterLabel}`} accentBg="rgba(14,122,138,0.9)" />
    </div>
  );
}

function CompareImage({ url, label, accentBg }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 8, overflow: 'hidden',
      aspectRatio: '3 / 4', background: '#000',
    }}>
      <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{
        position: 'absolute', top: 10, left: 10,
        maxWidth: 'calc(100% - 20px)',
        padding: '4px 10px', borderRadius: 5,
        background: accentBg, color: '#fff',
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{label}</div>
    </div>
  );
}

// ── Unpaired photos notice ────────────────────────────────────

function UnpairedNotice({ unpaired, baselineLabel, comparisonLabel }) {
  // Label a photo by whichever axis is more distinctive: its expression if
  // meaningful, otherwise its angle. Keeps the message clinically accurate
  // across treatment types (injectables → expression, vascular → angle).
  const labelFor = (photo) => {
    if (photo.expression && photo.expression !== 'neutral') {
      return EXPRESSION_LABELS[photo.expression] || photo.expression;
    }
    return ANGLE_LABELS[photo.angle] || photo.angle;
  };

  return (
    <div style={{
      background: 'var(--amber-subtle)', border: '1px solid #FED7AA',
      borderRadius: 10, padding: '14px 18px',
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--amber)" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="8" cy="8" r="6.5"/><path d="M8 4v4M8 11v.5" strokeLinecap="round"/>
      </svg>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
          {unpaired.length} photo{unpaired.length !== 1 ? 's' : ''} without a matching pose
        </div>
        <div style={{ fontSize: 11.5, color: '#92400E', lineHeight: 1.5 }}>
          {unpaired.map((u, i) => {
            const which = u.session === 'a' ? baselineLabel : comparisonLabel;
            return (
              <span key={i}>
                <strong>{labelFor(u.photo)}</strong> captured only in <em>{which}</em>
                {i < unpaired.length - 1 ? ' · ' : ''}
              </span>
            );
          })}
          . For consistent pose-to-pose tracking, capture the same angle & expression battery at every follow-up.
        </div>
      </div>
    </div>
  );
}

function EmptyPaired({ baseline, comparison }) {
  const baselineCount = baseline?.photos?.length ?? 0;
  const comparisonCount = comparison?.photos?.length ?? 0;

  // Case A: neither session has any photos captured.
  if (baselineCount === 0 && comparisonCount === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.3" style={{ opacity: 0.5, marginBottom: 10 }}>
          <rect x="3" y="6" width="18" height="13" rx="2"/>
          <circle cx="12" cy="13" r="3.5"/>
          <path d="M8 6l1.5-2h5L16 6"/>
        </svg>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
          No photos captured in either session
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 420, margin: '0 auto' }}>
          Progress for this patient is tracked via clinical scores and notes only. Capture baseline photos at the next visit to enable visual comparisons.
        </div>
      </div>
    );
  }

  // Case B: only one side has photos.
  if (baselineCount === 0 || comparisonCount === 0) {
    const missing = baselineCount === 0 ? baseline?.label : comparison?.label;
    return (
      <div style={{ padding: '28px 24px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        No photos captured in <strong style={{ color: 'var(--text-secondary)' }}>{missing}</strong>, so side-by-side comparison isn\u2019t available for this pair. Try selecting two sessions that both have photos.
      </div>
    );
  }

  // Case C: both sessions have photos, but no shared (angle + expression) keys.
  return (
    <div style={{ padding: '28px 24px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
      Both sessions have photos, but no shared poses. For consistent comparison, capture the same angle/expression battery at each visit.
    </div>
  );
}

// ── Session notes card ────────────────────────────────────────

function NotesCard({ session, label, accent }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: accent ? '3px solid var(--teal)' : '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <SectionHeader title={label} subtitle={`${session.label} • ${formatDate(session.date)}`} />
      <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {session.notes.session_summary || <em style={{ color: 'var(--text-muted)' }}>No notes for this session.</em>}
      </div>
    </div>
  );
}
