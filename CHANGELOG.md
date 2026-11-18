# Changelog

## 0.1.0 - 2026-11-18

- Initial release.
- Interactive single-file HTML/CSS/JS USD cost calculator (`index.html`) supporting Performance, Economy, and Dedicated Service Modes, prompt cache read/write tokens, and tiered context pricing (`minTokens`).
- Zero-dependency Node.js CLI (`cli/calc.mjs`) fetching live pricing from `GET https://api.hostlinku.com/api/public/models?limit=100` with table, JSON, and `--export` modes.
- Zero hardcoded prices: all rates come directly from the public Hostlinku catalog API.
- Multilingual README (`en`, `id`, `ja`, `zh-CN`) and CI validation workflow.
