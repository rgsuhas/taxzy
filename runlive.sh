#!/usr/bin/env bash
# runlive.sh — starts backend + frontend + one ngrok tunnel (frontend only).
# API calls are proxied server-side by Next.js to localhost:8000, so one tunnel is enough.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[runlive]${NC} $1"; }
info() { echo -e "${BLUE}[runlive]${NC} $1"; }
warn() { echo -e "${YELLOW}[runlive]${NC} $1"; }
err()  { echo -e "${RED}[runlive]${NC} $1"; }

NGROK_PID_FILE="$ROOT/.ngrok.pid"
NGROK_CFG="$HOME/.config/ngrok/ngrok.yml"
NGROK_CFG_BAK="$HOME/.config/ngrok/ngrok.yml.runlive.bak"

cleanup() {
  echo ""
  log "Shutting down ngrok..."
  [ -f "$NGROK_PID_FILE" ] && kill "$(cat "$NGROK_PID_FILE")" 2>/dev/null || true
  rm -f "$NGROK_PID_FILE"
  [ -f "$NGROK_CFG_BAK" ] && mv "$NGROK_CFG_BAK" "$NGROK_CFG" && log "Restored ngrok config." || true
  log "ngrok stopped. Backend + frontend still running — use ./killall.sh to stop them."
}
trap cleanup EXIT INT TERM

# ── 1. Kill stale processes ────────────────────────────────────────────────────
pkill -f "ngrok" 2>/dev/null || true
for port in 8000 3000 3001 3002 3003; do
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  [ -n "$pids" ] && echo "$pids" | xargs kill 2>/dev/null && sleep 0.3 || true
done
sleep 1

# ── 2. Start PostgreSQL if needed ─────────────────────────────────────────────
PG_VERSION=17; PG_CLUSTER=main
if pg_lsclusters -h 2>/dev/null | awk '{print $1,$2,$4}' | grep -q "^$PG_VERSION $PG_CLUSTER online"; then
  log "PostgreSQL already running."
else
  log "Starting PostgreSQL..."
  sudo pg_ctlcluster $PG_VERSION $PG_CLUSTER start
fi

# ── 3. Start backend ──────────────────────────────────────────────────────────
log "Starting backend..."
cd "$BACKEND"
if [ -d ".venv" ]; then VENV=".venv"; elif [ -d "venv" ]; then VENV="venv"; else
  python3 -m venv venv; VENV="venv"
fi
source "$VENV/bin/activate"
pip install -q -r requirements.txt
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "$ROOT/backend.log" 2>&1 &
echo $! > "$ROOT/.backend.pid"
deactivate

# ── 4. Write frontend .env.local — API calls go through Next.js proxy ─────────
# With rewrites in next.config.ts, the browser hits /api/* on the frontend URL
# and Next.js forwards it server-side to localhost:8000. No NEXT_PUBLIC_API_URL needed.
rm -f "$FRONTEND/.env.local"

# ── 5. Start frontend ─────────────────────────────────────────────────────────
log "Starting frontend..."
cd "$FRONTEND"
[ ! -d "node_modules" ] && npm install
nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
echo $! > "$ROOT/.frontend.pid"
cd "$ROOT"

# ── 6. Wait for both to be healthy ────────────────────────────────────────────
log "Waiting for backend :8000..."
for i in $(seq 1 40); do
  curl -sf http://localhost:8000/health >/dev/null 2>&1 && { log "Backend is up."; break; } || true
  sleep 1
  [ "$i" -eq 40 ] && { err "Backend did not start. Check backend.log:"; tail -20 "$ROOT/backend.log"; exit 1; }
done

log "Waiting for frontend :3000..."
for i in $(seq 1 40); do
  curl -sf http://localhost:3000 >/dev/null 2>&1 && { log "Frontend is up."; break; } || true
  sleep 1
  [ "$i" -eq 40 ] && { err "Frontend did not start. Check frontend.log:"; tail -20 "$ROOT/frontend.log"; exit 1; }
done

# ── 7. Write single-tunnel ngrok config ───────────────────────────────────────
AUTHTOKEN=$(grep "authtoken:" "$NGROK_CFG" | awk '{print $2}' | head -1)
if [ -z "$AUTHTOKEN" ]; then
  err "No ngrok authtoken found in $NGROK_CFG. Run: ngrok config add-authtoken <token>"
  exit 1
fi

cp "$NGROK_CFG" "$NGROK_CFG_BAK"
cat > "$NGROK_CFG" <<EOF
version: "3"
agent:
    authtoken: $AUTHTOKEN
EOF

# ── 8. Start ngrok on frontend port only ──────────────────────────────────────
log "Opening ngrok tunnel for frontend :3000..."
nohup ngrok http 3000 --log=stdout --log-format=json > "$ROOT/.ngrok.log" 2>&1 &
echo $! > "$NGROK_PID_FILE"

PUBLIC_URL=""
for i in $(seq 1 30); do
  sleep 1
  PUBLIC_URL=$(curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
tunnels = json.load(sys.stdin).get('tunnels', [])
https = [t['public_url'] for t in tunnels if t['public_url'].startswith('https')]
print(https[0] if https else '')
" 2>/dev/null || true)
  [ -n "$PUBLIC_URL" ] && break
done

if [ -z "$PUBLIC_URL" ]; then
  err "Could not get ngrok URL. Check .ngrok.log:"
  tail -15 "$ROOT/.ngrok.log" || true
  exit 1
fi

# ── 9. Add ngrok origin to CORS in backend/.env ───────────────────────────────
ENV_FILE="$BACKEND/.env"
if grep -q "^CORS_ORIGINS=" "$ENV_FILE" 2>/dev/null; then
  CURRENT=$(grep "^CORS_ORIGINS=" "$ENV_FILE" | cut -d= -f2-)
  if ! echo "$CURRENT" | grep -qF "$PUBLIC_URL"; then
    python3 -c "
import re
content = open('$ENV_FILE').read()
m = re.search(r'^(CORS_ORIGINS=.*)$', content, re.MULTILINE)
if m:
    content = content[:m.end()] + ',$PUBLIC_URL' + content[m.end():]
    open('$ENV_FILE', 'w').write(content)
"
    warn "Added $PUBLIC_URL to CORS_ORIGINS — backend will hot-reload."
  fi
else
  echo "CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,$PUBLIC_URL" >> "$ENV_FILE"
  warn "Added CORS_ORIGINS to backend/.env."
fi

# ── 10. Print summary ─────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}  Taxzy is live${NC}"
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
info "  Local  → http://localhost:3000"
echo ""
echo -e "  ${YELLOW}  Public → $PUBLIC_URL${NC}"
echo ""
log "API calls are proxied by Next.js (no separate backend tunnel needed)."
log "Ctrl+C stops ngrok (servers keep running). ./killall.sh stops everything."
echo ""

# ── 11. Tail merged logs ──────────────────────────────────────────────────────
(
  tail -f "$ROOT/backend.log"  | sed "s/^/$(printf '\033[0;32m')[BE]$(printf '\033[0m') /" &
  tail -f "$ROOT/frontend.log" | sed "s/^/$(printf '\033[0;34m')[FE]$(printf '\033[0m') /" &
  wait
)
