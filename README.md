# UniMatch

Find universities that fit your grades, your interests, and your budget — all
in the browser, no sign-up required.

Enter your GPA (or convert from a percentage or letter grade), pick a few
fields you're interested in, and instantly see a ranked list of universities
with filters for country, region, tuition, and total cost of attendance.

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
or world ranking, then filtered by country, region, max tuition, and max
total annual cost (tuition + estimated living costs).

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
- Supabase (`public.unimatch_universities`) as the university dataset backend,
  queried client-side via `@supabase/supabase-js`
- `src/data/universities.json` remains as the curated seed source for
  `npm run seed`, but is no longer imported into the app bundle
- No custom server — fully deployable as a static site
