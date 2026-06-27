// Local dev server: serves the static frontend and routes /api/* to the same
// handlers Vercel uses in production. Run with `npm start` (or `node server.js`).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import quotes from './api/quotes.js';
import crypto from './api/crypto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/quotes') return quotes(req, res);
  if (pathname === '/api/crypto') return crypto(req, res);

  // Static files (no traversal outside project root).
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.join(__dirname, rel);
  if (!file.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('forbidden');
  }
  try {
    const data = await readFile(file);
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`资产看板 running at http://localhost:${PORT}`);
});
