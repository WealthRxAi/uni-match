Read CLAUDE.md. Migrate UniMatch from bundled JSON to a Supabase backend, keeping the design and matching logic intact.

Context:
- Supabase URL: https://toufekynlxvepmfuilav.supabase.co
- Anon (publishable) key: sb_publishable_q4GQZMX4yjpcsM2ZhYU84g_8BCldhWg
- Table public.unimatch_universities exists with columns: id text pk, name, country, city, region, state, min_gpa numeric, acceptance_rate numeric, fields text[], tuition_intl_usd int, living_cost_usd int, application_fee_usd int, total_annual_usd int (generated), ranking int, website, source ('curated'|'scorecard'), created_at. RLS: public SELECT for anon.
- The table will hold ~6,300 rows (300 curated global + ~6,000 US from College Scorecard, loaded separately).

Tasks:
1. npm install @supabase/supabase-js.
2. src/lib/supabase.js — create client from import.meta.env.VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, with fallback to the values above so the app works without env config. Add .env.example.
3. Replace the bundled-JSON data path: new src/lib/queryUniversities.js exporting async fetchCandidates(profile, filters) that queries unimatch_universities server-side: .lte('min_gpa', gpa + 0.4) (reach window), region/country filters, lte on tuition_intl_usd and total_annual_usd when set, order by ranking asc, limit 1500. Map rows from snake_case to the existing camelCase shape used by match.js (minGPA, tuitionIntlUSD, livingCostUSD, applicationFeeUSD, acceptanceRate, totalAnnualUSD, fields, etc.).
4. App.jsx: on "Find my matches" call fetchCandidates, then run the existing matchUniversities client-side on the returned rows. Add a loading state (spinner in Results area) and an error state with retry. Countries list for the FilterBar dropdown: query distinct countries once on mount (select country, use a lightweight approach; a select of country with limit 3000 then dedupe client-side is acceptable).
5. Add a "US state" text-search-friendly behavior only if trivial; otherwise skip.
6. Keep src/data/universities.json in the repo (it is the curated seed source) but stop importing it in the app bundle.
7. scripts/seed-supabase.mjs — Node script that upserts BOTH src/data/universities.json (source 'curated') and, if present, src/data/us-universities.json (source 'scorecard') into the table in batches of 500 using @supabase/supabase-js with SUPABASE_SERVICE_KEY from env (error out with a clear message if missing). Map camelCase→snake_case, skip total_annual_usd (generated column). Add "seed" npm script.
8. Update StatsBar/结果 copy anywhere that hardcodes counts. Search the whole src/ for "84" or "300" hardcoded and remove.
9. npm run test must still pass (matching logic unchanged); adjust tests only if imports broke. npm run build must pass.
