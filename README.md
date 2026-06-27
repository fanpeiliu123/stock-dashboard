# 资产实时看板 📈

实时监控 **A股 · 港股 · 美股** 的主要指数、ETF、个股，以及 **比特币（BTC）** 行情的公开看板。
遵循「**红涨绿跌**」视觉习惯，无需注册，开箱即用，支持一键跳转到实时数据源。

🔗 **在线地址（公开访问）：** https://zichan-board.vercel.app

## 看板特性

- **市场总览栏**：顶部一眼看涨/跌/平家数、领涨领跌标的、BTC 实时价。
- **红绿色条卡片**：每张卡片左侧色条 + 醒目涨跌幅药丸，满屏红绿一目了然。
- **排序**：可按「涨幅优先 / 跌幅优先 / 默认顺序」排列，最大波动浮到最前。
- **自动刷新**：行情 12s、BTC 30s 自动更新；切到后台自动暂停省流量。

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
# 一键部署 + 自动把好记域名指向最新版本
npm run deploy        # = bash deploy.sh

# 或手动
vercel --prod --yes --scope chris-projects-9c281e2b
```

> 已绑定好记域名 **zichan-board.vercel.app**，且已关闭 Vercel 部署保护，
> 任意终端可**公开访问**，无需登录。`npm run deploy` 会在每次发布后自动把该域名指向最新部署。

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
