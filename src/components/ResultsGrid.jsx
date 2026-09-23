import UniversityCard from "./UniversityCard.jsx";

const SORT_OPTIONS = [
  { value: "match", label: "Best match" },
  { value: "cost", label: "Lowest total cost" },
  { value: "ranking", label: "Ranking" },
];

function EmptyState() {
  return (
    <div className="empty-state" aria-live="polite">
      <div className="empty-state__illustration" aria-hidden="true">
        <div className="empty-state__cap" />
        <div className="empty-state__book" />
      </div>
      <h3 className="empty-state__title">Your matches will show up here</h3>
      <p className="empty-state__body">
        Tell us your grades and interests above, then hit "Find my matches" to see
        universities that fit.
      </p>
    </div>
  );
}

function NoResults({ onReset }) {
  return (
    <div className="empty-state" aria-live="polite">
      <div className="empty-state__illustration" aria-hidden="true">
        <div className="empty-state__cap" />
        <div className="empty-state__book" />
      </div>
      <h3 className="empty-state__title">No universities match these filters</h3>
      <p className="empty-state__body">Try widening your budget or country filters.</p>
      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Relax filters
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="empty-state" aria-live="polite" aria-busy="true">
      <div className="spinner" role="status" aria-label="Loading matches" />
      <h3 className="empty-state__title">Finding your matches…</h3>
      <p className="empty-state__body">Searching universities that fit your profile.</p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="empty-state" aria-live="assertive">
      <div className="empty-state__illustration" aria-hidden="true">
        <div className="empty-state__cap" />
        <div className="empty-state__book" />
      </div>
      <h3 className="empty-state__title">Couldn't load universities</h3>
      <p className="empty-state__body">{error}</p>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function ResultsGrid({
  results,
  hasSearched,
  sortBy,
  onSortChange,
  onReset,
  loading,
  error,
  onRetry,
}) {
  return (
    <section aria-labelledby="results-heading">
      <div className="results-header">
        <h2 id="results-heading" className="section-title results-heading">
          Results
        </h2>
        {hasSearched && results.length > 0 && (
          <label className="results-sort">
            <span className="field__label">Sort by</span>
            <select
              className="select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !hasSearched ? (
        <EmptyState />
      ) : results.length === 0 ? (
        <NoResults onReset={onReset} />
      ) : (
        <div className="results-grid">
          {results.map((result, index) => (
            <UniversityCard
              key={result.university.id}
              result={result}
              entranceDelay={Math.min(index, 10) * 40}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ResultsGrid;
