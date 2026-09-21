function formatUSD(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function StatsBar({ results }) {
  if (!results || results.length === 0) return null;

  const countByLabel = results.reduce((acc, r) => {
    acc[r.label] = (acc[r.label] || 0) + 1;
    return acc;
  }, {});

  const cheapest = results.reduce((min, r) => {
    const total = r.university.tuitionIntlUSD + r.university.livingCostUSD;
    const minTotal = min.university.tuitionIntlUSD + min.university.livingCostUSD;
    return total < minTotal ? r : min;
  }, results[0]);

  const countryScores = results.reduce((acc, r) => {
    const country = r.university.country;
    if (!acc[country]) acc[country] = { total: 0, count: 0 };
    acc[country].total += r.score;
    acc[country].count += 1;
    return acc;
  }, {});

  const bestCountry = Object.entries(countryScores).sort(
    (a, b) => b[1].total / b[1].count - a[1].total / a[1].count
  )[0]?.[0];

  return (
    <section className="stats-bar" aria-label="Match statistics">
      <div className="stat">
        <span className="stat__value">{results.length}</span>
        <span className="stat__label">Total matches</span>
      </div>
      <div className="stat">
        <span className="stat__value">{countByLabel.Safety || 0}</span>
        <span className="stat__label">Safety</span>
      </div>
      <div className="stat">
        <span className="stat__value">{countByLabel.Match || 0}</span>
        <span className="stat__label">Match</span>
      </div>
      <div className="stat">
        <span className="stat__value">{countByLabel.Reach || 0}</span>
        <span className="stat__label">Reach</span>
      </div>
      <div className="stat">
        <span className="stat__value stat__value--small">{cheapest.university.name}</span>
        <span className="stat__label">
          Cheapest option ·{" "}
          {formatUSD(cheapest.university.tuitionIntlUSD + cheapest.university.livingCostUSD)}/yr
        </span>
      </div>
      <div className="stat">
        <span className="stat__value stat__value--small">{bestCountry}</span>
        <span className="stat__label">Best-fit country</span>
      </div>
    </section>
  );
}

export default StatsBar;
