# UniMatch

Find universities that fit your grades, your interests, and your budget — all
in the browser, no sign-up required.

Enter your GPA (or convert from a percentage or letter grade), pick a few
fields you're interested in, and instantly see a ranked list from **3,500+
universities worldwide** — with filters for country, region, tuition, total
cost of attendance, school type, size, campus setting, US state, test policy,
and graduation rate. Every US school comes with real outcome data (graduation
rate, median earnings, median debt) and program-level earnings by field of
study, straight from the US Department of Education's College Scorecard.

> 📸 **Screenshot placeholder** — drop a screenshot at `docs/screenshot.png`
> and reference it here with `![UniMatch](docs/screenshot.png)` once the app
> has a look you want to capture.

## How matching works

Every university gets a **match score from 0–100**, calculated as:

```
matchScore = academicFit * 0.6 + interestFit * 0.4
```

**Academic fit (60% of the score)** compares your GPA (converted to a 4.0
scale) against a university's typical admitted-student minimum GPA:

- Your GPA at or above the minimum → full credit (100%)
- Up to 0.4 below the minimum → partial credit, scaled linearly down to 0%
- More than 0.4 below the minimum → 0%

**Interest fit (40% of the score)** is the percentage overlap between the
fields of interest you picked and the university's fields of study. If you
don't pick any interests, this is treated as neutral (100%) so it doesn't
penalize your score.

Each result is also given a label based on the gap between your GPA and the
university's minimum GPA:

| Label     | Condition                          |
| --------- | ----------------------------------- |
| `Safety`  | Your GPA is ≥ minGPA + 0.4          |
| `Match`   | Your GPA is within ±0.2 of minGPA   |
| `Reach`   | Your GPA is up to 0.4 below minGPA  |

Results are sorted by match score, and can be re-sorted by total annual cost
or world ranking, then filtered by country, region, max tuition, max total
annual cost (tuition + estimated living costs), school type
(public / private nonprofit / private for-profit), size, campus setting,
US state, test policy, minimum graduation rate, and special-mission flags
(HBCU, HSI, Tribal, women's/men's colleges, religious affiliation).

You can also pin schools to a **compare tray** for a side-by-side view, and
every search is encoded in the URL, so a filtered shortlist can be shared
with a link.

## The dataset

| Slice | Count | Source |
| --- | --- | --- |
| US universities | 3,219 | [US Dept. of Education College Scorecard](https://collegescorecard.ed.gov/data/) (public domain) |
| International universities | ~290 across 60+ countries | Curated dataset (`src/data/universities.json`) |
| Program-level earnings records | 10,700+ | College Scorecard field-of-study files |

US records include institutional outcomes — graduation rate, first-year
retention, median earnings 10 years after entry, median student debt, SAT
averages, and test policies — plus median earnings by field of study one and
five years after graduation. Scorecard data is reprocessed with
`scripts/process-scorecard.py`; international records are curated estimates
intended for shortlisting, not as a substitute for a university's own
published figures. Corrections and additions are welcome via pull request.

Grades can be entered as a raw 4.0-scale GPA, a percentage (0–100), or a
letter grade (A+ through D) — all are converted to a 4.0 scale before
matching. See `src/lib/grades.js` and `src/lib/match.js` for the
implementation.

## Running locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts a Vite dev server (default: http://localhost:5173). University
data is queried from Supabase (`src/lib/queryUniversities.js`); a publishable
anon key with sane fallbacks is baked into `src/lib/supabase.js`, so no `.env`
file is required to run the app. Copy `.env.example` to `.env` to point at a
different Supabase project.

### Other scripts

```bash
npm run validate   # validate src/data/universities.json against the schema
npm run test       # run the matching/grading/filtering logic test suite
npm run build      # produce a production build in dist/
npm run preview    # locally preview the production build
npm run seed       # upsert src/data/*.json into Supabase (needs SUPABASE_SERVICE_KEY)
```

## Deploying to Vercel

UniMatch is a static, client-side Vite app that reads from Supabase — no
build-time environment variables are required, since a fallback URL/anon key
are baked in. To point at a different Supabase project, set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project's
environment variables.

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, click **Add New Project** and import the repository.
3. Vercel auto-detects the Vite framework preset:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**.

The included `vercel.json` ensures client-side routing/SPA fallbacks resolve
correctly if the app ever grows additional routes.

You can also deploy from the CLI:

```bash
npm install -g vercel
vercel --prod
```

## Tech stack

- Vite + React 18 (JavaScript, no TypeScript)
- Custom CSS design system (`src/styles.css`) — no Tailwind, no UI libraries
- Supabase (`public.unimatch_universities` + `public.unimatch_programs`) as
  the dataset backend, queried client-side via `@supabase/supabase-js` with
  all filtering pushed down to the database
- `src/data/universities.json` remains as the curated seed source for
  `npm run seed`, but is no longer imported into the app bundle
- No custom server — fully deployable as a static site
