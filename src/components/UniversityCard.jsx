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

function UniversityCard({ result, entranceDelay = 0 }) {
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
        <ScoreRing score={score} label={label} />
      </div>

      <div className="university-card__meta">
        <span className={`badge ${BADGE_CLASS[label] || ""}`}>{label}</span>
        <span className="university-card__ranking">World rank ~#{university.ranking}</span>
      </div>

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
