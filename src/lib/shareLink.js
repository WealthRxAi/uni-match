// Serializes a profile + filters into URL query params (and back) so a
// search can be shared as a link. Pure functions so they're testable in
// node (scripts/test-match.mjs) without a DOM.

function encodeList(arr) {
  if (!arr || arr.length === 0) return "";
  return arr.map((v) => encodeURIComponent(v)).join(",");
}

function decodeList(str) {
  if (!str) return [];
  return str
    .split(",")
    .filter(Boolean)
    .map((v) => decodeURIComponent(v));
}

function toParams(searchParams) {
  if (searchParams instanceof URLSearchParams) return searchParams;
  return new URLSearchParams(searchParams || "");
}

/**
 * @param {{ gpa: number, interests: string[] }|null} profile
 * @param {object|null} filters
 * @returns {URLSearchParams}
 */
export function serializeSearchParams(profile, filters) {
  const params = new URLSearchParams();

  if (profile) {
    if (typeof profile.gpa === "number" && !Number.isNaN(profile.gpa)) {
      params.set("gpa", String(profile.gpa));
    }
    if (profile.interests?.length > 0) {
      params.set("interests", encodeList(profile.interests));
    }
  }

  if (filters) {
    if (filters.region) params.set("region", filters.region);
    if (filters.countries?.length > 0) params.set("countries", encodeList(filters.countries));
    if (typeof filters.maxTuition === "number") params.set("maxTuition", String(filters.maxTuition));
    if (typeof filters.maxTotalCost === "number") {
      params.set("maxTotalCost", String(filters.maxTotalCost));
    }
    if (filters.showReaches === false) params.set("showReaches", "0");
    if (filters.control?.length > 0) params.set("control", encodeList(filters.control));
    if (filters.sizeBucket?.length > 0) params.set("size", encodeList(filters.sizeBucket));
    if (filters.settingType?.length > 0) params.set("setting", encodeList(filters.settingType));
    if (filters.state) params.set("state", filters.state);
    if (filters.testPolicy?.length > 0) params.set("testPolicy", encodeList(filters.testPolicy));
    if (typeof filters.minGradRate === "number" && filters.minGradRate > 0) {
      params.set("minGradRate", String(filters.minGradRate));
    }
    if (filters.flags?.length > 0) params.set("flags", encodeList(filters.flags));
  }

  return params;
}

/**
 * @param {string|URLSearchParams} searchParams
 * @returns {{ profile: {gpa:number, interests:string[]}|null, filters: object|null }}
 *   Only keys present in the URL are populated; callers merge onto their own defaults.
 */
export function parseSearchParams(searchParams) {
  const params = toParams(searchParams);

  const profile = {};
  if (params.has("gpa")) {
    const gpa = Number(params.get("gpa"));
    if (!Number.isNaN(gpa)) profile.gpa = gpa;
  }
  if (params.has("interests")) {
    profile.interests = decodeList(params.get("interests"));
  }

  const filters = {};
  if (params.has("region")) filters.region = params.get("region");
  if (params.has("countries")) filters.countries = decodeList(params.get("countries"));
  if (params.has("maxTuition")) {
    const v = Number(params.get("maxTuition"));
    if (!Number.isNaN(v)) filters.maxTuition = v;
  }
  if (params.has("maxTotalCost")) {
    const v = Number(params.get("maxTotalCost"));
    if (!Number.isNaN(v)) filters.maxTotalCost = v;
  }
  if (params.has("showReaches")) filters.showReaches = params.get("showReaches") !== "0";
  if (params.has("control")) filters.control = decodeList(params.get("control"));
  if (params.has("size")) filters.sizeBucket = decodeList(params.get("size"));
  if (params.has("setting")) filters.settingType = decodeList(params.get("setting"));
  if (params.has("state")) filters.state = params.get("state");
  if (params.has("testPolicy")) filters.testPolicy = decodeList(params.get("testPolicy"));
  if (params.has("minGradRate")) {
    const v = Number(params.get("minGradRate"));
    if (!Number.isNaN(v)) filters.minGradRate = v;
  }
  if (params.has("flags")) filters.flags = decodeList(params.get("flags"));

  return {
    profile: Object.keys(profile).length > 0 && typeof profile.gpa === "number" ? profile : null,
    filters: Object.keys(filters).length > 0 ? filters : null,
  };
}

/**
 * Builds a full shareable URL for the given profile/filters.
 * @param {object} profile
 * @param {object} filters
 * @param {string} [baseUrl] - origin+pathname to use; defaults to window.location.
 */
export function buildShareUrl(profile, filters, baseUrl) {
  const params = serializeSearchParams(profile, filters);
  const qs = params.toString();
  const base =
    baseUrl ??
    (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
  return qs ? `${base}?${qs}` : base;
}

/** Copies a URL to the clipboard, falling back to a hidden textarea + execCommand. */
export async function copyShareUrl(url) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // fall through to the legacy fallback below
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
