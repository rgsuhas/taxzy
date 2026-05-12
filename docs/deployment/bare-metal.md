# Bare-metal deployment

Run Taxzy directly on your machine without Docker. Good for development or if you already have Postgres running.

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ (3.13 tested) |
| Node.js | 18+ (20 LTS recommended) |
| PostgreSQL | 14+ |
| `lsof` | any (used by runall.sh for port checks) |

## 1. Clone

```bash
git clone https://github.com/rgsuhas/super-tax.git
cd super-tax
```

## 2. PostgreSQL

Create a database:

```sql
-- run as postgres superuser
CREATE DATABASE taxzy;
CREATE USER taxzy_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE taxzy TO taxzy_user;
```

## 3. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://taxzy_user:yourpassword@localhost:5432/taxzy
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=change-this-to-a-long-random-string
SETU_API_KEY=your_setu_api_key_here        # optional, for PAN verification
SETU_API_URL=https://dg-sandbox.setu.co
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Tables are created automatically on first startup via SQLAlchemy `create_all`.

Test manually:

```bash
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

## 5. Run both together

From the repo root:

```bash
./runall.sh   # starts backend + frontend + tails logs
./killall.sh  # stops both
```

Logs are written to `backend.log` and `frontend.log` in the repo root.

## 6. Running tests

```bash
cd backend
source venv/bin/activate
pytest
```

Tests use SQLite — no Postgres needed for the test suite.

## Common issues

**`psycopg2-binary` build failure on Python 3.13**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Port already in use**

```bash
./killall.sh
# or manually:
kill $(lsof -ti tcp:8000)
kill $(lsof -ti tcp:3000)
```

**Frontend cannot reach the backend**

Ensure the backend is on port 8000. The CORS allow-list reads from `CORS_ORIGINS` in `backend/.env` — make sure the frontend port is listed there.

**Database connection refused**

```bash
pg_lsclusters           # Debian/Ubuntu
brew services list      # macOS
```

Verify `DATABASE_URL` in `backend/.env` matches your actual Postgres credentials.
