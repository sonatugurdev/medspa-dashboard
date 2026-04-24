// ── mockPatients.js ────────────────────────────────────────────
// Mock patient data for the Progress page. When real multi-session
// data becomes available via /api/dashboard/patients/:id/progress,
// these fixtures get replaced by API responses of the same shape.
//
// Patients:
//   - maya-rodriguez : injectables (Botox + lip filler), 2 sessions
//   - james-callahan : vascular / IPL for rosacea + telangiectasia, 3 sessions
//   - sarah-chen     : skin journey (acne/peel/IPL/hydrafacial), 4 sessions
//
// The ProgressPage component adapts its layout based on which
// sections actually have data, not on treatment_track. That means:
//   - Patients with photos but no scores hide the score card.
//   - Patients with 3+ scored sessions get a trendline above the gallery.
//   - Patients with no photos (e.g., Sarah pre-photo-capture) get a
//     graceful empty state in the paired gallery and lean on notes + scores.
// ──────────────────────────────────────────────────────────────

/** @type {import('../lib/progressTypes').PatientProgress} */
export const MAYA_RODRIGUEZ = {
  id: 'maya-rodriguez',
  name: 'Maya Rodriguez',
  age: 28,
  fitzpatrick: 'III',
  first_visit: '2026-04-01',
  primary_goals: ['Dynamic Wrinkles', 'Lip Volume', 'Facial Balance'],
  treatment_track: 'injectables',

  sessions: [
    {
      id: 'maya-s1',
      label: 'Session 1',
      date: '2026-04-01',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'botox',
          product: 'Botox Cosmetic',
          sites: [
            { area: 'Glabella', amount: '20 units' },
            { area: 'Frontalis', amount: '10 units' },
            { area: 'Lateral canthi (crow\u2019s feet)', amount: '8 units ea.' },
          ],
          notes: 'Conservative dose on frontalis to preserve natural brow lift.',
        },
        {
          type: 'filler',
          product: 'Juv\u00E9derm Volbella XC',
          sites: [
            { area: 'Upper lip body', amount: '0.5 mL' },
            { area: 'Lower lip body', amount: '0.5 mL' },
          ],
          notes: 'Conservative first-time lip augmentation. Focus on hydration + subtle volume, preserving Cupid\u2019s bow.',
        },
      ],
      photos: [
        {
          id: 'maya-s1-p1',
          session_id: 'maya-s1',
          url: '/demo-photos/maya-rodriguez/session-1/frontal_neutral.jpg',
          angle: 'frontal',
          expression: 'neutral',
          captured_at: '2026-04-01T14:30:00Z',
        },
        {
          id: 'maya-s1-p2',
          session_id: 'maya-s1',
          url: '/demo-photos/maya-rodriguez/session-1/frontal_smile.jpg',
          angle: 'frontal',
          expression: 'smile',
          captured_at: '2026-04-01T14:30:30Z',
        },
        {
          id: 'maya-s1-p3',
          session_id: 'maya-s1',
          url: '/demo-photos/maya-rodriguez/session-1/frontal_pout.jpg',
          angle: 'frontal',
          expression: 'pout',
          captured_at: '2026-04-01T14:31:00Z',
        },
        {
          id: 'maya-s1-p4',
          session_id: 'maya-s1',
          url: '/demo-photos/maya-rodriguez/session-1/frontal_squint.jpg',
          angle: 'frontal',
          expression: 'squint',
          captured_at: '2026-04-01T14:31:30Z',
        },
        {
          id: 'maya-s1-p5',
          session_id: 'maya-s1',
          url: '/demo-photos/maya-rodriguez/session-1/frontal_forehead_raise.jpg',
          angle: 'frontal',
          expression: 'forehead_raise',
          captured_at: '2026-04-01T14:32:00Z',
        },
      ],
      scores: {
        wrinkles: 78,
        pore: 82,
        acne: 88,
        age_spot: 90,
        overall: 84,
      },
      notes: {
        session_summary:
          'Initial consultation and treatment. Patient presents with dynamic glabellar lines most apparent on frown, mild frontalis activation at baseline, moderate lateral canthal (crow\u2019s feet) lines on squint, and naturally thin lips with flat Cupid\u2019s bow. No contraindications. Patient educated on expected onset (3\u20135 days) and full effect (10\u201314 days). Post-care instructions reviewed.',
        per_photo_notes: {},
      },
    },
    {
      id: 'maya-s2',
      label: '2-Week Follow-up',
      date: '2026-04-15',
      visit_type: 'follow_up',
      treatments: [], // no new treatment on follow-up visit
      photos: [
        {
          id: 'maya-s2-p1',
          session_id: 'maya-s2',
          url: '/demo-photos/maya-rodriguez/session-2/frontal_neutral.jpg',
          angle: 'frontal',
          expression: 'neutral',
          captured_at: '2026-04-15T15:00:00Z',
        },
        {
          id: 'maya-s2-p2',
          session_id: 'maya-s2',
          url: '/demo-photos/maya-rodriguez/session-2/frontal_smile.jpg',
          angle: 'frontal',
          expression: 'smile',
          captured_at: '2026-04-15T15:00:30Z',
        },
        {
          id: 'maya-s2-p3',
          session_id: 'maya-s2',
          url: '/demo-photos/maya-rodriguez/session-2/frontal_pout.jpg',
          angle: 'frontal',
          expression: 'pout',
          captured_at: '2026-04-15T15:01:00Z',
        },
        {
          id: 'maya-s2-p4',
          session_id: 'maya-s2',
          url: '/demo-photos/maya-rodriguez/session-2/frontal_squint.jpg',
          angle: 'frontal',
          expression: 'squint',
          captured_at: '2026-04-15T15:01:30Z',
        },
        {
          id: 'maya-s2-p5',
          session_id: 'maya-s2',
          url: '/demo-photos/maya-rodriguez/session-2/frontal_forehead_raise.jpg',
          angle: 'frontal',
          expression: 'forehead_raise',
          captured_at: '2026-04-15T15:02:00Z',
        },
      ],
      scores: {
        wrinkles: 84,
        pore: 82,
        acne: 88,
        age_spot: 90,
        overall: 86,
      },
      notes: {
        session_summary:
          'Excellent result at 2 weeks. Glabellar complex fully relaxed at rest and on dynamic testing \u2014 no residual procerus or corrugator activity. Crow\u2019s feet softened on squint; lateral canthal lines markedly less pronounced than baseline. Mild residual frontalis activation visible on forehead raise at lateral brow; consider 2\u20134 units touch-up if patient prefers fuller freeze, though current result preserves natural animation. Lip augmentation well-integrated: ~2 mm increase in upper lip projection, improved vermilion show, Cupid\u2019s bow maintained. Patient reports high satisfaction. Next follow-up at 12 weeks.',
        per_photo_notes: {},
      },
    },
  ],
};

