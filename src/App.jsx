import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ResultsGrid from "./components/ResultsGrid.jsx";
import universities from "./lib/loadUniversities.js";
import { matchUniversities } from "./lib/match.js";
import { filterResults, sortResults } from "./lib/filters.js";

const countryOptions = [...new Set(universities.map((u) => u.country))].sort();

const bounds = {
  minTuition: Math.min(...universities.map((u) => u.tuitionIntlUSD)),
  maxTuition: Math.max(...universities.map((u) => u.tuitionIntlUSD)),
  minTotal: Math.min(...universities.map((u) => u.tuitionIntlUSD + u.livingCostUSD)),
  maxTotal: Math.max(...universities.map((u) => u.tuitionIntlUSD + u.livingCostUSD)),
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

  useEffect(() => {
    if (!filtersOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setFiltersOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtersOpen]);

  function handleProfileSubmit({ gpa, interests }) {
    setProfile({ gpa, interests });
    setFilters((prev) => ({
      ...prev,
      maxTuition: bounds.maxTuition,
      maxTotalCost: bounds.maxTotal,
    }));
    setSortBy("match");
  }

  function resetFilters() {
    setFilters(defaultFilters());
    setFiltersOpen(false);
  }

  const allResults = useMemo(() => {
    if (!profile) return [];
    return matchUniversities(profile, universities);
  }, [profile]);

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

        <StatsBar results={sortedResults} />
        <ResultsGrid
          results={sortedResults}
          hasSearched={profile !== null}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
