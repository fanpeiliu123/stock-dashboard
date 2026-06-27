// Watchlist configuration. Edit this file to add / remove / reorder assets.
//   name   : display label (Chinese)
//   code   : Tencent quote code (sh/sz = A-share, hk = HK, us = US)
//   market : 'A' | 'HK' | 'US'  (drives the colored market chip)
//   link   : one-click jump to a live source page (Xueqiu)
//   dp     : decimal places for the price (optional, auto if omitted)
window.WATCHLIST = {
  // (a) 大盘指数
  index: {
    title: '大盘指数',
    items: [
      { name: '上证指数',     code: 'sh000001', market: 'A',  link: 'https://xueqiu.com/S/SH000001' },
      { name: '创业板指',     code: 'sz399006', market: 'A',  link: 'https://xueqiu.com/S/SZ399006' },
      { name: '恒生指数',     code: 'hkHSI',    market: 'HK', link: 'https://xueqiu.com/S/HKHSI' },
      { name: '恒生科技指数', code: 'hkHSTECH', market: 'HK', link: 'https://xueqiu.com/S/HKHSTECH' },
      { name: '道琼斯指数',   code: 'usDJI',    market: 'US', link: 'https://xueqiu.com/S/.DJI' },
      { name: '纳斯达克指数', code: 'usIXIC',   market: 'US', link: 'https://xueqiu.com/S/.IXIC' },
      { name: '标普500指数',  code: 'usINX',    market: 'US', link: 'https://xueqiu.com/S/.INX' },
    ],
  },
  // (b) ETF 基金（均取规模最大者为参考）
  etf: {
    title: 'ETF 基金',
    items: [
      { name: '中证红利ETF',     code: 'sh515080', market: 'A',  dp: 3, link: 'https://xueqiu.com/S/SH515080', note: '招商' },
      { name: '中证红利低波ETF', code: 'sh512890', market: 'A',  dp: 3, link: 'https://xueqiu.com/S/SH512890', note: '华泰柏瑞' },
      { name: '沪深300ETF',      code: 'sh510300', market: 'A',  dp: 3, link: 'https://xueqiu.com/S/SH510300', note: '华泰柏瑞' },
      { name: '盈富基金',        code: 'hk02800',  market: 'HK', dp: 3, link: 'https://xueqiu.com/S/HK02800' },
    ],
  },
  // (c) 个股
  stock: {
    title: '个股',
    items: [
      { name: '格力电器', code: 'sz000651', market: 'A',  link: 'https://xueqiu.com/S/SZ000651' },
      { name: '药明生物', code: 'hk02269',  market: 'HK', link: 'https://xueqiu.com/S/HK02269' },
      { name: '哔哩哔哩', code: 'usBILI',   market: 'US', link: 'https://xueqiu.com/S/BILI' },
      { name: '名创优品', code: 'usMNSO',   market: 'US', link: 'https://xueqiu.com/S/MNSO' },
      { name: '江南布衣', code: 'hk03306',  market: 'HK', link: 'https://xueqiu.com/S/HK03306' },
      { name: '泡泡玛特', code: 'hk09992',  market: 'HK', link: 'https://xueqiu.com/S/HK09992' },
    ],
  },
};

// 虚拟货币（独立板块，数据走 /api/crypto）
window.CRYPTO = {
  title: '虚拟货币',
  name: '比特币',
  symbol: 'BTC',
  link: 'https://www.coingecko.com/zh/coins/bitcoin',
};

// 刷新间隔（毫秒）
window.REFRESH = { stocks: 12000, crypto: 30000 };
