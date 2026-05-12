# Contributing to Taxzy

Thanks for your interest in contributing. Taxzy is GPL-2.0 licensed and welcomes pull requests.

## Getting started

1. Fork the repo and clone your fork
2. Follow the [bare-metal setup guide](deployment/bare-metal.md) to get a local dev environment running
3. Create a branch: `git checkout -b feat/your-feature` or `fix/your-bug`

## Branching convention

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code cleanup with no behavior change |
| `test/` | Adding or fixing tests |

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- If you're changing API endpoints or database schema, note that in the PR
- All backend changes should pass `pytest` before submitting

## Running tests

```bash
cd backend
source venv/bin/activate
pytest
```

Tests use SQLite — no Postgres needed.

## Code style

**Backend (Python)**
- Follow existing patterns in `routers/`, `services/`, `models/`
- Pydantic schemas go in `schemas/`, SQLAlchemy models in `models/`
- No new dependencies without discussion — keep `requirements.txt` lean

**Frontend (TypeScript/React)**
- All API calls go through `frontend/lib/api.ts`
- State management via Zustand (`frontend/store/taxStore.ts`)
- Components use Tailwind CSS — avoid inline style for layout, use it only for dynamic values

## What we're looking for

- Better document parsing (AIS, 26AS edge cases)
- More ITR form support (ITR-3, ITR-4)
- Improved tax regime comparison logic
- Accessibility improvements in the frontend
- More comprehensive tests

## What to avoid

- Don't store user documents or PII in external services
- Don't add telemetry or analytics without explicit opt-in
- Don't break the bare-metal (`runall.sh`) workflow

## Questions

Open an issue for discussion before starting large changes.
