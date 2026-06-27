// Serverless proxy for Bitcoin (BTC) — free CoinGecko Simple Price API.
// Returns USD + CNY price and 24h change/volume (24h rolling, always live).

export async function fetchCrypto() {
  const url =
    'https://api.coingecko.com/api/v3/simple/price' +
    '?ids=bitcoin&vs_currencies=usd,cny' +
    '&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true';

  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } });
  if (!resp.ok) throw new Error(`upstream ${resp.status}`);
  const j = await resp.json();
  const b = j.bitcoin || {};
  return {
    usd: b.usd ?? null,
    cny: b.cny ?? null,
    change24h: b.usd_24h_change ?? null,
    vol24h: b.usd_24h_vol ?? null,
    updated: b.last_updated_at ?? null,
  };
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  try {
    const data = await fetchCrypto();
    sendJson(res, 200, { ok: true, ts: Date.now(), data });
  } catch (err) {
    sendJson(res, 502, { ok: false, error: String((err && err.message) || err) });
  }
}
