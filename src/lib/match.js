export const LABELS = {
  SAFETY: "Safety",
  MATCH: "Match",
  REACH: "Reach",
};

const SAFETY_THRESHOLD = 0.4;
const REACH_THRESHOLD = -0.2;
const MAX_ACADEMIC_DEFICIT = 0.4;

/**
 * Academic fit as a 0-100 percentage.
 * Full credit once the student's GPA meets or exceeds minGPA.
 * Partial (linear) credit for GPA up to 0.4 below minGPA, zero beyond that.
 */
function academicFitPercent(gpa, minGPA) {
  const gap = gpa - minGPA;
  if (gap >= 0) return 100;
  if (gap <= -MAX_ACADEMIC_DEFICIT) return 0;
  return 100 * (1 + gap / MAX_ACADEMIC_DEFICIT);
}

/**
 * Interest fit as a 0-100 percentage: overlap between chosen interests and
 * the university's fields. No interests selected is treated as neutral (100%).
 */
function interestFitPercent(interests, fields) {
  if (!interests || interests.length === 0) return 100;
  const fieldSet = new Set(fields);
  const overlap = interests.filter((interest) => fieldSet.has(interest)).length;
  return (overlap / interests.length) * 100;
}

/**
 * Safety: comfortably at/above minGPA. Reach: notably below minGPA.
 * Match: everything in between, including the ±0.2 core band.
 */
function labelFor(gap) {
  if (gap >= SAFETY_THRESHOLD) return LABELS.SAFETY;
  if (gap < REACH_THRESHOLD) return LABELS.REACH;
  return LABELS.MATCH;
}

/**
 * @param {{ gpa: number, interests: string[] }} profile - gpa on a 4.0 scale
 * @param {Array} universities
 * @returns {Array<{ university: object, score: number, label: string, gpaGap: number }>}
 *   sorted by score descending
 */
export function matchUniversities(profile, universities) {
  const { gpa, interests = [] } = profile;

  const results = universities.map((university) => {
    const gap = Math.round((gpa - university.minGPA) * 100) / 100;
    const academicPercent = academicFitPercent(gpa, university.minGPA);
    const interestPercent = interestFitPercent(interests, university.fields);
    const score = Math.round(academicPercent * 0.6 + interestPercent * 0.4);

    return {
      university,
      score: Math.min(100, Math.max(0, score)),
      label: labelFor(gap),
      gpaGap: gap,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
