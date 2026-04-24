// ── progressTypes.js ───────────────────────────────────────────
// Shared type documentation and enums for the patient progress system.
//
// The progress system is designed to scale across treatment types:
// tox + filler (paired expression comparisons), IPL (multi-timepoint
// angle grids), long skin journeys (score trendlines), or single
// before/after pairs — all read from the same data shape.
//
// This file is JSDoc-only for now (no TS in the repo), but it pins
// down the vocabulary used across mock data + ProgressPage.
// ──────────────────────────────────────────────────────────────

/**
 * @typedef {'frontal' | 'left_45' | 'right_45'} Angle
 *
 * The three intake angles produced by the Glowa capture flow.
 * In future: may expand to 'profile_left', 'profile_right',
 * 'top_scalp', etc. — but v1 sticks to what the intake flow ships.
 */

/**
 * @typedef {'neutral' | 'smile' | 'pout' | 'bunny_scrunch' | 'forehead_raise' | 'squint' | 'wide_eyes' | null} Expression
 *
 * Functional expressions a patient can perform. Null = resting/neutral
 * implied. Used mainly for neuromodulator + filler documentation where
 * motion reveals the clinical result.
 */

/** Human-readable labels for expression tags. */
export const EXPRESSION_LABELS = {
  neutral: 'Neutral at rest',
  smile: 'Full smile',
  pout: 'Pout / lip purse',
  bunny_scrunch: 'Bunny scrunch',
  forehead_raise: 'Forehead raise',
  squint: 'Squint',
  wide_eyes: 'Wide eyes',
};

/** What each expression is clinically testing. Shown as secondary caption. */
export const EXPRESSION_CLINICAL_INTENT = {
  neutral: 'Baseline facial symmetry & resting tone',
  smile: 'Lip dynamics · zygomaticus · crow\u2019s feet',
  pout: 'Lip volume & projection (filler result)',
  bunny_scrunch: 'Nasalis + procerus function (tox test)',
  forehead_raise: 'Frontalis function · residual movement',
  squint: 'Orbicularis oculi · lateral canthal lines',
  wide_eyes: 'Frontalis baseline · brow position',
};

export const ANGLE_LABELS = {
  frontal: 'Frontal',
  left_45: 'Left 45\u00B0',
  right_45: 'Right 45\u00B0',
};

/**
 * @typedef {Object} Photo
 * @property {string} id            - unique id
 * @property {string} session_id    - parent session
 * @property {string} url           - path or signed URL
 * @property {Angle} angle
 * @property {Expression} expression
 * @property {string} captured_at   - ISO datetime
 */

/**
 * @typedef {Object} TreatmentEvent
 * @property {'botox' | 'filler' | 'ipl' | 'peel' | 'laser' | 'hydrafacial' | 'other'} type
 * @property {string} product       - e.g. "Botox", "Juv\u00E9derm Volbella XC"
 * @property {Array<{area: string, amount: string}>} sites
 * @property {string} [notes]
 */

/**
 * @typedef {Object} SessionScores
 * @property {number} [wrinkles]
 * @property {number} [pore]
 * @property {number} [acne]
 * @property {number} [age_spot]
 * @property {number} [overall]
 */

/**
 * @typedef {Object} SessionNotes
 * @property {string} session_summary
 * @property {Object<string, string>} per_photo_notes  // keyed by photo id — scaffolded, v1 empty
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} label                          - e.g. "Session 1", "2-Week Follow-up"
 * @property {string} date                           - ISO date (YYYY-MM-DD)
 * @property {'intake' | 'treatment' | 'follow_up'} visit_type
 * @property {TreatmentEvent[]} treatments
 * @property {Photo[]} photos
 * @property {SessionScores | null} scores
 * @property {SessionNotes} notes
 */

/**
 * @typedef {Object} PatientProgress
 * @property {string} id
 * @property {string} name
 * @property {number} age
 * @property {string} fitzpatrick
 * @property {string} [glogau]
 * @property {string} first_visit                     - ISO date
 * @property {string[]} primary_goals
 * @property {'skin_journey' | 'injectables' | 'vascular' | 'generic'} treatment_track
 *   - Controls which progress view preset is used by default.
 *   - Not a hard branch: ProgressPage should adapt based on data too.
 * @property {Session[]} sessions
 */

// Utility: get the photo key used to match across sessions for comparison.
// Two photos with the same key represent the same pose at different times.
export function photoKey(photo) {
  return `${photo.angle}${photo.expression ? `__${photo.expression}` : ''}`;
}

// Utility: group photos by key (angle + expression) within a session.
export function groupPhotosByKey(photos) {
  const map = {};
  for (const p of photos) map[photoKey(p)] = p;
  return map;
}