/** @type {import('../lib/progressTypes').PatientProgress} */
export const JAMES_CALLAHAN = {
  id: 'james-callahan',
  name: 'James Callahan',
  age: 54,
  fitzpatrick: 'II',
  first_visit: '2026-01-22',
  primary_goals: ['Redness & Rosacea', 'Broken Capillaries', 'Even Skin Tone'],
  treatment_track: 'vascular',

  sessions: [
    {
      id: 'james-s1',
      label: 'Session 1 \u2014 Baseline',
      date: '2026-01-22',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'ipl',
          product: 'Lumecca IPL (InMode)',
          sites: [
            { area: 'Full face \u2014 vascular mode', amount: '515 nm filter' },
            { area: 'Cheeks & nose (focal)', amount: '2 passes' },
          ],
          notes: 'First IPL session. Significant baseline erythema with visible telangiectasia across malar cheeks and nasal sidewalls. Rosacea-pattern vascular presentation. Patient counseled on expected 2\u20133 session protocol at 4\u20136 week intervals.',
        },
      ],
      photos: [
        {
          id: 'james-s1-p1',
          session_id: 'james-s1',
          url: '/demo-photos/james-callahan/session-1/frontal.jpg',
          angle: 'frontal',
          expression: 'neutral',
          captured_at: '2026-01-22T10:15:00Z',
        },
        {
          id: 'james-s1-p2',
          session_id: 'james-s1',
          url: '/demo-photos/james-callahan/session-1/left_45.jpg',
          angle: 'left_45',
          expression: 'neutral',
          captured_at: '2026-01-22T10:15:30Z',
        },
      ],
      scores: { redness: 48, vascularity: 42, overall: 45 },
      notes: {
        session_summary:
          'Baseline capture. Diffuse erythema across malar cheeks, nasal dorsum, and alar sidewalls with discrete telangiectasia visible in perinasal region. Fitzpatrick II, rosacea-pattern vascular presentation. No active pustular component. Patient reports flushing triggered by heat, alcohol, and stress. Good IPL candidate. First Lumecca session performed under vascular settings.',
        per_photo_notes: {},
      },
    },
    {
      id: 'james-s2',
      label: 'Session 2 \u2014 4 Week Follow-up',
      date: '2026-02-26',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'ipl',
          product: 'Lumecca IPL (InMode)',
          sites: [
            { area: 'Full face \u2014 vascular mode', amount: '515 nm filter' },
            { area: 'Perinasal telangiectasia (focal)', amount: 'higher fluence' },
          ],
          notes: 'Second pass. Baseline diffuse erythema notably improved. Residual telangiectasia targeted with focal higher-fluence pulses.',
        },
      ],
      photos: [
        {
          id: 'james-s2-p1',
          session_id: 'james-s2',
          url: '/demo-photos/james-callahan/session-2/frontal.jpg',
          angle: 'frontal',
          expression: 'neutral',
          captured_at: '2026-02-26T10:00:00Z',
        },
        {
          id: 'james-s2-p2',
          session_id: 'james-s2',
          url: '/demo-photos/james-callahan/session-2/left_45.jpg',
          angle: 'left_45',
          expression: 'neutral',
          captured_at: '2026-02-26T10:00:30Z',
        },
      ],
      scores: { redness: 68, vascularity: 64, overall: 66 },
      notes: {
        session_summary:
          'Marked improvement at 4 weeks. Diffuse cheek and nasal erythema substantially reduced. Residual pinkness across mid-face with a few persistent perinasal vessels. Second IPL pass performed with focal higher-fluence pulses on remaining telangiectasia. Patient reports fewer flushing episodes and reduced self-consciousness about facial color.',
        per_photo_notes: {},
      },
    },
    {
      id: 'james-s3',
      label: 'Session 3 \u2014 8 Week Final',
      date: '2026-03-26',
      visit_type: 'follow_up',
      treatments: [],
      photos: [
        {
          id: 'james-s3-p1',
          session_id: 'james-s3',
          url: '/demo-photos/james-callahan/session-3/frontal.jpg',
          angle: 'frontal',
          expression: 'neutral',
          captured_at: '2026-03-26T11:20:00Z',
        },
        {
          id: 'james-s3-p2',
          session_id: 'james-s3',
          url: '/demo-photos/james-callahan/session-3/left_45.jpg',
          angle: 'left_45',
          expression: 'neutral',
          captured_at: '2026-03-26T11:20:30Z',
        },
        {
          id: 'james-s3-p3',
          session_id: 'james-s3',
          url: '/demo-photos/james-callahan/session-3/right_45.jpg',
          angle: 'right_45',
          expression: 'neutral',
          captured_at: '2026-03-26T11:21:00Z',
        },
      ],
      scores: { redness: 88, vascularity: 86, overall: 87 },
      notes: {
        session_summary:
          'Excellent final result. Skin tone essentially even across the entire face. No visible telangiectasia on clinical inspection. Baseline diffuse erythema fully resolved. Third-angle (right 45\u00B0) added at this visit for completeness of baseline for future comparison. Maintenance recommendation: annual single-session IPL to prevent recurrence; strict broad-spectrum SPF 30+ daily; trigger avoidance counseling reinforced.',
        per_photo_notes: {},
      },
    },
  ],
};

