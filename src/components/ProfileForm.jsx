import { useState } from "react";
import { GRADE_OPTIONS, LETTER_GRADE_OPTIONS, SCALES, toGPA } from "../lib/grades.js";

const FIELD_TAGS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts & Design",
  "Social Sciences",
  "Natural Sciences",
  "Mathematics",
  "Economics",
  "Psychology",
  "Education",
  "Architecture",
];

function ProfileForm({ onSubmit }) {
  const [scale, setScale] = useState(SCALES.GPA);
  const [grade, setGrade] = useState("");
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState(null);

  function toggleInterest(tag) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (grade === "" || grade === undefined) {
      setError("Enter your grade first.");
      return;
    }

    let gpa;
    try {
      gpa = toGPA(grade, scale);
    } catch {
      setError("Enter a valid grade for the selected scale.");
      return;
    }

    setError(null);
    onSubmit({ gpa, interests });
  }

  return (
    <section className="card" aria-labelledby="profile-heading">
      <form onSubmit={handleSubmit} className="profile-form">
        <h2 id="profile-heading" className="section-title">
          Your Profile
        </h2>

        <div className="profile-form__grade-row">
          <div className="field">
            <label className="field__label" htmlFor="scale-select">
              Grade scale
            </label>
            <select
              id="scale-select"
              className="select"
              value={scale}
              onChange={(e) => {
                setScale(e.target.value);
                setGrade("");
              }}
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="grade-input">
              Your grade
            </label>
            {scale === SCALES.LETTER ? (
              <select
                id="grade-input"
                className="select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="" disabled>
                  Select a letter grade
                </option>
                {LETTER_GRADE_OPTIONS.map((letter) => (
                  <option key={letter} value={letter}>
                    {letter}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="grade-input"
                className="input"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={scale === SCALES.PERCENTAGE ? 100 : 4.0}
                placeholder={scale === SCALES.PERCENTAGE ? "e.g. 88" : "e.g. 3.7"}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Fields of interest</span>
          <div className="chip-group" role="group" aria-label="Fields of interest">
            {FIELD_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`chip ${interests.includes(tag) ? "chip--active" : ""}`}
                aria-pressed={interests.includes(tag)}
                onClick={() => toggleInterest(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="profile-form__error">{error}</p>}

        <button type="submit" className="btn btn-primary profile-form__submit">
          Find my matches
        </button>
      </form>
    </section>
  );
}

export default ProfileForm;
