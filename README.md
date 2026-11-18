# Hostlinku Live USD Cost Calculator

[![CI](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**English** | [Bahasa Indonesia](README.id.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

Compare per-request and batch token costs in **USD** across Hostlinku Service Modes (**Performance**, **Economy**, and **Dedicated**), including prompt cache read/write rates and tiered long-context thresholds (`minTokens`).

Zero hardcoded prices: both the CLI (`cli/calc.mjs`) and the single-file web UI (`index.html`) compute estimates directly from the live public catalog (`GET https://api.hostlinku.com/api/public/models`).

## CLI usage (Node.js ≥ 18, no dependencies)

```bash
# Compare all active models across all Service Modes
node cli/calc.mjs

# Filter by mode, model, cache tokens, and request count
node cli/calc.mjs --mode economy --input-tokens 10000 --output-tokens 1500
node cli/calc.mjs --model claude-haiku --cache-read 50000 --requests 100

# Export JSON or print machine-readable output
node cli/calc.mjs --json
node cli/calc.mjs --export models.json
```

## Web UI (`index.html`)

Because browsers enforce CORS on cross-origin requests from `file://` or custom local ports, generate `models.json` with the CLI first when running locally:

```bash
node cli/calc.mjs --export models.json
npx serve .
```

You can also load an exported `models.json` file or paste the raw output of `curl -s "https://api.hostlinku.com/api/public/models?limit=100"` directly in `index.html`.

## How Hostlinku USD pricing works

- All model rates and account balances are denominated in **USD** (`currency: "USD"`).
- Each model exposes separate rates per Service Mode (`performance`, `economy`, `dedicated`) when available for that mode.
- Models with tiered context pricing (`tiers[].minTokens`) automatically switch to the higher-context tier rate when total prompt tokens reach `minTokens`.
- Actual billing is always recorded server-side from upstream token usage (`usage` + `hostlinku.cost` in API responses and Console Request Logs).

## Links

- Live Pricing & Catalog: <https://hostlinku.com/pricing>
- Billing & Balance Docs: <https://docs.hostlinku.com/en/billing>
- Service Modes Docs: <https://docs.hostlinku.com/en/service-modes>
- Console: <https://console.hostlinku.com>

## License

[MIT](LICENSE). Provided for estimation only; verify live rates at <https://hostlinku.com/models>.
