import { supabase } from "./supabase.js";

const REACH_WINDOW = 0.4;
const CANDIDATE_LIMIT = 1500;

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
  };
}

/**
 * Queries candidate universities server-side: a reach window on minGPA plus
 * the region/country/cost filters, so the client only has to run
 * matchUniversities on a bounded set of rows.
 *
 * @param {{ gpa: number }} profile
 * @param {object} filters
 * @returns {Promise<Array>} rows in the camelCase shape used by match.js
 */
export async function fetchCandidates(profile, filters) {
  let query = supabase
    .from("unimatch_universities")
    .select(
      "id, name, country, city, region, state, min_gpa, acceptance_rate, fields, tuition_intl_usd, living_cost_usd, application_fee_usd, total_annual_usd, ranking, website, source"
    )
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

  const { data, error } = await query;
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
