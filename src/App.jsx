import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ResultsGrid from "./components/ResultsGrid.jsx";
import CompareOverlay from "./components/CompareOverlay.jsx";
import {
  fetchCandidates,
  fetchCountries,
  fetchProgramsFor,
  fetchUniversitiesByIds,
} from "./lib/queryUniversities.js";
import { matchUniversities } from "./lib/match.js";
import { filterResults, sortResults } from "./lib/filters.js";
import { buildShareUrl, copyShareUrl, parseSearchParams } from "./lib/shareLink.js";
import { loadCompareIds, saveCompareIds, toggleCompareId, MAX_COMPARE } from "./lib/compareList.js";

// The full dataset (~6,300 rows across curated + Scorecard sources) lives in
// Supabase now, so slider bounds are fixed rather than derived client-side.
const bounds = {
  minTuition: 0,
  maxTuition: 80000,
  minTotal: 0,
  maxTotal: 120000,
};

const PAGE_SIZE = 30;

function defaultFilters() {
  return {
    countries: [],
    region: null,
    maxTuition: bounds.maxTuition,
    maxTotalCost: bounds.maxTotal,
    showReaches: true,
    control: [],
    sizeBucket: [],
    settingType: [],
    state: "",
    testPolicy: [],
    minGradRate: 0,
    flags: [],
  };
}

function App() {
  const [initialHydration] = useState(() => {
    if (typeof window === "undefined") return null;
    const parsed = parseSearchParams(window.location.search);
    return parsed.profile ? parsed : null;
  });

  const [profile, setProfile] = useState(null);
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters(),
    ...(initialHydration?.filters || {}),
  }));
  const [sortBy, setSortBy] = useState("match");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [shareStatus, setShareStatus] = useState(null);

  const [compareIds, setCompareIds] = useState(() => loadCompareIds());
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareDetails, setCompareDetails] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [comparePrograms, setComparePrograms] = useState({});

  const [programsById, setProgramsById] = useState({});
  const fetchedProgramIdsRef = useRef(new Set());

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

  useEffect(() => {
    saveCompareIds(compareIds);
  }, [compareIds]);

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

  // Hydrate from a shared link on first load.
  useEffect(() => {
    if (!initialHydration?.profile) return;
    const mergedFilters = { ...defaultFilters(), ...(initialHydration.filters || {}) };
    setSortBy("match");
    runSearch(initialHydration.profile, mergedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync with the current search so it stays shareable.
  useEffect(() => {
    if (!profile) return;
    const url = buildShareUrl(profile, filters);
    window.history.replaceState(null, "", url);
  }, [profile, filters]);

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

  // Reset pagination whenever the underlying result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortedResults]);

  const visibleResults = useMemo(() => {
    return sortedResults.slice(0, visibleCount);
  }, [sortedResults, visibleCount]);

  // Fetch program outcome data only for the currently-displayed page.
  useEffect(() => {
    if (!profile || !profile.interests?.length) return;
    const idsNeeding = visibleResults
      .map((r) => r.university.id)
      .filter((id) => !fetchedProgramIdsRef.current.has(id));
    if (idsNeeding.length === 0) return;

    const batch = idsNeeding.slice(0, 60);
    batch.forEach((id) => fetchedProgramIdsRef.current.add(id));

    fetchProgramsFor(batch, profile.interests)
      .then((map) => {
        setProgramsById((prev) => ({ ...prev, ...map }));
      })
      .catch(() => {});
  }, [visibleResults, profile]);

  // Clear the program cache when the profile (and its interests) changes.
  useEffect(() => {
    fetchedProgramIdsRef.current = new Set();
    setProgramsById({});
  }, [profile]);

  function handleToggleCompare(id) {
    setCompareIds((prev) => toggleCompareId(prev, id));
  }

  async function openCompare() {
    setCompareOpen(true);
    if (compareIds.length === 0) return;
    setCompareLoading(true);
    setCompareError(null);
    try {
      const details = await fetchUniversitiesByIds(compareIds);
      const orderedDetails = compareIds
        .map((id) => details.find((u) => u.id === id))
        .filter(Boolean);
      setCompareDetails(orderedDetails);

      if (profile?.interests?.length) {
        const programs = await fetchProgramsFor(compareIds, profile.interests);
        setComparePrograms(programs);
      } else {
        setComparePrograms({});
      }
    } catch (err) {
      setCompareError(err.message || "Couldn't load comparison.");
    } finally {
      setCompareLoading(false);
    }
  }

  function handleRemoveCompare(id) {
    setCompareIds((prev) => prev.filter((existing) => existing !== id));
    setCompareDetails((prev) => prev.filter((u) => u.id !== id));
  }

  const compareMatchById = useMemo(() => {
    if (!profile || compareDetails.length === 0) return {};
    const results = matchUniversities(profile, compareDetails);
    const map = {};
    for (const r of results) map[r.university.id] = r;
    return map;
  }, [profile, compareDetails]);

  async function handleShare() {
    const url = buildShareUrl(profile, filters);
    const ok = await copyShareUrl(url);
    setShareStatus(ok ? "copied" : "error");
    window.setTimeout(() => setShareStatus(null), 2000);
  }

  const activeFilterCount = useMemo(() => {
    let count = filters.countries.length;
    if (filters.region) count += 1;
    if (filters.maxTuition < bounds.maxTuition) count += 1;
    if (filters.maxTotalCost < bounds.maxTotal) count += 1;
    if (!filters.showReaches) count += 1;
    count += filters.control?.length || 0;
    count += filters.sizeBucket?.length || 0;
    count += filters.settingType?.length || 0;
    if (filters.state) count += 1;
    count += filters.testPolicy?.length || 0;
    if (filters.minGradRate > 0) count += 1;
    count += filters.flags?.length || 0;
    return count;
  }, [filters]);

  return (
    <div className="app-shell">
      <Header />
      <main className="container app-main">
        <ProfileForm onSubmit={handleProfileSubmit} initialProfile={initialHydration?.profile} />

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
          results={visibleResults}
          totalCount={sortedResults.length}
          hasSearched={profile !== null}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
          loading={loading}
          error={error}
          onRetry={retrySearch}
          onLoadMore={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedResults.length))}
          compareIds={compareIds}
          compareMax={MAX_COMPARE}
          onToggleCompare={handleToggleCompare}
          programsById={programsById}
          onShare={handleShare}
          shareStatus={shareStatus}
        />
      </main>
      <Footer />

      {compareIds.length > 0 && (
        <button type="button" className="compare-float-btn" onClick={openCompare}>
          Compared ({compareIds.length})
        </button>
      )}

      <CompareOverlay
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        universities={compareDetails}
        loading={compareLoading}
        error={compareError}
        matchById={compareMatchById}
        programsById={comparePrograms}
        onRemove={handleRemoveCompare}
      />
    </div>
  );
}

export default App;
