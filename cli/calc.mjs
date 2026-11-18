#!/usr/bin/env node
// Live USD token cost calculator for Hostlinku (zero dependencies, Node >= 18).
// Fetches live prices from GET https://api.hostlinku.com/api/public/models?limit=100
// (zero hardcoded prices).
//
// Usage:
//   node cli/calc.mjs
//   node cli/calc.mjs --mode economy --input-tokens 10000 --output-tokens 1500
//   node cli/calc.mjs --model claude-haiku-4-5 --cache-read 50000 --requests 100
//   node cli/calc.mjs --export models.json

import fs from "node:fs";

const API_URL = process.env.HOSTLINKU_CATALOG_URL ?? "https://api.hostlinku.com/api/public/models?limit=100";

function parseArgs(argv) {
  const opts = {
    mode: "all",
    model: "",
    vendor: "",
    inputTokens: 10_000,
    outputTokens: 1_000,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    requests: 1,
    json: false,
    exportPath: "",
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--mode" && next) { opts.mode = next.toLowerCase(); i += 1; }
    else if (arg === "--model" && next) { opts.model = next.toLowerCase(); i += 1; }
    else if (arg === "--vendor" && next) { opts.vendor = next.toLowerCase(); i += 1; }
    else if (arg === "--input-tokens" && next) { opts.inputTokens = Math.max(0, Number(next) || 0); i += 1; }
    else if (arg === "--output-tokens" && next) { opts.outputTokens = Math.max(0, Number(next) || 0); i += 1; }
    else if (arg === "--cache-read" && next) { opts.cacheReadTokens = Math.max(0, Number(next) || 0); i += 1; }
    else if (arg === "--cache-write" && next) { opts.cacheWriteTokens = Math.max(0, Number(next) || 0); i += 1; }
    else if (arg === "--requests" && next) { opts.requests = Math.max(1, Number(next) || 1); i += 1; }
    else if (arg === "--export" && next) { opts.exportPath = next; i += 1; }
  }
  return opts;
}

function selectRates(modeData, totalPromptTokens) {
  const base = modeData?.prices;
  if (!base) return null;
  const out = {
    input: base.inputCredits ?? null,
    output: base.outputCredits ?? null,
    cacheRead: base.cacheReadCredits ?? null,
    cacheWrite5m: base.cacheWrite5mCredits ?? null,
  };
  const tiers = [...(modeData.tiers ?? [])].sort((a, b) => (a.minTokens ?? 0) - (b.minTokens ?? 0));
  for (const tier of tiers) {
    if (totalPromptTokens < (tier.minTokens ?? 0)) break;
    if (tier.inputCredits != null) out.input = tier.inputCredits;
    if (tier.outputCredits != null) out.output = tier.outputCredits;
    if (tier.cacheReadCredits != null) out.cacheRead = tier.cacheReadCredits;
    if (tier.cacheWrite5mCredits != null) out.cacheWrite5m = tier.cacheWrite5mCredits;
  }
  return out;
}

function computeCostUsd(rates, opts) {
  if (!rates || rates.input == null || rates.output == null) return null;
  const inCost = (opts.inputTokens / 1e6) * rates.input;
  const outCost = (opts.outputTokens / 1e6) * rates.output;
  const cacheReadCost = rates.cacheRead != null ? (opts.cacheReadTokens / 1e6) * rates.cacheRead : 0;
  const cacheWriteCost = rates.cacheWrite5m != null ? (opts.cacheWriteTokens / 1e6) * rates.cacheWrite5m : 0;
  const perRequest = inCost + outCost + cacheReadCost + cacheWriteCost;
  return {
    perRequest,
    total: perRequest * opts.requests,
  };
}

function fmtUsd(value) {
  if (value == null) return "-";
  if (value === 0) return "$0.00";
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log(`Usage: node cli/calc.mjs [options]
  --mode <all|performance|economy|dedicated>   Service Mode filter (default: all)
  --model <substring>                          Filter model slug
  --vendor <substring>                         Filter vendor name
  --input-tokens <n>                           Uncached input tokens per request (default: 10000)
  --output-tokens <n>                          Output tokens per request (default: 1000)
  --cache-read <n>                             Cached read tokens per request (default: 0)
  --cache-write <n>                            Cache write (5m) tokens per request (default: 0)
  --requests <n>                               Number of requests for total cost (default: 1)
  --export <path>                              Save fetched catalog JSON (e.g. models.json)
  --json                                       Output JSON instead of a table`);
  process.exit(0);
}

const res = await fetch(API_URL, {
  headers: { "User-Agent": "hostlinku-cost-calculator/0.1.0" },
});
if (!res.ok) {
  console.error(`Failed to fetch ${API_URL}: HTTP ${res.status}`);
  process.exit(1);
}
const catalog = await res.json();

if (opts.exportPath) {
  fs.writeFileSync(opts.exportPath, JSON.stringify(catalog, null, 2));
  console.log(`Exported ${catalog.models?.length ?? 0} models to ${opts.exportPath}`);
  process.exit(0);
}

const modesToCheck = opts.mode === "all" ? ["performance", "economy", "dedicated"] : [opts.mode];
const totalPromptTokens = opts.inputTokens + opts.cacheReadTokens + opts.cacheWriteTokens;
const rows = [];

for (const model of catalog.models ?? []) {
  if (opts.model && !model.slug.toLowerCase().includes(opts.model)) continue;
  if (opts.vendor && !String(model.vendor ?? "").toLowerCase().includes(opts.vendor)) continue;
  for (const mode of modesToCheck) {
    const modeData = model.modes?.[mode];
    if (!modeData?.prices) continue;
    const rates = selectRates(modeData, totalPromptTokens);
    const cost = computeCostUsd(rates, opts);
    if (!cost) continue;
    rows.push({
      slug: model.slug,
      vendor: model.vendor,
      mode,
      inputPer1M: rates.input,
      outputPer1M: rates.output,
      cacheReadPer1M: rates.cacheRead,
      perRequestUsd: cost.perRequest,
      totalUsd: cost.total,
    });
  }
}

rows.sort((a, b) => a.totalUsd - b.totalUsd);

if (opts.json) {
  console.log(JSON.stringify({ currency: catalog.currency ?? "USD", options: opts, rows }, null, 2));
  process.exit(0);
}

console.log(
  `Hostlinku Live USD Calculator (${rows.length} rows | in=${opts.inputTokens}, out=${opts.outputTokens}, cache_read=${opts.cacheReadTokens}, requests=${opts.requests})\n`
);
const header = [
  "Model".padEnd(28),
  "Mode".padEnd(12),
  "In / 1M".padStart(10),
  "Out / 1M".padStart(10),
  "Per Req".padStart(12),
  `Total (${opts.requests}x)`.padStart(13),
].join("  ");
console.log(header);
console.log("-".repeat(header.length));
for (const row of rows) {
  console.log(
    [
      row.slug.padEnd(28),
      row.mode.padEnd(12),
      fmtUsd(row.inputPer1M).padStart(10),
      fmtUsd(row.outputPer1M).padStart(10),
      fmtUsd(row.perRequestUsd).padStart(12),
      fmtUsd(row.totalUsd).padStart(13),
    ].join("  ")
  );
}
