# Fly.io (backend) + Vercel (frontend)

Deploy the backend to Fly.io and the frontend to Vercel. Your data lives in a Fly.io-managed Postgres instance — still under your control, not Taxzy's.

## Prerequisites

- [flyctl](https://fly.io/docs/hands-on/install-flyctl/) installed and authenticated
- A [Vercel](https://vercel.com) account
- A Gemini API key

## Backend — Fly.io

### 1. Create the app

```bash
fly auth login
fly apps create taxzy-backend   # or pick your own name
```

### 2. Provision Postgres on Fly

```bash
fly postgres create --name taxzy-pg --region bom
fly postgres attach taxzy-pg --app taxzy-backend
# This sets DATABASE_URL automatically as a secret
```

### 3. Set secrets

```bash
fly secrets set \
  GEMINI_API_KEY=your_key \
  JWT_SECRET=$(openssl rand -hex 32) \
  SETU_API_KEY=your_setu_key \
  CORS_ORIGINS=https://your-vercel-app.vercel.app \
  --app taxzy-backend
```

### 4. Deploy

From the repo root:

```bash
fly deploy --app taxzy-backend
```

The `fly.toml` in the repo root is pre-configured. Backend will be at `https://taxzy-backend.fly.dev`.

## Frontend — Vercel

### 1. Update vercel.json

Open `frontend/vercel.json` and replace the destination URL with your actual Fly app URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://taxzy-backend.fly.dev/api/:path*"
    }
  ]
}
```

### 2. Deploy to Vercel

```bash
cd frontend
npx vercel --prod
```

Or connect the repo in the Vercel dashboard. Set this environment variable in Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://taxzy-backend.fly.dev` |

### 3. Update CORS on the backend

Add your Vercel URL to the backend secrets:

```bash
fly secrets set CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000 --app taxzy-backend
```

## Scaling down (free tier)

`fly.toml` has `auto_stop_machines = true` and `min_machines_running = 0` — the backend sleeps when idle, which keeps it on Fly's free allowance for low-traffic self-hosted instances.
