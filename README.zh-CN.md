# Hostlinku 实时 USD 费用计算器

[![CI](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/dyocodes/hostlinku-cost-calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | [Bahasa Indonesia](README.id.md) | [日本語](README.ja.md) | **简体中文**

对比 Hostlinku 三种 Service Mode（**Performance**、**Economy** 与 **Dedicated**）下的单次与批量 **USD** token 成本，支持 Prompt Cache（read/write）费率及长上下文阶梯定价（`minTokens`）。

无任何硬编码价格：CLI 工具（`cli/calc.mjs`）和单文件网页版（`index.html`）均直接从实时公开目录接口（`GET https://api.hostlinku.com/api/public/models`）拉取最新费率计算。

## CLI 用法（Node.js ≥ 18，零依赖）

```bash
# 对比所有 Service Mode 下的可用模型
node cli/calc.mjs

# 按模式、模型、缓存 token 和请求数筛选计算
node cli/calc.mjs --mode economy --input-tokens 10000 --output-tokens 1500
node cli/calc.mjs --model claude-haiku --cache-read 50000 --requests 100

# 导出 JSON 或输出结构化结果
node cli/calc.mjs --json
node cli/calc.mjs --export models.json
```

## Web 界面（`index.html`）

由于浏览器对 `file://` 或本地端口的跨域请求有 CORS 限制，在本地使用网页版时，请先用 CLI 导出 `models.json` 再启动静态服务：

```bash
node cli/calc.mjs --export models.json
npx serve .
```

也可以直接在 `index.html` 中选择导出的 `models.json` 文件，或粘贴 `curl -s "https://api.hostlinku.com/api/public/models?limit=100"` 的响应内容。

## Hostlinku USD 计费说明

- 所有模型费率与账户余额均以 **USD** 计价（`currency: "USD"`）。
- 每个模型在其支持的 Service Mode（`performance`、`economy`、`dedicated`）下都有独立定价。
- 带有阶梯定价（`tiers[].minTokens`）的模型，在总提示词 token 数达到 `minTokens` 时会自动切换至对应阶梯费率。
- 实际扣费始终以服务端记录的真实用量为准（API 响应中的 `usage`、`hostlinku.cost` 以及 Console 请求日志）。

## 链接

- 实时价格与目录：<https://hostlinku.com/pricing>
- 账单与余额文档：<https://docs.hostlinku.com/zh/billing>
- Service Mode 文档：<https://docs.hostlinku.com/zh/service-modes>
- Console：<https://console.hostlinku.com>

## 许可证

[MIT](LICENSE)。仅供费用估算参考，实时费率请以 <https://hostlinku.com/models> 为准。
