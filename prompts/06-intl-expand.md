Read CLAUDE.md. Expand src/data/universities.json from 84 to 300 international-focused records.

Rules:
1. KEEP all 84 existing records unchanged (same ids). Append 216 new ones with ids continuing the existing scheme.
2. New entries: real universities, global spread — go deeper per country rather than only famous ones: more UK (Russell Group + solid post-92s), Germany (TU9 + strong publics), France, Netherlands, Spain, Italy, Nordics, Poland, Czechia, Portugal, Ireland, Switzerland, Austria, Belgium; Asia: Japan, South Korea, China (C9 + strong provincials), India (IITs/NITs/central), Singapore, Malaysia, Taiwan, Hong Kong, Thailand, Indonesia, Vietnam, Philippines; Oceania: all Go8 + strong NZ; Middle East/Africa: UAE, Qatar, Saudi, Turkey, Israel, Egypt, Morocco, South Africa, Kenya, Nigeria; Americas beyond US: Canada (U15 + more), Mexico, Brazil, Argentina, Chile, Colombia.
3. Follow the schema exactly (validator must pass): minGPA spread across all four selectivity tiers, 3-6 canonical field tags, realistic international tuition, living costs per city, application fees, approximate world ranking bands (use 9999 for unranked), real websites.
4. Region values must stay within the existing five: "North America", "Europe", "Asia", "Oceania", "Middle East" — put African universities under "Middle East"?? NO: instead ADD two new region values "Africa" and "South America" to the validator and data, and update src/lib/ or components only if a region list is hardcoded anywhere (check FilterBar and CLAUDE.md region chips).
5. Run npm run validate until all 300 pass, then npm run test and npm run build — all green.
6. Update README.md count mentions from 84 to 300.
