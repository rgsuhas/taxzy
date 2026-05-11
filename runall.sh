#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[runall]${NC} $1"; }
err()  { echo -e "${RED}[runall]${NC} $1"; }

# Kill any stale processes on our ports before starting
for port in 8000 3000 3001 3002 3003; do
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    log "Killing stale processes on :$port (pids $pids)"
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 1
  fi
done

# --- Backend ---
log "Starting backend..."
cd "$BACKEND"

# Use existing venv or create one (supports both 'venv' and '.venv')
if [ -d "venv" ]; then
  VENV_DIR="venv"
elif [ -d ".venv" ]; then
  VENV_DIR=".venv"
else
  log "Creating venv..."
  python3 -m venv venv
  VENV_DIR="venv"
fi

source "$VENV_DIR/bin/activate"
pip install -q -r requirements.txt

setsid nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$ROOT/.backend.pid"
log "Backend starting on ${BLUE}http://localhost:8000${NC} (pid $BACKEND_PID)"

deactivate

# --- Frontend ---
log "Starting frontend..."
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  npm install
fi

setsid nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT/.frontend.pid"
log "Frontend starting on ${BLUE}http://localhost:3000${NC} (pid $FRONTEND_PID)"

# Wait a moment and verify both processes are still alive
sleep 6
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  err "Backend failed to start! Check backend.log:"
  tail -20 "$ROOT/backend.log"
  exit 1
fi
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  err "Frontend failed to start! Check frontend.log:"
  tail -20 "$ROOT/frontend.log"
  exit 1
fi

log "Both services are up."
log "  Backend:  ${BLUE}http://localhost:8000${NC}"
log "  Frontend: ${BLUE}http://localhost:3000${NC}"
log "  Logs:     backend.log · frontend.log"
log "  Stop:     ./killall.sh"
