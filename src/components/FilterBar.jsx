import { useMemo, useRef, useState } from "react";
import { US_STATES } from "../lib/usStates.js";

const REGIONS = ["North America", "Europe", "Asia", "Oceania", "Middle East", "Africa", "South America"];
const CONTROL_OPTIONS = ["Public", "Private nonprofit", "Private for-profit"];
const SIZE_OPTIONS = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
];
const SETTING_OPTIONS = ["City", "Suburb", "Town", "Rural"];
const TEST_POLICY_OPTIONS = ["Required", "Optional", "Not considered"];
const FLAG_OPTIONS = [
  { value: "HBCU", label: "HBCU" },
  { value: "HSI", label: "HSI" },
  { value: "Women only", label: "Women only" },
];

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

function ChipGroup({ label, options, selected, onToggle, getValue, getLabel }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="chip-group" role="group" aria-label={label}>
        {options.map((option) => {
          const value = getValue ? getValue(option) : option;
          const text = getLabel ? getLabel(option) : option;
          const isActive = selected.includes(value);
          return (
            <button
              type="button"
              key={value}
              className={`chip ${isActive ? "chip--active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onToggle(value)}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_ARRAY = [];

function moreFilterCount(filters) {
  let count = 0;
  count += filters.control?.length || 0;
  count += filters.sizeBucket?.length || 0;
  count += filters.settingType?.length || 0;
  if (filters.state) count += 1;
  count += filters.testPolicy?.length || 0;
  if (filters.minGradRate > 0) count += 1;
  count += filters.flags?.length || 0;
  return count;
}

function FilterBar({ filters, onChange, countryOptions, bounds, onClose }) {
  const [moreOpen, setMoreOpen] = useState(false);

  function toggleCountry(country) {
    const next = filters.countries.includes(country)
      ? filters.countries.filter((c) => c !== country)
      : [...filters.countries, country];
    onChange({ ...filters, countries: next });
  }

  function toggleRegion(region) {
    onChange({ ...filters, region: filters.region === region ? null : region });
  }

  function toggleArrayFilter(key, value) {
    const current = filters[key] || EMPTY_ARRAY;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  const activeMoreCount = moreFilterCount(filters);

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

      <button
        type="button"
        className="filter-bar__more-toggle"
        onClick={() => setMoreOpen((prev) => !prev)}
        aria-expanded={moreOpen}
        aria-controls="filter-bar-more"
      >
        <span>More filters</span>
        {activeMoreCount > 0 && <span className="filter-count-badge">{activeMoreCount}</span>}
        <span className="filter-bar__more-caret" aria-hidden="true">
          {moreOpen ? "▲" : "▼"}
        </span>
      </button>

      {moreOpen && (
        <div id="filter-bar-more" className="filter-bar__more">
          <ChipGroup
            label="Type"
            options={CONTROL_OPTIONS}
            selected={filters.control || EMPTY_ARRAY}
            onToggle={(value) => toggleArrayFilter("control", value)}
          />

          <ChipGroup
            label="Size"
            options={SIZE_OPTIONS}
            selected={filters.sizeBucket || EMPTY_ARRAY}
            onToggle={(value) => toggleArrayFilter("sizeBucket", value)}
            getValue={(opt) => opt.value}
            getLabel={(opt) => opt.label}
          />

          <ChipGroup
            label="Setting"
            options={SETTING_OPTIONS}
            selected={filters.settingType || EMPTY_ARRAY}
            onToggle={(value) => toggleArrayFilter("settingType", value)}
          />

          <div className="field">
            <label className="field__label" htmlFor="state-select">
              US state
            </label>
            <select
              id="state-select"
              className="select"
              value={filters.state || ""}
              onChange={(e) => onChange({ ...filters, state: e.target.value })}
            >
              <option value="">Any state</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <ChipGroup
            label="Test policy"
            options={TEST_POLICY_OPTIONS}
            selected={filters.testPolicy || EMPTY_ARRAY}
            onToggle={(value) => toggleArrayFilter("testPolicy", value)}
          />

          <div className="field">
            <label className="field__label" htmlFor="min-grad-rate">
              Min graduation rate: {filters.minGradRate || 0}%
            </label>
            <input
              id="min-grad-rate"
              type="range"
              className="slider"
              min="0"
              max="100"
              step="5"
              value={filters.minGradRate || 0}
              onChange={(e) => onChange({ ...filters, minGradRate: Number(e.target.value) })}
            />
          </div>

          <div className="field">
            <span className="field__label">Special mission</span>
            <div className="filter-bar__checkboxes">
              {FLAG_OPTIONS.map((flag) => (
                <label key={flag.value} className="filter-bar__checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.flags || EMPTY_ARRAY).includes(flag.value)}
                    onChange={() => toggleArrayFilter("flags", flag.value)}
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default FilterBar;
