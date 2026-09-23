#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "src", "data", "universities.json");

const REQUIRED_KEYS = [
  "id",
  "name",
  "country",
  "city",
  "region",
  "minGPA",
  "acceptanceRate",
  "fields",
  "tuitionIntlUSD",
  "livingCostUSD",
  "applicationFeeUSD",
  "ranking",
  "website",
];

const VALID_REGIONS = ["North America", "Europe", "Asia", "Oceania", "Middle East", "Africa", "South America"];

const VALID_FIELDS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts & Design",
  "Social Sciences",
  "Natural Sciences",
  "Mathematics",
  "Economics",
  "Psychology",
  "Education",
  "Architecture",
];

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function fail(errors, index, record, message) {
  const label = record && record.name ? record.name : `record #${index}`;
  errors.push(`[${label}] ${message}`);
}

function validate(records) {
  const errors = [];

  if (!Array.isArray(records)) {
    return ["Dataset must be a JSON array"];
  }

  const seenIds = new Set();

  records.forEach((record, index) => {
    if (record === null || typeof record !== "object") {
      fail(errors, index, record, "record is not an object");
      return;
    }

    for (const key of REQUIRED_KEYS) {
      if (!(key in record)) {
        fail(errors, index, record, `missing required key "${key}"`);
      }
    }

    if (isNonEmptyString(record.id)) {
      if (seenIds.has(record.id)) {
        fail(errors, index, record, `duplicate id "${record.id}"`);
      }
      seenIds.add(record.id);
    } else {
      fail(errors, index, record, "id must be a non-empty string");
    }

    if (!isNonEmptyString(record.name)) {
      fail(errors, index, record, "name must be a non-empty string");
    }
    if (!isNonEmptyString(record.country)) {
      fail(errors, index, record, "country must be a non-empty string");
    }
    if (!isNonEmptyString(record.city)) {
      fail(errors, index, record, "city must be a non-empty string");
    }

    if (!VALID_REGIONS.includes(record.region)) {
      fail(errors, index, record, `region "${record.region}" is not one of ${VALID_REGIONS.join(", ")}`);
    }

    if (typeof record.minGPA !== "number" || Number.isNaN(record.minGPA) || record.minGPA < 0 || record.minGPA > 4.0) {
      fail(errors, index, record, `minGPA "${record.minGPA}" must be a number between 0 and 4.0`);
    }

    if (
      typeof record.acceptanceRate !== "number" ||
      Number.isNaN(record.acceptanceRate) ||
      record.acceptanceRate < 0 ||
      record.acceptanceRate > 1
    ) {
      fail(errors, index, record, `acceptanceRate "${record.acceptanceRate}" must be a number between 0 and 1`);
    }

    if (!Array.isArray(record.fields) || record.fields.length < 3 || record.fields.length > 6) {
      fail(errors, index, record, `fields must be an array of 3-6 tags (got ${JSON.stringify(record.fields)})`);
    } else {
      const invalidTags = record.fields.filter((f) => !VALID_FIELDS.includes(f));
      if (invalidTags.length > 0) {
        fail(errors, index, record, `invalid field tag(s): ${invalidTags.join(", ")}`);
      }
      const uniqueTags = new Set(record.fields);
      if (uniqueTags.size !== record.fields.length) {
        fail(errors, index, record, "fields contains duplicate tags");
      }
    }

    if (typeof record.tuitionIntlUSD !== "number" || record.tuitionIntlUSD < 0) {
      fail(errors, index, record, `tuitionIntlUSD "${record.tuitionIntlUSD}" must be a non-negative number`);
    }
    if (typeof record.livingCostUSD !== "number" || record.livingCostUSD < 0) {
      fail(errors, index, record, `livingCostUSD "${record.livingCostUSD}" must be a non-negative number`);
    }
    if (typeof record.applicationFeeUSD !== "number" || record.applicationFeeUSD < 0) {
      fail(errors, index, record, `applicationFeeUSD "${record.applicationFeeUSD}" must be a non-negative number`);
    }

    if (!Number.isInteger(record.ranking) || record.ranking < 1) {
      fail(errors, index, record, `ranking "${record.ranking}" must be a positive integer`);
    }

    if (!isNonEmptyString(record.website) || !/^https?:\/\//.test(record.website)) {
      fail(errors, index, record, `website "${record.website}" must be a valid http(s) URL`);
    }
  });

  return errors;
}

const raw = fs.readFileSync(dataPath, "utf-8");
const records = JSON.parse(raw);
const errors = validate(records);

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s):\n`);
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(`Validation passed: ${records.length} universities OK.`);
