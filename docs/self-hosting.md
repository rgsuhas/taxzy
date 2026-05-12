# Self-hosting Taxzy

Taxzy is **local-first by design**. Your tax data — income figures, PAN, documents — never touches our servers unless you choose a hosted deployment. When you self-host, everything stays on your machine.

## Deployment options

| Option | Best for | Guide |
|--------|----------|-------|
| Docker Compose | Most users — one command, zero config | [docker.md](deployment/docker.md) |
| Bare-metal | Developers, existing infra | [bare-metal.md](deployment/bare-metal.md) |
| Fly.io + Vercel | Cloud hosting with data control | [fly-vercel.md](deployment/fly-vercel.md) |

## What you'll need

- **Gemini API key** — free tier works: [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **Setu API key** — optional, only needed for PAN verification: [setu.co](https://setu.co)
- **PostgreSQL** — included automatically in Docker Compose; manual install otherwise

## Privacy guarantees when self-hosted

- All conversations stay in your local database
- Documents (Form 16, AIS, 26AS) are stored and parsed locally
- The only outbound calls are to:
  - Google Gemini API (your key, your quota)
  - Setu API if PAN verification is used (optional)
  - Income Tax portal for refund status (read-only)

## Quick start (Docker)

```bash
git clone https://github.com/rgsuhas/super-tax.git
cd super-tax
cp .env.example backend/.env
# Edit backend/.env and set GEMINI_API_KEY
docker compose up --build
```

App is live at `http://localhost:3000`.
