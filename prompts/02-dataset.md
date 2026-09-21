Read CLAUDE.md. Create src/data/universities.json with 84 real universities following the data model exactly.

Requirements:
- Global spread: ~22 North America (US + Canada), ~24 Europe (UK, Germany, Netherlands, France, Switzerland, Italy, Spain, Nordics, Ireland), ~20 Asia (Japan, South Korea, Singapore, Hong Kong, China, India, Malaysia), ~8 Oceania (Australia, NZ), ~10 Middle East + rest (UAE, Qatar, Turkey, Israel, Saudi Arabia)
- Mix of selectivity: elite (minGPA 3.7+), strong (3.3–3.7), solid (2.8–3.3), accessible (2.2–2.8) — roughly a quarter each
- Realistic international tuition (e.g., German publics near zero, UK £, US privates high), realistic living costs per city, real application fees, approximate world ranking bands, real websites
- Every university gets 3–6 field tags from the canonical list only
- Values should be sensible estimates a tutorial viewer would find credible; exact precision is not required

Then create src/lib/loadUniversities.js that imports the JSON and exports it with derived field `totalAnnualUSD = tuitionIntlUSD + livingCostUSD`.
Write a small validation script scripts/validate-data.mjs (node) that checks every record against the schema (required keys, tag validity, numeric ranges) and run it until the dataset passes. Add "validate" to package.json scripts.
