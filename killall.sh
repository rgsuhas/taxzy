#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log()  { echo -e "${GREEN}[killall]${NC} $1"; }
warn() { echo -e "${RED}[killall]${NC} $1"; }

kill_pid_file() {
  local name="$1"
  local pidfile="$2"
  if [ -f "$pidfile" ]; then
    local pid
    pid=$(cat "$pidfile")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && log "Stopped $name (pid $pid)"
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

# Fallback: kill anything still holding the ports
for port in 8000 3000; do
  pid=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null && warn "Force-killed stale process on :$port (pid $pid)"
  fi
done

log "All services stopped."
