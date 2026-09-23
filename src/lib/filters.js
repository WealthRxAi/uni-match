import { LABELS } from "./match.js";

/**
 * Apply region/country/cost/reach filters to matched results.
 * A contradictory combination (e.g. max total cost below every
 * remaining university's cost) simply yields an empty array.
 */
export function filterResults(results, filters) {
  return results.filter((r) => {
    const u = r.university;
    const totalAnnual = u.tuitionIntlUSD + u.livingCostUSD;

    if (filters.region && u.region !== filters.region) return false;
    if (filters.countries.length > 0 && !filters.countries.includes(u.country)) return false;
    if (u.tuitionIntlUSD > filters.maxTuition) return false;
    if (totalAnnual > filters.maxTotalCost) return false;
    if (!filters.showReaches && r.label === LABELS.REACH) return false;

    if (filters.control?.length > 0 && !filters.control.includes(u.control)) return false;
    if (filters.sizeBucket?.length > 0 && !filters.sizeBucket.includes(u.sizeBucket)) return false;
    if (filters.settingType?.length > 0 && !filters.settingType.includes(u.settingType)) return false;
    if (filters.state && u.state !== filters.state) return false;
    if (filters.testPolicy?.length > 0 && !filters.testPolicy.includes(u.testPolicy)) return false;
    if (filters.minGradRate > 0) {
      if (typeof u.gradRate !== "number" || u.gradRate * 100 < filters.minGradRate) return false;
    }
    if (filters.flags?.length > 0) {
      const uFlags = u.flags || [];
      if (!filters.flags.every((f) => uFlags.includes(f))) return false;
    }

    return true;
  });
}

export function sortResults(results, sortBy) {
  if (sortBy === "match") return results;

  const sorted = [...results];
  if (sortBy === "cost") {
    sorted.sort((a, b) => {
      const totalA = a.university.tuitionIntlUSD + a.university.livingCostUSD;
      const totalB = b.university.tuitionIntlUSD + b.university.livingCostUSD;
      return totalA - totalB;
    });
  } else if (sortBy === "ranking") {
    sorted.sort((a, b) => a.university.ranking - b.university.ranking);
  }
  return sorted;
}
