# Setup guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | 3.13 tested |
| Node.js | 18+ | 20 LTS recommended |
| PostgreSQL | 14+ | must be running locally |
| `lsof` | any | used by runall/killall for port checks |

---

## 1. Clone and enter the repo

```bash
git clone https://github.com/rgsuhas/super-tax.git
cd super-tax
```

---

## 2. PostgreSQL

Create the database and user:

```sql
-- run as postgres superuser
CREATE DATABASE taxzy;
CREATE USER taxzy_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE taxzy TO taxzy_user;
```

Or use the default credentials (`postgres` / `password`) if running locally for development.

---

## 3. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taxzy
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=change-this-to-a-long-random-string
SETU_API_KEY=your_setu_api_key_here        # optional, for PAN verification
SETU_API_URL=https://dg-sandbox.setu.co    # sandbox by default
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Tables are created automatically on first startup via SQLAlchemy's `create_all`.

Test the backend manually:

```bash
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

---

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

The frontend proxies API calls to `http://localhost:8000`. No `.env` needed for local development.

---

## 5. Running both together

From the repo root:

```bash
./runall.sh
```

This will:
- Kill anything already on ports 8000, 3000–3003
- Activate the Python venv, install/update backend deps
- Start uvicorn in the background (logs to `backend.log`)
- Install frontend deps if `node_modules` is missing
- Start Next.js dev server in the background (logs to `frontend.log`)
- Wait 6 seconds and verify both processes are alive

To stop:

```bash
./killall.sh
```

---

## 6. Running tests

```bash
cd backend
source venv/bin/activate
pytest
```

Tests use a separate SQLite database (`test_taxease.db`) — no Postgres required for the test suite.

---

## Common issues

**`psycopg2-binary` build failure on Python 3.13**

The requirements pin `>=2.9.10` which includes Python 3.13 wheels. If you hit a compile error, ensure pip is up to date:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Port already in use after a crash**

```bash
./killall.sh
# or manually:
kill $(lsof -ti tcp:8000)
kill $(lsof -ti tcp:3000)
```

**Next.js starts on port 3001/3002 instead of 3000**

A stray Next.js process is holding 3000. `killall.sh` handles this automatically. If it persists:

```bash
pkill -f "next dev"
./runall.sh
```

**Frontend cannot reach the backend**

Ensure the backend is running on port 8000. The CORS allow-list in `backend/main.py` covers `localhost:3000` — if Next.js is on a different port (3001, 3002), requests will be blocked. Run `./killall.sh` then `./runall.sh` to reset ports.

**Database connection refused**

Check that PostgreSQL is running:

```bash
pg_lsclusters           # Debian/Ubuntu
brew services list      # macOS
```

Verify your `DATABASE_URL` in `backend/.env` matches the actual credentials.
