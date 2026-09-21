import { useMemo, useRef, useState } from "react";

const REGIONS = ["North America", "Europe", "Asia", "Oceania", "Middle East"];

function formatUSD(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function CountrySelect({ countryOptions, selected, onToggle }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countryOptions;
    return countryOptions.filter((country) => country.toLowerCase().includes(q));
  }, [countryOptions, query]);

  function handleBlur(e) {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setOpen(false);
    }
  }

  return (
    <div className="country-select" ref={containerRef} onBlur={handleBlur}>
      <input
        type="text"
        className="input country-select__input"
        placeholder="Search countries…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        role="combobox"
        aria-expanded={open}
        aria-controls="country-select-list"
        aria-label="Search countries"
      />

      {open && (
        <ul id="country-select-list" className="country-select__dropdown" role="listbox">
          {filteredOptions.length === 0 ? (
            <li className="country-select__empty">No countries found</li>
          ) : (
            filteredOptions.map((country) => {
              const isSelected = selected.includes(country);
              return (
                <li key={country} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`country-select__option ${
                      isSelected ? "country-select__option--active" : ""
                    }`}
                    onClick={() => onToggle(country)}
                  >
                    <span>{country}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="chip-group country-select__selected">
          {selected.map((country) => (
            <button
              type="button"
              key={country}
              className="chip chip--active"
              onClick={() => onToggle(country)}
              aria-label={`Remove ${country} filter`}
            >
              {country} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({ filters, onChange, countryOptions, bounds, onClose }) {
  function toggleCountry(country) {
    const next = filters.countries.includes(country)
      ? filters.countries.filter((c) => c !== country)
      : [...filters.countries, country];
    onChange({ ...filters, countries: next });
  }

  function toggleRegion(region) {
    onChange({ ...filters, region: filters.region === region ? null : region });
  }

  return (
    <section className="card filter-bar" aria-labelledby="filters-heading">
      <div className="filter-bar__header">
        <h2 id="filters-heading" className="section-title filter-bar__title">
          Filters
        </h2>
        {onClose && (
          <button
            type="button"
            className="filter-bar__close"
            onClick={onClose}
            aria-label="Close filters"
          >
            ✕
          </button>
        )}
      </div>

      <div className="field">
        <span className="field__label">Region</span>
        <div className="chip-group">
          {REGIONS.map((region) => (
            <button
              type="button"
              key={region}
              className={`chip ${filters.region === region ? "chip--active" : ""}`}
              aria-pressed={filters.region === region}
              onClick={() => toggleRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Country</span>
        <CountrySelect
          countryOptions={countryOptions}
          selected={filters.countries}
          onToggle={toggleCountry}
        />
      </div>

      <div className="filter-bar__sliders">
        <div className="field">
          <label className="field__label" htmlFor="max-tuition">
            Max tuition/yr: {formatUSD(filters.maxTuition)}
          </label>
          <input
            id="max-tuition"
            type="range"
            className="slider"
            min={bounds.minTuition}
            max={bounds.maxTuition}
            step="500"
            value={filters.maxTuition}
            onChange={(e) => onChange({ ...filters, maxTuition: Number(e.target.value) })}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="max-total">
            Max total cost/yr: {formatUSD(filters.maxTotalCost)}
          </label>
          <input
            id="max-total"
            type="range"
            className="slider"
            min={bounds.minTotal}
            max={bounds.maxTotal}
            step="500"
            value={filters.maxTotalCost}
            onChange={(e) => onChange({ ...filters, maxTotalCost: Number(e.target.value) })}
          />
        </div>
      </div>

      <label className="filter-bar__toggle">
        <input
          type="checkbox"
          checked={filters.showReaches}
          onChange={(e) => onChange({ ...filters, showReaches: e.target.checked })}
        />
        Show reach schools
      </label>
    </section>
  );
}

export default FilterBar;
