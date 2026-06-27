// Serverless proxy for real-time stock/index/ETF quotes.
// Free source: Tencent (qt.gtimg.cn). We proxy server-side to avoid browser
// CORS, and we parse ONLY numeric fields (GBK-encoded names are ignored — the
// frontend supplies its own Chinese labels), so no charset decoding is needed.
//
// Adding a paid source (Wind / Alpha Vantage / Polygon / Finnhub):
//   add a provider function below and branch on `source`, reading the key from
//   process.env. The response shape ({code,current,prevClose,change,pct,...})
//   is provider-agnostic, so the frontend needs no changes.

// Only allow well-formed market codes -> prevents the proxy being abused as an
// open SSRF relay.
const ALLOWED = /^(sh|sz|hk|us)[A-Za-z0-9.]{1,12}$/;

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

function parseTencent(text) {
  const out = [];
  const re = /v_([A-Za-z0-9.$]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    const p = m[2].split('~');
    if (p.length < 6) continue;

    const current = num(p[3]);
    const prevClose = num(p[4]);
    const open = num(p[5]);

    // Field layout differs by market (A-share / HK / US) because of empty
    // padding columns, but the trade-time field is unambiguous. Anchor on it,
    // then read change / pct / high / low at fixed offsets after it.
    let di = -1;
    for (let i = 6; i < p.length; i++) {
      if (/^20\d{12}$/.test(p[i]) || /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(p[i])) {
        di = i;
        break;
      }
    }

    let change = null, pct = null, high = null, low = null, time = null;
    if (di >= 0) {
      time = p[di];
      change = num(p[di + 1]);
      pct = num(p[di + 2]);
      high = num(p[di + 3]);
      low = num(p[di + 4]);
    }
    // Fallback if the anchor wasn't found.
    if (change === null && current !== null && prevClose !== null) {
      change = +(current - prevClose).toFixed(4);
      pct = prevClose ? +((change / prevClose) * 100).toFixed(2) : 0;
    }

    out.push({ code, current, prevClose, open, change, pct, high, low, time });
  }
  return out;
}

export async function fetchQuotes(codes, source = 'tencent') {
  const valid = [...new Set(codes.filter((c) => ALLOWED.test(c)))];
  if (!valid.length) return [];

  // Extension point: switch on `source` to add paid providers.
  if (source !== 'tencent') {
    throw new Error(`unsupported source: ${source}`);
  }

  const url = 'https://qt.gtimg.cn/q=' + valid.join(',');
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://gu.qq.com/',
    },
  });
  if (!resp.ok) throw new Error(`upstream ${resp.status}`);
  const text = await resp.text();
  return parseTencent(text);
}

// --- HTTP handler (works on both Vercel and the local server.js) ---
function getQuery(req, key) {
  const u = new URL(req.url, 'http://localhost');
  return u.searchParams.get(key);
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  const codes = (getQuery(req, 'codes') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const source = getQuery(req, 'source') || 'tencent';
  try {
    const data = await fetchQuotes(codes, source);
    sendJson(res, 200, { ok: true, source, ts: Date.now(), data });
  } catch (err) {
    sendJson(res, 502, { ok: false, error: String(err && err.message || err) });
  }
}
