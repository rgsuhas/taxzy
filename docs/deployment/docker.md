# Docker Compose deployment

The fastest way to run Taxzy locally. Spins up Postgres, the FastAPI backend, and the Next.js frontend with one command.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2 (bundled with Docker Desktop)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Steps

### 1. Clone the repo

```bash
git clone https://github.com/rgsuhas/super-tax.git
cd super-tax
```

### 2. Set up environment

```bash
cp .env.example backend/.env
```

Open `backend/.env` and fill in:

```env
GEMINI_API_KEY=your_key_here
JWT_SECRET=some-long-random-string
# The DATABASE_URL is overridden by docker-compose to point at the postgres container
# Leave the rest as defaults for local dev
```

### 3. Start everything

```bash
docker compose up --build
```

First run takes 2–4 minutes to build images. Subsequent starts are fast.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

### 4. Stop

```bash
docker compose down
# To also delete the database volume:
docker compose down -v
```

## Environment variables

All variables are in `.env.example` at the repo root. The key ones for Docker:

| Variable | Default | Notes |
|----------|---------|-------|
| `POSTGRES_USER` | `taxzy_user` | Postgres username |
| `POSTGRES_PASSWORD` | `changeme` | **Change this in production** |
| `POSTGRES_DB` | `taxzy` | Database name |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Where the frontend calls the backend |
| `GEMINI_API_KEY` | — | Required |
| `JWT_SECRET` | — | Required, use a long random string |

## Updating

```bash
git pull
docker compose up --build
```

## Production hardening

If you expose Taxzy to the internet:

1. Set `POSTGRES_PASSWORD` to a strong password
2. Set `JWT_SECRET` to a 64-char random string (`openssl rand -hex 32`)
3. Set `CORS_ORIGINS` to your frontend domain, e.g. `https://taxzy.yourdomain.com`
4. Put a reverse proxy (nginx/Caddy) in front with TLS
