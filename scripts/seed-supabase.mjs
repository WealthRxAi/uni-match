#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://toufekynlxvepmfuilav.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_SERVICE_KEY. Set it to the Supabase project's service-role key before seeding, e.g.:\n" +
      "  SUPABASE_SERVICE_KEY=... npm run seed"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BATCH_SIZE = 500;

function toRow(u, source) {
  return {
    id: u.id,
    name: u.name,
    country: u.country,
    city: u.city,
    region: u.region,
    state: u.state ?? null,
    min_gpa: u.minGPA,
    acceptance_rate: u.acceptanceRate,
    fields: u.fields,
    tuition_intl_usd: u.tuitionIntlUSD,
    living_cost_usd: u.livingCostUSD,
    application_fee_usd: u.applicationFeeUSD,
    // total_annual_usd is a generated column — never write it.
    ranking: u.ranking,
    website: u.website,
    source,
  };
}

function loadJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function upsertInBatches(rows, label) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("unimatch_universities")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`Failed upserting ${label} batch ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`Upserted ${label} ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

async function main() {
  const curated = loadJson("universities.json");
  if (!curated) {
    console.error("src/data/universities.json not found — nothing to seed.");
    process.exit(1);
  }
  await upsertInBatches(
    curated.map((u) => toRow(u, "curated")),
    "curated"
  );

  const scorecard = loadJson("us-universities.json");
  if (scorecard) {
    await upsertInBatches(
      scorecard.map((u) => toRow(u, "scorecard")),
      "scorecard"
    );
  } else {
    console.log("src/data/us-universities.json not present — skipping Scorecard import.");
  }

  console.log("Seed complete.");
}

main();
