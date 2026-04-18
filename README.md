# Lucida Clinical — Practitioner Dashboard

A clinical intelligence dashboard for medspa practitioners. Connects to your existing FastAPI backend to display patient intake data, AI skin analysis, and CV scores.

---

## Architecture

```
medspa-dashboard/          ← This repo (new Vercel project)
  src/
    App.jsx                ← Auth gate + context
    lib/auth.js            ← API key auth + typed fetch client
    pages/
      Login.jsx            ← API key login screen
      Dashboard.jsx        ← Main shell: sidebar + routing
    components/
      OverviewPanel.jsx    ← Patient list with KPI strip
      PatientList.jsx      ← Patient header + sessions list
      SessionDetail.jsx    ← Full session: photos, scores, tabs
```

---

## 1. Backend: Add dashboard endpoints

### Copy the router

```bash
cp dashboard_router.py /path/to/medspa-backend/app/dashboard_router.py
```

### Register it in main.py

```python
# In app/main.py — add these two lines near the other router includes:
from app.dashboard_router import router as dashboard_router
app.include_router(dashboard_router)
```

### Add environment variables to Render

In Render → your backend service → Environment:

| Variable | Value |
|---|---|
| `DASHBOARD_API_KEY` | A secret string you choose (e.g. generate with `openssl rand -hex 32`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (NOT the anon key — service role bypasses RLS for trusted server reads) |

> The `SUPABASE_URL` is already set. `SUPABASE_SERVICE_ROLE_KEY` is in your Supabase project → Settings → API.

### CORS: allow the dashboard origin

In `main.py`, add the dashboard URL to your `CORSMiddleware` origins:

```python
origins = [
    "https://medspa-intake.vercel.app",
    "https://medspa-dashboard.vercel.app",   # ← add this
    "http://localhost:5173",                  # local dev
]
```

---

## 2. Frontend: Deploy to Vercel

### Local dev

```bash
cd medspa-dashboard
cp .env.example .env.local
# Edit .env.local — set VITE_API_BASE to your backend URL

npm install
npm run dev
# Opens at http://localhost:5173
```

### Deploy

```bash
# Push this directory to a new GitHub repo (e.g. sonatugurdev/medspa-dashboard)
# Then in Vercel:
#   New Project → Import repo → Framework: Vite
#   Add env var: VITE_API_BASE = https://medspa-backend.onrender.com
#   Deploy
```

Or via CLI:
```bash
npm install -g vercel
vercel --prod
# Set env: VITE_API_BASE = https://medspa-backend.onrender.com
```

### Login

Open the deployed URL. Enter the `DASHBOARD_API_KEY` you set in Render. Done.

---

## 3. What the endpoints return

### `GET /api/dashboard/patients`
Returns all patients enriched with:
- Latest skin score
- Fitzpatrick / Glogau classification (from analysis JSON)
- Top concern name
- Session count + last session date
- Medical flags (blood thinners, keloid, hypertension, allergies)

### `GET /api/dashboard/sessions/{id}`
Returns full session detail:
- `session` — intake metadata, goals, medical history, consent
- `patient` — demographics + classifications
- `photos` — with server-side signed URLs (1hr expiry, via `create_signed_url`)
- `concerns` — from the `concerns` table
- `analysis` — CV scores, clinical observations, treatment recommendations, headline summary

---

## 4. Schema assumptions

The router assumes your tables have these columns. Adjust field names in `dashboard_router.py` if yours differ:

| Table | Key columns used |
|---|---|
| `patients` | `id, name, email, phone, age, created_at` |
| `sessions` | `id, patient_id, goals, created_at` |
| `photos` | `id, session_id, storage_path, photo_type, created_at` |
| `analysis_results` | `session_id, analysis_json, skin_score` |
| `concerns` | `session_id, concern_name, severity, severity_rank` |
| `medical_history` | `session_id, blood_thinners, keloid_history, hypertension, medications` |
| `allergies_lifestyle` | `session_id, allergies` |
| `consent` | `session_id, consent_given, signed_at` |

---

## 5. What's after MVP

The UI is structured to add these screens later:

- **Appointment scheduling** — new `appointments` table + scheduling system integration
- **Treatment / session notes** — new `practitioner_notes` table, add to SessionDetail
- **Before/after comparisons** — already wired for multi-session photo display
- **Revenue & booking analytics** — new `Analytics` page in sidebar
- **Patient messaging** — new `messages` table + patient portal integration

The sidebar `NavItem` pattern, tab system in `SessionDetail`, and `SectionCard` component are all designed to scale without refactoring.
