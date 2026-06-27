# 资产实时看板 📈

实时监控 **A股 · 港股 · 美股** 的主要指数、ETF、个股，以及 **比特币（BTC）** 行情的公开看板。
遵循「**红涨绿跌**」视觉习惯，无需注册，开箱即用，支持一键跳转到实时数据源。

## 监控标的

| 板块 | 标的 |
|------|------|
| 大盘指数 | 上证指数、创业板指、恒生指数、恒生科技指数、道琼斯、纳斯达克、标普500 |
| ETF 基金 | 中证红利ETF(招商)、中证红利低波ETF(华泰柏瑞)、沪深300ETF(华泰柏瑞)、盈富基金 |
| 个股 | 格力电器、药明生物、哔哩哔哩、名创优品、江南布衣、泡泡玛特 |
| 虚拟货币 | 比特币 BTC（24h 实时） |

> 修改监控列表只需编辑 [`config.js`](./config.js)。

## 数据源

- **股票 / 指数 / ETF**：腾讯财经（`qt.gtimg.cn`），公开免费，经服务端代理（避免浏览器跨域 + GBK 编码问题）。
- **比特币**：CoinGecko 公开 API（USD / CNY / 24h 涨跌）。
- 每张卡片右上角「↗」一键跳转到雪球 / CoinGecko 实时页面。

数据仅供参考，非投资建议。

## 本地运行

```bash
cd stock-dashboard
npm start          # 等价于 node server.js
# 打开 http://localhost:3000
```

无需安装依赖（纯 Node 内置模块 + 浏览器原生 JS）。

## 部署到 Vercel

零配置静态站点 + Serverless Functions（`/api/*`）。

```bash
# 方式一：CLI
npx vercel            # 预览
npx vercel --prod     # 生产

# 方式二：GitHub
# 推送到 GitHub 后，在 vercel.com 导入仓库，Framework 选 "Other"，直接 Deploy。
```

部署后即为**公开访问**地址，可在任意终端查看。

## 接入付费数据源（预留）

前端响应结构与数据源无关（`{code,current,prevClose,change,pct,high,low}`），新增付费源只需：

1. 在 [`api/quotes.js`](./api/quotes.js) 的 `fetchQuotes()` 中按 `source` 分支，新增 provider 函数；
2. API Key 通过环境变量读取（`process.env.XXX`），在 Vercel 项目 Settings → Environment Variables 配置；
3. 在 `index.html` 的数据源下拉框中启用对应选项。

可对接：万得 Wind、Alpha Vantage、Polygon、Finnhub 等。

## 目录结构

```
stock-dashboard/
├── index.html      # 页面骨架
├── styles.css      # 样式（红涨绿跌、深色主题）
├── config.js       # 监控标的配置（可编辑）
├── app.js          # 前端逻辑（轮询、渲染、闪动提示）
├── api/
│   ├── quotes.js   # 股票行情代理（Tencent；含付费源扩展点）
│   └── crypto.js   # 比特币行情代理（CoinGecko）
├── server.js       # 本地开发服务器（复用 api/ 处理器）
└── vercel.json     # Vercel 配置
```
