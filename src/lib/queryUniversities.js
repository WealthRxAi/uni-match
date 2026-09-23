import { supabase } from "./supabase.js";

const REACH_WINDOW = 0.4;
const CANDIDATE_LIMIT = 1500;
const PROGRAM_ID_LIMIT = 60;

const SELECT_COLUMNS = [
  "id",
  "name",
  "country",
  "city",
  "region",
  "state",
  "min_gpa",
  "acceptance_rate",
  "fields",
  "tuition_intl_usd",
  "living_cost_usd",
  "application_fee_usd",
  "total_annual_usd",
  "ranking",
  "website",
  "source",
  "control",
  "size_bucket",
  "undergrads",
  "setting_type",
  "grad_rate",
  "retention_rate",
  "median_earnings_10yr",
  "median_debt",
  "test_policy",
  "flags",
  "sat_avg",
].join(", ");

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    city: row.city,
    region: row.region,
    state: row.state,
    minGPA: row.min_gpa,
    acceptanceRate: row.acceptance_rate,
    fields: row.fields || [],
    tuitionIntlUSD: row.tuition_intl_usd,
    livingCostUSD: row.living_cost_usd,
    applicationFeeUSD: row.application_fee_usd,
    totalAnnualUSD: row.total_annual_usd,
    ranking: row.ranking,
    website: row.website,
    source: row.source,
    control: row.control,
    sizeBucket: row.size_bucket,
    undergrads: row.undergrads,
    settingType: row.setting_type,
    gradRate: row.grad_rate,
    retentionRate: row.retention_rate,
    medianEarnings10yr: row.median_earnings_10yr,
    medianDebt: row.median_debt,
    testPolicy: row.test_policy,
    flags: row.flags || [],
    satAvg: row.sat_avg,
  };
}

/**
 * Queries candidate universities server-side: a reach window on minGPA plus
 * the region/country/cost/outcome filters, so the client only has to run
 * matchUniversities on a bounded set of rows.
 *
 * @param {{ gpa: number }} profile
 * @param {object} filters
 * @returns {Promise<Array>} rows in the camelCase shape used by match.js
 */
export async function fetchCandidates(profile, filters) {
  let query = supabase
    .from("unimatch_universities")
    .select(SELECT_COLUMNS)
    .lte("min_gpa", profile.gpa + REACH_WINDOW)
    .order("ranking", { ascending: true })
    .limit(CANDIDATE_LIMIT);

  if (filters?.region) {
    query = query.eq("region", filters.region);
  }
  if (filters?.countries?.length > 0) {
    query = query.in("country", filters.countries);
  }
  if (typeof filters?.maxTuition === "number") {
    query = query.lte("tuition_intl_usd", filters.maxTuition);
  }
  if (typeof filters?.maxTotalCost === "number") {
    query = query.lte("total_annual_usd", filters.maxTotalCost);
  }
  if (filters?.control?.length > 0) {
    query = query.in("control", filters.control);
  }
  if (filters?.sizeBucket?.length > 0) {
    query = query.in("size_bucket", filters.sizeBucket);
  }
  if (filters?.settingType?.length > 0) {
    query = query.in("setting_type", filters.settingType);
  }
  if (filters?.state) {
    query = query.eq("state", filters.state);
  }
  if (filters?.testPolicy?.length > 0) {
    query = query.in("test_policy", filters.testPolicy);
  }
  if (typeof filters?.minGradRate === "number" && filters.minGradRate > 0) {
    query = query.gte("grad_rate", filters.minGradRate / 100);
  }
  if (filters?.flags?.length > 0) {
    query = query.contains("flags", filters.flags);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapRow);
}

/**
 * Full rows for a fixed list of university ids, e.g. to hydrate the compare
 * overlay independent of whatever the current search results are.
 */
export async function fetchUniversitiesByIds(ids) {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase.from("unimatch_universities").select(SELECT_COLUMNS).in("id", ids);
  if (error) throw error;

  return (data || []).map(mapRow);
}

/**
 * Distinct list of countries for the FilterBar dropdown. Supabase has no
 * built-in DISTINCT, so we select a bounded page of country values and
 * dedupe client-side.
 */
export async function fetchCountries() {
  const { data, error } = await supabase
    .from("unimatch_universities")
    .select("country")
    .limit(3000);

  if (error) throw error;

  return [...new Set((data || []).map((row) => row.country))].sort();
}

/**
 * Representative bachelor's program per university for a set of field tags,
 * e.g. the student's chosen interests. Call this after matching, for only
 * the currently-displayed page of results (<=60 ids per call).
 *
 * @param {string[]} ids - university ids, capped to PROGRAM_ID_LIMIT
 * @param {string[]} fieldTags - canonical field tags to match against
 * @returns {Promise<Record<string, object>>} university id -> best-earning matching program
 */
export async function fetchProgramsFor(ids, fieldTags) {
  if (!ids?.length || !fieldTags?.length) return {};

  const limitedIds = ids.slice(0, PROGRAM_ID_LIMIT);

  const { data, error } = await supabase
    .from("unimatch_programs")
    .select("university_id, field_tag, cip_title, credential, median_earnings_5yr, median_earnings_1yr, median_debt")
    .in("university_id", limitedIds)
    .in("field_tag", fieldTags);

  if (error) throw error;

  const map = {};
  for (const row of data || []) {
    const existing = map[row.university_id];
    const candidate = {
      fieldTag: row.field_tag,
      cipTitle: row.cip_title,
      credential: row.credential,
      medianEarnings5yr: row.median_earnings_5yr,
      medianEarnings1yr: row.median_earnings_1yr,
      medianDebt: row.median_debt,
    };
    if (!existing || (candidate.medianEarnings5yr || 0) > (existing.medianEarnings5yr || 0)) {
      map[row.university_id] = candidate;
    }
  }
  return map;
}
