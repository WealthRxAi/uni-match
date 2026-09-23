import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ResultsGrid from "./components/ResultsGrid.jsx";
import { fetchCandidates, fetchCountries } from "./lib/queryUniversities.js";
import { matchUniversities } from "./lib/match.js";
import { filterResults, sortResults } from "./lib/filters.js";

// The full dataset (~6,300 rows across curated + Scorecard sources) lives in
// Supabase now, so slider bounds are fixed rather than derived client-side.
const bounds = {
  minTuition: 0,
  maxTuition: 80000,
  minTotal: 0,
  maxTotal: 120000,
};

function defaultFilters() {
  return {
    countries: [],
    region: null,
    maxTuition: bounds.maxTuition,
    maxTotalCost: bounds.maxTotal,
    showReaches: true,
  };
}

function App() {
  const [profile, setProfile] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState("match");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filtersOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setFiltersOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtersOpen]);

  useEffect(() => {
    fetchCountries()
      .then(setCountryOptions)
      .catch(() => setCountryOptions([]));
  }, []);

  async function runSearch(nextProfile, searchFilters) {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCandidates(nextProfile, searchFilters);
      setCandidates(rows);
      setProfile(nextProfile);
    } catch (err) {
      setError(err.message || "Something went wrong loading universities.");
    } finally {
      setLoading(false);
    }
  }

  function handleProfileSubmit({ gpa, interests }) {
    const nextFilters = {
      ...filters,
      maxTuition: bounds.maxTuition,
      maxTotalCost: bounds.maxTotal,
    };
    setFilters(nextFilters);
    setSortBy("match");
    runSearch({ gpa, interests }, nextFilters);
  }

  function retrySearch() {
    if (profile) runSearch(profile, filters);
  }

  function resetFilters() {
    setFilters(defaultFilters());
    setFiltersOpen(false);
  }

  const allResults = useMemo(() => {
    if (!profile) return [];
    return matchUniversities(profile, candidates);
  }, [profile, candidates]);

  const filteredResults = useMemo(() => {
    return filterResults(allResults, filters);
  }, [allResults, filters]);

  const sortedResults = useMemo(() => {
    return sortResults(filteredResults, sortBy);
  }, [filteredResults, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = filters.countries.length;
    if (filters.region) count += 1;
    if (filters.maxTuition < bounds.maxTuition) count += 1;
    if (filters.maxTotalCost < bounds.maxTotal) count += 1;
    if (!filters.showReaches) count += 1;
    return count;
  }, [filters]);

  return (
    <div className="app-shell">
      <Header />
      <main className="container app-main">
        <ProfileForm onSubmit={handleProfileSubmit} />

        {profile && (
          <>
            <button
              type="button"
              className="btn btn-secondary mobile-filters-toggle"
              onClick={() => setFiltersOpen(true)}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-count-badge">{activeFilterCount}</span>
              )}
            </button>

            <div
              className={`filter-bar-backdrop ${filtersOpen ? "filter-bar-backdrop--open" : ""}`}
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />

            <div
              className={`filter-bar-wrapper ${filtersOpen ? "filter-bar-wrapper--open" : ""}`}
            >
              <FilterBar
                filters={filters}
                onChange={setFilters}
                countryOptions={countryOptions}
                bounds={bounds}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </>
        )}

        {!loading && !error && <StatsBar results={sortedResults} />}
        <ResultsGrid
          results={sortedResults}
          hasSearched={profile !== null}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
          loading={loading}
          error={error}
          onRetry={retrySearch}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
