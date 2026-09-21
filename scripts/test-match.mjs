#!/usr/bin/env node
import assert from "node:assert/strict";
import { toGPA, SCALES } from "../src/lib/grades.js";
import { matchUniversities, LABELS } from "../src/lib/match.js";
import { filterResults, sortResults } from "../src/lib/filters.js";

// --- grade conversion ---

// 1. GPA scale passes through unchanged (clamped to 2dp)
assert.equal(toGPA(3.7, SCALES.GPA), 3.7);

// 2. GPA scale clamps above 4.0
assert.equal(toGPA(4.5, SCALES.GPA), 4.0);

// 3. Percentage converts proportionally to 4.0 scale
assert.equal(toGPA(100, SCALES.PERCENTAGE), 4.0);
assert.equal(toGPA(50, SCALES.PERCENTAGE), 2.0);

// 4. Letter grade converts to expected GPA value
assert.equal(toGPA("A", SCALES.LETTER), 4.0);
assert.equal(toGPA("b-", SCALES.LETTER), 2.7);

// 5. Unknown letter grade throws
assert.throws(() => toGPA("Z", SCALES.LETTER));

// 6. A near-miss letter grade not on the canonical A+...D scale throws
assert.throws(() => toGPA("D-", SCALES.LETTER));
assert.throws(() => toGPA("F", SCALES.LETTER));

// 7. Letter grade is case-insensitive and tolerates surrounding whitespace
assert.equal(toGPA("  a+  ", SCALES.LETTER), 4.0);

// 8. Empty/blank grade input throws rather than silently producing NaN
assert.throws(() => toGPA("", SCALES.GPA));
assert.throws(() => toGPA("", SCALES.PERCENTAGE));
assert.throws(() => toGPA("   ", SCALES.PERCENTAGE));

// 9. Non-numeric / partial-number strings throw instead of yielding NaN
assert.throws(() => toGPA(".", SCALES.GPA));
assert.throws(() => toGPA("abc", SCALES.PERCENTAGE));

// 10. Out-of-range numeric grades clamp instead of throwing or going negative
assert.equal(toGPA(-10, SCALES.PERCENTAGE), 0);
assert.equal(toGPA(-1, SCALES.GPA), 0);
assert.equal(toGPA(150, SCALES.PERCENTAGE), 4.0);

// --- matching + labeling ---

const university = {
  id: "test-u",
  name: "Test University",
  country: "Testland",
  city: "Test City",
  region: "Europe",
  minGPA: 3.5,
  acceptanceRate: 0.3,
  fields: ["Computer Science", "Mathematics"],
  tuitionIntlUSD: 20000,
  livingCostUSD: 10000,
  applicationFeeUSD: 50,
  ranking: 100,
  website: "https://example.com",
};

// 11. GPA well above minGPA + full interest overlap -> Safety label, high score
const [safetyResult] = matchUniversities(
  { gpa: 4.0, interests: ["Computer Science"] },
  [university]
);
assert.equal(safetyResult.label, LABELS.SAFETY);
assert.ok(safetyResult.score >= 90, `expected high score, got ${safetyResult.score}`);

// 12. GPA within the core band around minGPA -> Match label
const [matchResult] = matchUniversities({ gpa: 3.5, interests: [] }, [university]);
assert.equal(matchResult.label, LABELS.MATCH);

// 13. GPA notably below minGPA -> Reach label with reduced academic score
const [reachResult] = matchUniversities({ gpa: 3.1, interests: [] }, [university]);
assert.equal(reachResult.label, LABELS.REACH);
assert.ok(reachResult.score < matchResult.score);

// 14. Label boundaries: exactly +0.4 is Safety, just under is Match;
//     exactly -0.2 is still Match, just past it is Reach
assert.equal(matchUniversities({ gpa: 3.9, interests: [] }, [university])[0].label, LABELS.SAFETY);
assert.equal(matchUniversities({ gpa: 3.89, interests: [] }, [university])[0].label, LABELS.MATCH);
assert.equal(matchUniversities({ gpa: 3.3, interests: [] }, [university])[0].label, LABELS.MATCH);
assert.equal(matchUniversities({ gpa: 3.29, interests: [] }, [university])[0].label, LABELS.REACH);

// 15. No overlap between interests and fields scores 0 on interest fit
//     (i.e. no division-by-zero / NaN when interests are chosen but unmatched)
const [noOverlapResult] = matchUniversities(
  { gpa: 4.0, interests: ["Law"] },
  [university]
);
assert.equal(noOverlapResult.score, 60); // 100% academic * 0.6 + 0% interest * 0.4
assert.ok(!Number.isNaN(noOverlapResult.score));

// --- filtering ---

const cheap = { ...university, id: "cheap", tuitionIntlUSD: 5000, livingCostUSD: 5000 };
const pricey = { ...university, id: "pricey", tuitionIntlUSD: 40000, livingCostUSD: 20000 };
const baseResults = matchUniversities({ gpa: 4.0, interests: [] }, [cheap, pricey]);

function baseFilters(overrides = {}) {
  return {
    countries: [],
    region: null,
    maxTuition: 100000,
    maxTotalCost: 100000,
    showReaches: true,
    ...overrides,
  };
}

// 16. Contradictory filters (cap below every remaining university's total
//     cost, e.g. below the cheapest tuition) yield an empty array, not a crash
const contradictory = filterResults(baseResults, baseFilters({ maxTotalCost: 1000 }));
assert.deepEqual(contradictory, []);

// 17. Max total cost below the pricey school's total, but above the cheap
//     school's, keeps only the affordable one
const partial = filterResults(baseResults, baseFilters({ maxTotalCost: 15000 }));
assert.equal(partial.length, 1);
assert.equal(partial[0].university.id, "cheap");

// 18. Hiding reaches removes Reach-labeled results without affecting others
const [reachU] = matchUniversities({ gpa: 3.1, interests: [] }, [university]);
assert.equal(filterResults([reachU], baseFilters({ showReaches: false })).length, 0);
assert.equal(filterResults([reachU], baseFilters({ showReaches: true })).length, 1);

// 19. Sorting an empty result set never throws
assert.deepEqual(sortResults([], "cost"), []);

console.log("All assertions passed.");
