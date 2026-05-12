# Taxzy

[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)](https://github.com/rgsuhas/super-tax)

AI-powered Indian tax filing platform. Conversational interface for ITR filing, document parsing, refund tracking, and tax education — built for salaried individuals and freelancers, not CAs.

**Local-first**: your tax data stays on your machine. The only external calls are to the Gemini API (your key) and Setu (optional PAN verification).

## Quick start (Docker)

```bash
git clone https://github.com/rgsuhas/super-tax.git
cd super-tax
cp .env.example backend/.env
# Edit backend/.env — set GEMINI_API_KEY
docker compose up --build
```

App runs at `http://localhost:3000`. See [docs/deployment/docker.md](docs/deployment/docker.md) for details.

---

## Repo structure

```
super-tax/
├── backend/              FastAPI app (Python 3.13)
│   ├── core/             config, database session
│   ├── models/           SQLAlchemy ORM models
│   ├── routers/          API route handlers
│   ├── schemas/          Pydantic request/response models
│   ├── services/         business logic (Gemini, ITR, documents, PAN)
│   ├── mcp_tools/        MCP server tool definitions
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/             Next.js 16 app (React 19, TypeScript)
│   ├── app/
│   │   ├── (app)/        authenticated routes
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── marketplace/
│   │   │   ├── tax-usage/
│   │   │   └── tracker/
│   │   └── (auth)/       login, register
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── store/            Zustand state
│   └── types/
│
├── runall.sh             start backend + frontend
├── killall.sh            stop both services
└── SETUP.md              full environment setup guide
```

---

## Services

| Service  | URL                    |
|----------|------------------------|
| Backend  | http://localhost:8000  |
| Frontend | http://localhost:3000  |
| API docs | http://localhost:8000/docs |

---

## Quick start

See [SETUP.md](./SETUP.md) for bare-metal setup, or [docs/deployment/](docs/deployment/) for all deployment options including Docker and Fly.io.

Once the environment is ready:

```bash
./runall.sh      # starts both services
./killall.sh     # stops both services
```

Logs are written to `backend.log` and `frontend.log` in the repo root.

---

## Backend — key modules

| Module | Purpose |
|--------|---------|
| `routers/auth.py` | JWT-based registration and login |
| `routers/chat.py` | Gemini-powered conversational tax assistant |
| `routers/itr.py` | ITR form generation |
| `routers/documents.py` | Upload and parse Form 16, AIS, 26AS |
| `routers/pan.py` | PAN verification via Setu API |
| `routers/refund.py` | Refund status tracking |
| `routers/marketplace.py` | CA/advisor marketplace |
| `routers/glossary.py` | Tax term definitions |
| `routers/tax_profile.py` | User tax profile CRUD |
| `routers/tax_usage.py` | Token/usage tracking |
| `services/gemini.py` | Gemini API wrapper |
| `services/document_parser.py` | PDF extraction (pdfplumber) |
| `services/tax_calculator.py` | Old vs new regime comparison |
| `services/itr_generator.py` | ITR XML/JSON generation |

---

## Frontend — key dependencies

| Package | Role |
|---------|------|
| Next.js 16 | App framework |
| React 19 | UI |
| Tailwind CSS 4 | Styling |
| Zustand | Client state |
| Framer Motion | Animations |
| Recharts | Tax charts/graphs |
| `@ai-sdk/react` | Streaming chat UI |

---

## Environment variables

Backend reads from `backend/.env`. All keys:

| Variable | Default | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://postgres:taxzy123@localhost:5399/taxzy` | Yes |
| `GEMINI_API_KEY` | — | Yes |
| `JWT_SECRET` | `change-me-in-production` | Yes (change in prod) |
| `JWT_ALGORITHM` | `HS256` | No |
| `JWT_EXPIRY_HOURS` | `24` | No |
| `SETU_API_KEY` | — | For PAN verification |
| `SETU_API_URL` | `https://dg-sandbox.setu.co` | No |
