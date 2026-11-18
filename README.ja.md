# Hostlinku ライブ USD コスト計算ツール

[![CI](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | [Bahasa Indonesia](README.id.md) | **日本語** | [简体中文](README.zh-CN.md)

Hostlinku の 3 つの Service Mode（**Performance**、**Economy**、**Dedicated**）における 1 リクエストあたり・合計の **USD** トークンコストを比較できます。プロンプトキャッシュ（read/write）料金や長文コンテキストの階層料金（`minTokens`）にも対応しています。

価格のハードコードは一切ありません。CLI（`cli/calc.mjs`）と単一 HTML Web UI（`index.html`）のどちらも、公開カタログ API（`GET https://api.hostlinku.com/api/public/models`）の最新データから直接計算します。

## CLI の使い方（Node.js ≥ 18、依存なし）

```bash
# 全モードのアクティブなモデルを比較
node cli/calc.mjs

# モード、モデル、キャッシュトークン数、リクエスト数で絞り込み
node cli/calc.mjs --mode economy --input-tokens 10000 --output-tokens 1500
node cli/calc.mjs --model claude-haiku --cache-read 50000 --requests 100

# JSON 出力やローカル JSON ファイルへのエクスポート
node cli/calc.mjs --json
node cli/calc.mjs --export models.json
```

## Web UI (`index.html`)

ブラウザは `file://` やローカルポートからのクロスオリジンリクエストに対して CORS を制限するため、ローカルで確認する場合は先に `models.json` を生成して配信してください。

```bash
node cli/calc.mjs --export models.json
npx serve .
```

または `index.html` 上で `models.json` ファイルを選択するか、`curl -s "https://api.hostlinku.com/api/public/models?limit=100"` の JSON を貼り付けても利用できます。

## Hostlinku の USD 課金仕様

- モデル料金とアカウント残高はすべて **USD** 建てです（`currency: "USD"`）。
- 各モデルは対応している Service Mode（`performance`、`economy`、`dedicated`）ごとに異なる単価を持ちます。
- コンテキスト階層料金（`tiers[].minTokens`）があるモデルは、合計プロンプトトークン数が `minTokens` 以上になると自動的に該当ティアの単価へ切り替わります。
- 実際の課金はサーバー側で記録される実トークン数（API レスポンスの `usage` と `hostlinku.cost`、および Console のログ）に基づきます。

## リンク

- ライブ料金・モデル一覧: <https://hostlinku.com/pricing>
- 請求・残高ドキュメント: <https://docs.hostlinku.com/ja/billing>
- Service Mode ドキュメント: <https://docs.hostlinku.com/ja/service-modes>
- Console: <https://console.hostlinku.com>

## ライセンス

[MIT](LICENSE)。見積もり用のツールです。最新単価は <https://hostlinku.com/models> でご確認ください。
