# Kalkulator Biaya USD Live Hostlinku

[![CI](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | **Bahasa Indonesia** | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

Bandingkan estimasi biaya token dalam **USD** per request maupun per batch di ketiga Service Mode Hostlinku (**Performance**, **Economy**, dan **Dedicated**), termasuk tarif *prompt cache* (read/write) serta batas tier konteks panjang (`minTokens`).

Tanpa harga yang di-hardcode: baik CLI (`cli/calc.mjs`) maupun antarmuka web statis (`index.html`) menghitung biaya langsung dari katalog publik live (`GET https://api.hostlinku.com/api/public/models`).

## Penggunaan CLI (Node.js ≥ 18, tanpa dependensi)

```bash
# Bandingkan seluruh model aktif di semua Service Mode
node cli/calc.mjs

# Filter berdasarkan mode, model, token cache, dan jumlah request
node cli/calc.mjs --mode economy --input-tokens 10000 --output-tokens 1500
node cli/calc.mjs --model claude-haiku --cache-read 50000 --requests 100

# Ekspor JSON atau keluaran terstruktur
node cli/calc.mjs --json
node cli/calc.mjs --export models.json
```

## Antarmuka Web (`index.html`)

Karena browser menerapkan aturan CORS saat membuka `file://` atau port lokal biasa, buat `models.json` lebih dulu lewat CLI sebelum menjalankan server statis lokal:

```bash
node cli/calc.mjs --export models.json
npx serve .
```

Anda juga bisa memilih file `models.json` atau menempelkan langsung JSON hasil `curl -s "https://api.hostlinku.com/api/public/models?limit=100"` di halaman `index.html`.

## Cara kerja harga USD Hostlinku

- Seluruh harga model dan saldo akun menggunakan denominasi **USD** (`currency: "USD"`).
- Setiap model memiliki tarif terpisah untuk tiap Service Mode (`performance`, `economy`, `dedicated`) jika tersedia pada mode tersebut.
- Model dengan harga bertingkat (`tiers[].minTokens`) otomatis berpindah ke tarif tier yang sesuai ketika total token prompt mencapai `minTokens`.
- Penagihan aktual selalu dihitung di server dari pemakaian token nyata (`usage` + `hostlinku.cost` pada respons API dan Log Permintaan di Console).

## Tautan

- Katalog & Harga Live: <https://hostlinku.com/pricing>
- Dokumentasi Billing: <https://docs.hostlinku.com/billing>
- Dokumentasi Service Mode: <https://docs.hostlinku.com/service-modes>
- Console: <https://console.hostlinku.com>

## Lisensi

[MIT](LICENSE). Disediakan sebagai alat estimasi; cek harga live resmi di <https://hostlinku.com/models>.
