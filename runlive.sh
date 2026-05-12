#!/usr/bin/env bash
# runlive.sh — starts backend + frontend + two ngrok tunnels.
# Automatically wires NEXT_PUBLIC_API_URL and CORS_ORIGINS to the ngrok backend URL.

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

NGROK_FE_PID_FILE="$ROOT/.ngrok_fe.pid"
NGROK_BE_PID_FILE="$ROOT/.ngrok_be.pid"

cleanup() {
  echo ""
  log "Shutting down ngrok tunnels..."
  [ -f "$NGROK_FE_PID_FILE" ] && kill "$(cat "$NGROK_FE_PID_FILE")" 2>/dev/null || true; rm -f "$NGROK_FE_PID_FILE"
  [ -f "$NGROK_BE_PID_FILE" ] && kill "$(cat "$NGROK_BE_PID_FILE")" 2>/dev/null || true; rm -f "$NGROK_BE_PID_FILE"
  pkill -f "ngrok http" 2>/dev/null || true
  log "ngrok stopped. Backend + frontend still running — use ./killall.sh to stop them."
}
trap cleanup EXIT INT TERM

# Starts an ngrok tunnel and returns its public HTTPS URL + API port used.
# Usage: start_ngrok <local-port> <log-file> <pid-file>
# Prints: "<public-url> <api-port>"
start_ngrok() {
  local port="$1"
  local logfile="$2"
  local pidfile="$3"

  # Find a free API port starting from 4040
  local api_port=4040
  while lsof -ti tcp:"$api_port" >/dev/null 2>&1; do
    api_port=$((api_port + 1))
  done

  nohup ngrok http "$port" --log=stdout --api-addr="127.0.0.1:$api_port" > "$logfile" 2>&1 &
  echo $! > "$pidfile"

  local url=""
  for i in $(seq 1 20); do
    sleep 1
    url=$(curl -sf "http://127.0.0.1:$api_port/api/tunnels" 2>/dev/null | python3 -c "
import sys, json
tunnels = json.load(sys.stdin).get('tunnels', [])
https = [t['public_url'] for t in tunnels if t['public_url'].startswith('https')]
print(https[0] if https else '')
" 2>/dev/null || true)
    [ -n "$url" ] && break
  done

  echo "$url $api_port"
}

# ── 1. Kill stale processes on our ports ──────────────────────────────────────
for port in 8000 3000 3001 3002 3003; do
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  [ -n "$pids" ] && echo "$pids" | xargs kill 2>/dev/null && sleep 0.5 || true
done
pkill -f "ngrok http" 2>/dev/null || true
sleep 1

# ── 2. Start PostgreSQL if needed ─────────────────────────────────────────────
PG_VERSION=17; PG_CLUSTER=main
if pg_lsclusters -h 2>/dev/null | awk '{print $1, $2, $4}' | grep -q "^$PG_VERSION $PG_CLUSTER online"; then
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
BACKEND_PID=$!
echo $BACKEND_PID > "$ROOT/.backend.pid"
deactivate

# ── 4. Start frontend ─────────────────────────────────────────────────────────
log "Starting frontend..."
cd "$FRONTEND"
[ ! -d "node_modules" ] && npm install
nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT/.frontend.pid"
cd "$ROOT"

# ── 5. Wait for both to be healthy ────────────────────────────────────────────
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

# ── 6. Start backend ngrok tunnel ─────────────────────────────────────────────
log "Opening ngrok tunnel for backend :8000..."
read BE_URL BE_API_PORT < <(start_ngrok 8000 "$ROOT/.ngrok_be.log" "$NGROK_BE_PID_FILE")

if [ -z "$BE_URL" ]; then
  err "Could not get ngrok backend URL. Check .ngrok_be.log for details."
  tail -10 "$ROOT/.ngrok_be.log" || true
  exit 1
fi
log "Backend tunnel: ${BLUE}$BE_URL${NC} (ngrok API on :$BE_API_PORT)"

# ── 7. Patch CORS_ORIGINS in backend/.env ─────────────────────────────────────
ENV_FILE="$BACKEND/.env"
if grep -q "^CORS_ORIGINS=" "$ENV_FILE" 2>/dev/null; then
  CURRENT=$(grep "^CORS_ORIGINS=" "$ENV_FILE" | cut -d= -f2-)
  if ! echo "$CURRENT" | grep -qF "$BE_URL"; then
    python3 -c "
import re
content = open('$ENV_FILE').read()
m = re.search(r'^(CORS_ORIGINS=.*)$', content, re.MULTILINE)
if m:
    content = content[:m.end()] + ',$BE_URL' + content[m.end():]
    open('$ENV_FILE', 'w').write(content)
"
    warn "Added $BE_URL to CORS_ORIGINS — backend will hot-reload."
  fi
else
  echo "CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,$BE_URL" >> "$ENV_FILE"
  warn "Added CORS_ORIGINS to backend/.env — backend will hot-reload."
fi

# ── 8. Write frontend .env.local and restart frontend ─────────────────────────
FE_ENV="$FRONTEND/.env.local"
echo "NEXT_PUBLIC_API_URL=$BE_URL" > "$FE_ENV"
log "Wrote NEXT_PUBLIC_API_URL=$BE_URL → frontend/.env.local"
log "Restarting frontend to apply new API URL..."

kill $FRONTEND_PID 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

cd "$FRONTEND"
nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT/.frontend.pid"
cd "$ROOT"

log "Waiting for frontend to come back up..."
for i in $(seq 1 40); do
  curl -sf http://localhost:3000 >/dev/null 2>&1 && { log "Frontend restarted."; break; } || true
  sleep 1
  [ "$i" -eq 40 ] && { err "Frontend restart failed."; exit 1; }
done

# ── 9. Start frontend ngrok tunnel ────────────────────────────────────────────
log "Opening ngrok tunnel for frontend :3000..."
read FE_URL FE_API_PORT < <(start_ngrok 3000 "$ROOT/.ngrok_fe.log" "$NGROK_FE_PID_FILE")

[ -z "$FE_URL" ] && { err "Could not get ngrok frontend URL. Check .ngrok_fe.log."; tail -10 "$ROOT/.ngrok_fe.log" || true; exit 1; }

# ── 10. Print summary ─────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}  Taxzy is live${NC}"
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
info "  Local  → frontend: http://localhost:3000  backend: http://localhost:8000"
echo ""
echo -e "  ${YELLOW}  Public → frontend: $FE_URL${NC}"
echo -e "  ${YELLOW}  Public → backend:  $BE_URL${NC}"
echo ""
log "Ctrl+C stops ngrok tunnels (servers keep running). ./killall.sh stops everything."
echo ""

# ── 11. Tail merged logs ──────────────────────────────────────────────────────
(
  tail -f "$ROOT/backend.log"  | sed "s/^/$(printf '\033[0;32m')[BE]$(printf '\033[0m') /" &
  tail -f "$ROOT/frontend.log" | sed "s/^/$(printf '\033[0;34m')[FE]$(printf '\033[0m') /" &
  wait
)
