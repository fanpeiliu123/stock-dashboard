#!/usr/bin/env bash
# 一键部署：发布到 Vercel 生产环境，并把好记域名指向最新部署。
# 用法：npm run deploy   （或  bash deploy.sh）
set -euo pipefail

SCOPE="chris-projects-9c281e2b"
ALIAS="zichan-board.vercel.app"

echo "▲ 正在部署到生产环境…"
URL=$(vercel --prod --yes --scope "$SCOPE" \
  | grep -oE 'https://stock-dashboard-[a-z0-9]+-'"$SCOPE"'\.vercel\.app' | head -1)

if [ -z "${URL:-}" ]; then
  echo "✗ 未能解析部署 URL，请检查 vercel 输出。" >&2
  exit 1
fi
echo "✓ 已部署：$URL"

vercel alias set "$URL" "$ALIAS" --scope "$SCOPE" >/dev/null
echo "✓ 域名已更新：https://$ALIAS"
