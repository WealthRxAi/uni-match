# UniMatch — University Matching Webapp

## What this is
A single-page webapp where a student enters their GPA (or converts their school grades), picks fields of interest, and instantly sees which universities match their academic profile — with filters for country, tuition, and total cost of attendance.

## Stack
- Vite + React 18 (JavaScript, no TypeScript)
- Custom CSS design system in `src/styles.css` — NO Tailwind, no UI libraries
- University data lives in `src/data/universities.json` (static, bundled)
- No backend. Everything client-side. Deployable as a static site to Vercel.

## Design language
- Dark, premium academic look: deep navy background (#0B1220), card surfaces (#131C2E), accent gradient indigo→cyan (#6366F1 → #22D3EE)
- Font: system stack with "Inter" fallback via Google Fonts link in index.html
- Rounded 14px cards, soft shadows, generous whitespace
- Fully responsive: works at 375px mobile width and desktop

## Data model (universities.json — each record)
- id, name, country, city, region ("North America" | "Europe" | "Asia" | "Oceania" | "Middle East")
- minGPA (4.0 scale, admitted-student typical minimum)
- acceptanceRate (0–1)
- fields: array of tags from the canonical list below
- tuitionIntlUSD (per year, international student)
- livingCostUSD (per year estimate)
- applicationFeeUSD
- ranking (approximate world ranking band, integer)
- website

## Canonical field-of-interest tags
"Computer Science", "Engineering", "Business", "Medicine", "Law",
"Arts & Design", "Social Sciences", "Natural Sciences", "Mathematics",
"Economics", "Psychology", "Education", "Architecture"

## Matching logic (src/lib/match.js)
- Accept GPA on 4.0 scale directly, OR percentage (0–100), OR letter grade (A+…D) — convert all to 4.0 scale
- matchScore per university (0–100):
  - Academic fit 60%: how the student GPA compares to minGPA (full credit at/above; partial credit down to 0.4 below; "reach" label if within 0.2 below)
  - Interest fit 40%: overlap between chosen interests and university fields
- Label each result: "Safety" (GPA ≥ minGPA + 0.4), "Match" (within ±0.2), "Reach" (up to 0.4 below)
- Sort by matchScore desc

## Filters (applied after matching)
- Country (multi-select), Region quick chips
- Max tuition per year (slider)
- Max total annual cost = tuition + living (slider)
- Minimum match score toggle: show reaches on/off

## Rules
- Keep components small: App, ProfileForm, FilterBar, ResultsGrid, UniversityCard, StatsBar
- No router, no state library — useState/useMemo only
- Every commit must leave `npm run build` passing