/** @type {import('../lib/progressTypes').PatientProgress} */
export const SARAH_CHEN = {
  id: 'sarah-chen',
  name: 'Sarah Chen',
  age: 34,
  fitzpatrick: 'II',
  glogau: '1',
  first_visit: '2025-11-14',
  primary_goals: ['Acne & Blemishes', 'Pigmentation', 'Pore Visibility'],
  treatment_track: 'skin_journey',

  sessions: [
    {
      id: 'sarah-s1',
      label: 'Session 1 \u2014 Baseline',
      date: '2025-11-14',
      visit_type: 'intake',
      treatments: [],
      photos: [],
      scores: { wrinkles: 72, pore: 54, acne: 41, age_spot: 63, overall: 58 },
      notes: {
        session_summary:
          'Baseline intake. Moderate acne activity across T-zone and cheeks. Visible pore dilation. Mild pigmentation from prior breakouts. Glogau Class 2. Patient interested in clearing active lesions and addressing post-inflammatory hyperpigmentation. Treatment plan proposed: Jessner\u2019s peel series followed by IPL for pigmentation consolidation.',
        per_photo_notes: {},
      },
    },
    {
      id: 'sarah-s2',
      label: 'Session 2 \u2014 Chemical Peel',
      date: '2026-01-08',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'peel',
          product: 'Jessner\u2019s Solution 20%',
          sites: [
            { area: 'Full face', amount: '3 coats' },
          ],
          notes: 'Tolerated well. Mild frosting achieved. Post-care kit dispensed; strict SPF reinforced.',
        },
      ],
      photos: [],
      scores: { wrinkles: 74, pore: 61, acne: 58, age_spot: 72, overall: 67 },
      notes: {
        session_summary:
          'Noticeable reduction in active lesions. Pore appearance improved post-peel. Some residual post-inflammatory hyperpigmentation persisting on left cheek. Patient reports no adverse events post-peel.',
        per_photo_notes: {},
      },
    },
    {
      id: 'sarah-s3',
      label: 'Session 3 \u2014 IPL Photofacial',
      date: '2026-02-22',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'ipl',
          product: 'Lumecca IPL (InMode)',
          sites: [
            { area: 'Full face \u2014 pigmentation mode', amount: '560 nm filter' },
          ],
          notes: 'Pigmentation-targeted IPL. Expected darkening/sloughing over 7\u201310 days as PIH lifts.',
        },
      ],
      photos: [],
      scores: { wrinkles: 77, pore: 68, acne: 72, age_spot: 81, overall: 74 },
      notes: {
        session_summary:
          'Significant clearing of post-inflammatory hyperpigmentation. Active acne minimal. Pore tightening continuing. Age spot score improved sharply with IPL. Patient pleased with trajectory.',
        per_photo_notes: {},
      },
    },
    {
      id: 'sarah-s4',
      label: 'Session 4 \u2014 Hydrafacial + LED',
      date: '2026-04-10',
      visit_type: 'treatment',
      treatments: [
        {
          type: 'hydrafacial',
          product: 'Hydrafacial MD + blue/red LED',
          sites: [
            { area: 'Full face \u2014 cleanse, extract, hydrate', amount: 'standard protocol' },
            { area: 'LED finish', amount: '10 min blue + 10 min red' },
          ],
          notes: 'Maintenance session. Skin in best condition since baseline.',
        },
      ],
      photos: [],
      scores: { wrinkles: 80, pore: 75, acne: 84, age_spot: 86, overall: 81 },
      notes: {
        session_summary:
          'Skin in best condition since intake. Acne fully cleared. Pigmentation nearly resolved. Glogau reassessed as Class 1. Maintenance protocol recommended going forward: quarterly Hydrafacial + LED, annual IPL touch-up if needed.',
        per_photo_notes: {},
      },
    },
  ],
};

// Registry of all mock patients. Keyed by id for fast lookup.
export const MOCK_PATIENTS = {
  'maya-rodriguez': MAYA_RODRIGUEZ,
  'james-callahan': JAMES_CALLAHAN,
  'sarah-chen':     SARAH_CHEN,
};

// List form for patient pickers / future list views.
export const MOCK_PATIENT_LIST = Object.values(MOCK_PATIENTS);