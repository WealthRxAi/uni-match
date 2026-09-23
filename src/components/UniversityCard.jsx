import { flagFor } from "../lib/countryFlags.js";

const BADGE_CLASS = {
  Safety: "badge--safety",
  Match: "badge--match",
  Reach: "badge--reach",
};

const RING_COLOR = {
  Safety: "var(--color-safety)",
  Match: "var(--color-match)",
  Reach: "var(--color-reach)",
};

function formatUSD(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatUSDCompact(amount) {
  return `$${Math.round(amount / 1000)}k`;
}

function admissionOddsTitle(result) {
  const { university, gpaGap } = result;
  const parts = [];
  if (typeof university.acceptanceRate === "number") {
    parts.push(`Acceptance rate ${Math.round(university.acceptanceRate * 100)}%`);
  }
  if (typeof gpaGap === "number") {
    const direction = gpaGap >= 0 ? "above" : "below";
    const sign = gpaGap >= 0 ? "+" : "-";
    parts.push(`your GPA is ${sign}${Math.abs(gpaGap).toFixed(1)} ${direction} typical minimum`);
  }
  return parts.join(" · ");
}

function ScoreRing({ score, label }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - score / 100);
  const color = RING_COLOR[label] || "var(--accent-indigo)";

  return (
    <div className="score-ring" role="img" aria-label={`Match score ${score} out of 100`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
          className="score-ring__progress"
        />
      </svg>
      <span className="score-ring__value">{score}</span>
    </div>
  );
}

function OutcomesStrip({ university }) {
  const chips = [];
  if (typeof university.gradRate === "number") {
    chips.push({ key: "grad", label: "Grad rate", value: `${Math.round(university.gradRate * 100)}%` });
  }
  if (typeof university.medianEarnings10yr === "number") {
    chips.push({
      key: "earnings",
      label: "Median earnings (10yr)",
      value: formatUSDCompact(university.medianEarnings10yr),
    });
  }
  if (typeof university.medianDebt === "number") {
    chips.push({ key: "debt", label: "Median debt", value: formatUSDCompact(university.medianDebt) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="university-card__outcomes">
      {chips.map((chip) => (
        <span key={chip.key} className="outcome-chip" title={chip.label}>
          <span className="outcome-chip__value">{chip.value}</span>
          <span className="outcome-chip__label">{chip.label}</span>
        </span>
      ))}
    </div>
  );
}

function InstitutionMeta({ university }) {
  const parts = [university.control, university.sizeBucket, university.settingType].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="university-card__institution-meta">{parts.join(" · ")}</p>;
}

function UniversityCard({ result, entranceDelay = 0, program, isCompared, onToggleCompare, compareFull }) {
  const { university, score, label } = result;
  const totalAnnual = university.tuitionIntlUSD + university.livingCostUSD;

  return (
    <article
      className="card university-card"
      style={{ animationDelay: `${entranceDelay}ms` }}
    >
      <div className="university-card__header">
        <div>
          <h3 className="university-card__name">{university.name}</h3>
          <p className="university-card__location">
            <span aria-hidden="true">{flagFor(university.country)}</span>{" "}
            {university.city}, {university.country}
          </p>
          <p className="university-card__total-line">≈ {formatUSD(totalAnnual)} total/yr</p>
        </div>
        <div className="university-card__header-actions">
          {onToggleCompare && (
            <button
              type="button"
              className={`university-card__compare-btn ${
                isCompared ? "university-card__compare-btn--active" : ""
              }`}
              onClick={() => onToggleCompare(university.id)}
              aria-pressed={isCompared}
              aria-label={
                isCompared ? `Remove ${university.name} from compare` : `Add ${university.name} to compare`
              }
              title={
                isCompared
                  ? "Remove from compare"
                  : compareFull
                    ? "Compare list is full (max 4)"
                    : "Add to compare"
              }
            >
              {isCompared ? "♥" : "+"}
            </button>
          )}
          <ScoreRing score={score} label={label} />
        </div>
      </div>

      <div className="university-card__meta">
        <span className={`badge ${BADGE_CLASS[label] || ""}`} title={admissionOddsTitle(result)}>
          {label}
        </span>
        <span className="university-card__ranking">World rank ~#{university.ranking}</span>
      </div>

      <InstitutionMeta university={university} />
      <OutcomesStrip university={university} />

      {program && (
        <p className="university-card__program">
          ★ {program.cipTitle}: {formatUSD(program.medianEarnings5yr)} median 5yr
        </p>
      )}

      <div className="chip-group university-card__fields">
        {university.fields.map((field) => (
          <span key={field} className="chip chip--static">
            {field}
          </span>
        ))}
      </div>

      <dl className="university-card__costs">
        <div>
          <dt>Tuition</dt>
          <dd>{formatUSD(university.tuitionIntlUSD)}/yr</dd>
        </div>
        <div>
          <dt>Living</dt>
          <dd>{formatUSD(university.livingCostUSD)}/yr</dd>
        </div>
        <div>
          <dt>App fee</dt>
          <dd>{formatUSD(university.applicationFeeUSD)}</dd>
        </div>
        <div>
          <dt>Total/yr</dt>
          <dd className="university-card__total">{formatUSD(totalAnnual)}</dd>
        </div>
      </dl>

      <a
        className="btn btn-secondary university-card__link"
        href={university.website}
        target="_blank"
        rel="noreferrer"
      >
        Visit website ↗
      </a>
    </article>
  );
}

export default UniversityCard;
