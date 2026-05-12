#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log()  { echo -e "${GREEN}[killall]${NC} $1"; }
warn() { echo -e "${RED}[killall]${NC} $1"; }

# Kill a process group by pid file (kills parent + all children)
kill_pid_file() {
  local name="$1"
  local pidfile="$2"
  if [ -f "$pidfile" ]; then
    local pid
    pid=$(cat "$pidfile")
    if kill -0 "$pid" 2>/dev/null; then
      # Kill the entire process group so child processes (e.g. next dev) also die
      kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null
      log "Stopped $name (pid $pid)"
    else
      warn "$name pid $pid not running"
    fi
    rm -f "$pidfile"
  else
    warn "No pid file for $name — trying port-based kill"
  fi
}

kill_pid_file "backend"  "$ROOT/.backend.pid"
kill_pid_file "frontend" "$ROOT/.frontend.pid"

# Fallback: kill anything still holding our ports or stray next-dev servers
# Next.js may grab 3000, 3001, 3002, etc. when ports are in use
for port in 8000 3000 3001 3002 3003; do
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null && warn "Force-killed stale process on :$port (pids $pids)"
  fi
done

# Also kill any stray next-dev and uvicorn processes by name
pkill -f "next dev" 2>/dev/null && warn "Killed stray 'next dev' processes" || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null && warn "Killed stray uvicorn processes" || true

log "All services stopped."
