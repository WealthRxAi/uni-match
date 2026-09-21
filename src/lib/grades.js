// Letter grade -> 4.0 scale, standard US unweighted scale
const LETTER_TO_GPA = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
};

export const SCALES = {
  GPA: "gpa",
  PERCENTAGE: "percentage",
  LETTER: "letter",
};

export const GRADE_OPTIONS = [
  { value: SCALES.GPA, label: "GPA (4.0 scale)" },
  { value: SCALES.PERCENTAGE, label: "Percentage (0-100)" },
  { value: SCALES.LETTER, label: "Letter grade" },
];

export const LETTER_GRADE_OPTIONS = Object.keys(LETTER_TO_GPA);

/**
 * Convert a grade input to a 4.0-scale GPA.
 * @param {number|string} input - raw GPA number, percentage number, or letter grade string
 * @param {string} scale - one of SCALES.GPA, SCALES.PERCENTAGE, SCALES.LETTER
 * @returns {number} GPA on a 4.0 scale, clamped to [0, 4.0]
 */
export function toGPA(input, scale) {
  if (scale === SCALES.LETTER) {
    const letter = String(input).trim().toUpperCase();
    if (!(letter in LETTER_TO_GPA)) {
      throw new Error(`Unrecognized letter grade: "${input}"`);
    }
    return LETTER_TO_GPA[letter];
  }

  const value = typeof input === "number" ? input : parseFloat(input);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric grade: "${input}"`);
  }

  if (scale === SCALES.PERCENTAGE) {
    const clamped = Math.min(100, Math.max(0, value));
    return Math.round((clamped / 100) * 4.0 * 100) / 100;
  }

  if (scale === SCALES.GPA) {
    return Math.min(4.0, Math.max(0, Math.round(value * 100) / 100));
  }

  throw new Error(`Unrecognized scale: "${scale}"`);
}
