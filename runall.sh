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

# --- PostgreSQL ---
PG_VERSION=17
PG_CLUSTER=main
PG_PORT=5399
if pg_lsclusters -h 2>/dev/null | awk '{print $1, $2, $4}' | grep -q "^$PG_VERSION $PG_CLUSTER online"; then
  log "PostgreSQL $PG_VERSION/$PG_CLUSTER already running on :$PG_PORT"
else
  log "Starting PostgreSQL $PG_VERSION/$PG_CLUSTER on :$PG_PORT..."
  if ! sudo pg_ctlcluster $PG_VERSION $PG_CLUSTER start 2>&1; then
    err "Failed to start PostgreSQL. Check pg logs or run: sudo pg_ctlcluster $PG_VERSION $PG_CLUSTER start"
    exit 1
  fi
  log "PostgreSQL started."
fi

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

# Support Windows (Scripts/) and Unix (bin/) venv layouts
if [ -f "$VENV_DIR/Scripts/activate" ]; then
  source "$VENV_DIR/Scripts/activate"
else
  source "$VENV_DIR/bin/activate"
fi

pip install -q -r requirements.txt

nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "$ROOT/backend.log" 2>&1 &
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

nohup npm run dev > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT/.frontend.pid"
log "Frontend starting on ${BLUE}http://localhost:3000${NC} (pid $FRONTEND_PID)"

# Wait and verify both processes started
sleep 6
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  err "Backend failed to start! Last 30 lines of backend.log:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  tail -30 "$ROOT/backend.log"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  err "Frontend failed to start! Last 30 lines of frontend.log:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  tail -30 "$ROOT/frontend.log"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

log "Both services are up."
log "  Backend:  ${BLUE}http://localhost:8000${NC}"
log "  Frontend: ${BLUE}http://localhost:3000${NC}"
log "  Stop:     ./killall.sh"
log "  Streaming live logs below (Ctrl+C stops tailing but keeps servers running)"
echo ""

# Stream both logs merged with colour-coded prefixes
(
  tail -f "$ROOT/backend.log"  | sed "s/^/$(printf '\033[0;32m')[BE]$(printf '\033[0m') /" &
  TAIL_BE=$!
  tail -f "$ROOT/frontend.log" | sed "s/^/$(printf '\033[0;34m')[FE]$(printf '\033[0m') /" &
  TAIL_FE=$!

  while true; do
    sleep 5
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
      echo ""
      err "⚠  Backend crashed! Last 30 lines:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      tail -30 "$ROOT/backend.log"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      kill $TAIL_BE $TAIL_FE 2>/dev/null
      break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
      echo ""
      err "⚠  Frontend crashed! Last 30 lines:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      tail -30 "$ROOT/frontend.log"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      kill $TAIL_BE $TAIL_FE 2>/dev/null
      break
    fi
  done
)

trap 'echo ""; log "Log tail stopped. Servers still running. Use ./killall.sh to stop them."' INT
wait
