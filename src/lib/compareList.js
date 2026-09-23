// Shortlist of universities to compare, persisted in localStorage.
const STORAGE_KEY = "unimatch:compare";
export const MAX_COMPARE = 4;

export function loadCompareIds() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveCompareIds(ids) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

/** Toggles an id in the list, capped at MAX_COMPARE (silently ignores adds past the cap). */
export function toggleCompareId(ids, id) {
  if (ids.includes(id)) return ids.filter((existing) => existing !== id);
  if (ids.length >= MAX_COMPARE) return ids;
  return [...ids, id];
}
