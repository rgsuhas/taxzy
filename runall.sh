#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[runall]${NC} $1"; }

# --- Backend ---
log "Starting backend..."
cd "$BACKEND"
if [ ! -d ".venv" ]; then
  log "Creating venv..."
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "$ROOT/backend.log" 2>&1 &
echo $! > "$ROOT/.backend.pid"
log "Backend running on ${BLUE}http://localhost:8000${NC} (pid $(cat "$ROOT/.backend.pid"))"

# --- Frontend ---
log "Starting frontend..."
cd "$FRONTEND"
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  npm install
fi
nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
echo $! > "$ROOT/.frontend.pid"
log "Frontend running on ${BLUE}http://localhost:3000${NC} (pid $(cat "$ROOT/.frontend.pid"))"

log "Both services up. Logs: backend.log · frontend.log"
log "Run ./killall.sh to stop everything."
