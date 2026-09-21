Read CLAUDE.md. Build the matching engine and the core UI.

1. src/lib/grades.js — toGPA(input, scale) supporting: 4.0-scale number, percentage 0–100, letter grades A+ through D. Export GRADE_OPTIONS for the UI.
2. src/lib/match.js — implement matchScore + labels exactly as CLAUDE.md specifies. Export matchUniversities(profile, universities) returning sorted results with { university, score, label, gpaGap }.
3. ProfileForm component — grade input with a scale selector (GPA / Percentage / Letter), interest picker as toggleable chips (canonical tags), and a prominent "Find my matches" button.
4. ResultsGrid + UniversityCard — card shows name, city+country flag emoji, match score as an animated ring or bar, Safety/Match/Reach badge (color-coded: green/indigo/amber), field tags, tuition + living + application fee, ranking band, website link.
5. StatsBar above results: total matches, count by label, cheapest option, best-fit country.
6. Wire it all in App.jsx with useState/useMemo. Empty state before first search: friendly illustration made of CSS, short copy.
7. `npm run build` must pass. Also add 8 unit-style assertions in scripts/test-match.mjs (plain node asserts) covering grade conversion and labeling, add "test" script, and make them pass.
