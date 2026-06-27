'use strict';

const $ = (s) => document.querySelector(s);
const board = $('#board');
const statusEl = $('#status');
const updatedEl = $('#updated');

// Flatten the watchlist for rendering + a code->meta lookup.
const SECTIONS = Object.entries(window.WATCHLIST); // [key, {title, items}]
const ALL_CODES = SECTIONS.flatMap(([, g]) => g.items.map((i) => i.code));
const META = {}; // code -> config item
SECTIONS.forEach(([, g]) => g.items.forEach((i) => (META[i.code] = i)));

const cardEls = {};   // code -> element
const gridEls = {};   // section key -> grid element
const lastPct = {};   // code -> previous pct (for flash)
const latest = {};    // code -> latest quote (for overview + sorting)

let stockTimer = null;
let cryptoTimer = null;

// ---------- helpers ----------
function fmt(v, dp) {
  if (v == null || !Number.isFinite(v)) return '—';
  if (dp == null) dp = Math.abs(v) < 10 ? 3 : 2;
  return v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function fmtBig(v) {
  if (v == null) return '—';
  if (v >= 1e12) return (v / 1e12).toFixed(2) + ' 万亿';
  if (v >= 1e8) return (v / 1e8).toFixed(2) + ' 亿';
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
const dir = (n) => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat');
const sign = (n) => (n > 0 ? '+' : '');
const arrow = (n) => (n > 0 ? '▲' : n < 0 ? '▼' : '—');

// ---------- build skeleton ----------
function buildBoard() {
  const frag = document.createDocumentFragment();
  for (const [key, group] of SECTIONS) {
    frag.appendChild(buildSection(key, group.title, group.items.map(stockCard)));
  }
  frag.appendChild(buildSection('crypto', window.CRYPTO.title, [cryptoCard()]));
  board.innerHTML = '';
  board.appendChild(frag);
}

function buildSection(key, title, cards) {
  const sec = document.createElement('section');
  sec.className = 'section';
  const head = document.createElement('div');
  head.className = 'section-head';
  head.innerHTML = `<h2>${title}</h2><span class="count">${cards.length} 项</span>`;
  const grid = document.createElement('div');
  grid.className = 'grid';
  cards.forEach((c) => grid.appendChild(c));
  gridEls[key] = grid;
  sec.append(head, grid);
  return sec;
}

function stockCard(item) {
  const el = document.createElement('div');
  el.className = 'card stale';
  el.dataset.dir = 'flat';
  el.dataset.code = item.code;
  el.innerHTML = `
    <a class="jump" href="${item.link}" target="_blank" rel="noopener" title="跳转到实时数据源">↗</a>
    <div class="row1">
      <div class="name"><span class="label">${item.name}</span>${item.note ? `<span class="note">${item.note}</span>` : ''}</div>
      <span class="chip ${item.market}">${item.market}</span>
    </div>
    <div class="row2">
      <div class="price">—</div>
      <div class="pill">—</div>
    </div>
    <div class="chg">—</div>
    <div class="meta">
      <span>今开 <b class="open">—</b></span><span>昨收 <b class="prev">—</b></span>
      <span>最高 <b class="high">—</b></span><span>最低 <b class="low">—</b></span>
    </div>
    <div class="time">—</div>`;
  el._dp = item.dp;
  cardEls[item.code] = el;
  return el;
}

function cryptoCard() {
  const c = window.CRYPTO;
  const el = document.createElement('div');
  el.className = 'card btc stale';
  el.dataset.dir = 'flat';
  el.innerHTML = `
    <a class="jump" href="${c.link}" target="_blank" rel="noopener" title="跳转到 CoinGecko">↗</a>
    <div class="row1">
      <div class="name"><span class="label">${c.name}</span><span class="note">${c.symbol}</span></div>
      <span class="chip BTC">24H</span>
    </div>
    <div class="row2">
      <div class="price">—</div>
      <div class="pill">—</div>
    </div>
    <div class="chg">24h 涨跌</div>
    <div class="meta">
      <span>人民币 <b class="cny">—</b></span><span>24h量 <b class="vol">—</b></span>
    </div>
    <div class="time">—</div>`;
  cardEls['__btc__'] = el;
  return el;
}

// ---------- render ----------
function paintCard(el, { price, pct, chg, dp, priceText }) {
  const d = dir(pct);
  el.dataset.dir = d;
  el.querySelector('.price').textContent = priceText != null ? priceText : fmt(price, dp);
  el.querySelector('.pill').textContent = `${arrow(pct)} ${sign(pct)}${fmt(pct, 2)}%`;
  const chgEl = el.querySelector('.chg');
  if (chg != null) chgEl.textContent = `${sign(chg)}${fmt(chg, dp)}`;
  el.classList.remove('stale');
}

function flash(el, code, pct) {
  const prev = lastPct[code];
  if (prev != null && pct !== prev) {
    const cls = pct > prev ? 'flash-up' : 'flash-down';
    el.classList.remove('flash-up', 'flash-down');
    void el.offsetWidth;
    el.classList.add(cls);
  }
  lastPct[code] = pct;
}

async function loadStocks() {
  try {
    const res = await fetch(`/api/quotes?codes=${ALL_CODES.join(',')}&source=${$('#source').value}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'unknown');

    const byCode = {};
    json.data.forEach((q) => (byCode[q.code] = q));

    let painted = 0;
    for (const code of ALL_CODES) {
      const q = byCode[code];
      const el = cardEls[code];
      if (!q || !el || q.current == null) continue;
      latest[code] = q;
      paintCard(el, { price: q.current, pct: q.pct ?? 0, chg: q.change, dp: el._dp });
      el.querySelector('.open').textContent = fmt(q.open, el._dp);
      el.querySelector('.prev').textContent = fmt(q.prevClose, el._dp);
      el.querySelector('.high').textContent = fmt(q.high, el._dp);
      el.querySelector('.low').textContent = fmt(q.low, el._dp);
      el.querySelector('.time').textContent = q.time ? `成交 ${q.time}` : '';
      flash(el, code, q.pct ?? 0);
      painted++;
    }
    applySort();
    updateOverview();
    setStatus(true, `行情已更新 · ${painted}/${ALL_CODES.length} 标的`);
  } catch (err) {
    setStatus(false, `行情获取失败：${err.message}`);
  }
}

async function loadCrypto() {
  const el = cardEls['__btc__'];
  try {
    const res = await fetch('/api/crypto');
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'unknown');
    const d = json.data;
    paintCard(el, { pct: d.change24h ?? 0, chg: null, priceText: '$' + fmt(d.usd, 0) });
    el.querySelector('.cny').textContent = '¥' + fmtBig(d.cny);
    el.querySelector('.vol').textContent = '$' + fmtBig(d.vol24h);
    if (d.updated) {
      el.querySelector('.time').textContent = '更新 ' + new Date(d.updated * 1000).toLocaleString('zh-CN');
    }
    flash(el, '__btc__', d.change24h ?? 0);
    latest.__btc__ = { usd: d.usd, pct: d.change24h ?? 0 };
    updateOverview();
  } catch (err) {
    el.querySelector('.time').textContent = 'BTC 获取失败';
  }
}

// ---------- overview ----------
function updateOverview() {
  let up = 0, down = 0, flatN = 0;
  let topG = null, topL = null;
  for (const code of ALL_CODES) {
    const q = latest[code];
    if (!q || q.pct == null) continue;
    if (q.pct > 0) up++; else if (q.pct < 0) down++; else flatN++;
    if (!topG || q.pct > topG.pct) topG = { code, pct: q.pct };
    if (!topL || q.pct < topL.pct) topL = { code, pct: q.pct };
  }
  $('#ovUp').textContent = up;
  $('#ovDown').textContent = down;
  $('#ovFlat').textContent = flatN;

  const moverHTML = (m) =>
    m ? `<b class="${dir(m.pct)}">${META[m.code].name} ${sign(m.pct)}${fmt(m.pct, 2)}%</b>` : '–';
  $('#ovTopGain').querySelector('.ov-body').innerHTML = moverHTML(topG);
  $('#ovTopLoss').querySelector('.ov-body').innerHTML = moverHTML(topL);

  const btc = latest.__btc__;
  $('#ovBtc').querySelector('.ov-body').innerHTML = btc
    ? `<b>$${fmt(btc.usd, 0)}</b> <span class="${dir(btc.pct)}">${sign(btc.pct)}${fmt(btc.pct, 2)}%</span>`
    : '–';
}

// ---------- sorting ----------
function applySort() {
  const mode = $('#sort').value;
  if (mode === 'default') {
    for (const [key, group] of SECTIONS) {
      const grid = gridEls[key];
      group.items.forEach((it) => grid.appendChild(cardEls[it.code]));
    }
    return;
  }
  const factor = mode === 'changeDesc' ? -1 : 1;
  for (const [key, group] of SECTIONS) {
    const grid = gridEls[key];
    const sorted = [...group.items].sort((a, b) => {
      const pa = latest[a.code]?.pct ?? 0;
      const pb = latest[b.code]?.pct ?? 0;
      return (pa - pb) * factor;
    });
    sorted.forEach((it) => grid.appendChild(cardEls[it.code]));
  }
}

// ---------- status / timers ----------
function setStatus(ok, msg) {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + (ok ? 'ok' : 'err');
  updatedEl.textContent = '最后刷新 ' + new Date().toLocaleTimeString('zh-CN');
}
function refreshAll() { loadStocks(); loadCrypto(); }
function startTimers() {
  stopTimers();
  stockTimer = setInterval(loadStocks, window.REFRESH.stocks);
  cryptoTimer = setInterval(loadCrypto, window.REFRESH.crypto);
}
function stopTimers() { clearInterval(stockTimer); clearInterval(cryptoTimer); }

// ---------- wire up ----------
$('#refreshBtn').addEventListener('click', refreshAll);
$('#source').addEventListener('change', loadStocks);
$('#sort').addEventListener('change', applySort);
$('#autoToggle').addEventListener('change', (e) => (e.target.checked ? startTimers() : stopTimers()));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTimers();
  else if ($('#autoToggle').checked) { refreshAll(); startTimers(); }
});

buildBoard();
refreshAll();
startTimers();
