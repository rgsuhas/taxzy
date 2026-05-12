# Architecture

## Services

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Next.js 16 frontend  (port 3000)                       │
│  React 19 · Tailwind · Zustand · Framer Motion          │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP / fetch  (NEXT_PUBLIC_API_URL)
┌───────────────────▼─────────────────────────────────────┐
│  FastAPI backend  (port 8000)                            │
│  Python 3.13 · SQLAlchemy · pydantic-settings           │
│                                                         │
│  Routers: auth, chat, tax_profile, documents,           │
│           pan, itr, marketplace, refund,                │
│           tax_usage, glossary                           │
│                                                         │
│  Services:                                              │
│    gemini.py        ──► Google Gemini API               │
│    document_parser  ──► pdfplumber (local)              │
│    tax_calculator   ──► local computation               │
│    pan_verifier     ──► Setu API (optional)             │
│    itr_generator    ──► local XML/JSON                  │
└───────────────────┬─────────────────────────────────────┘
                    │ psycopg2
┌───────────────────▼─────────────────────────────────────┐
│  PostgreSQL  (port 5432 / 5399 bare-metal dev)          │
│  Tables: users, conversations, messages,                │
│          tax_profiles, documents, marketplace_offers    │
└─────────────────────────────────────────────────────────┘
```

## Data flow — chat

1. User sends a message from the frontend chat UI
2. Frontend POSTs to `POST /api/chat/{conversation_id}/message`
3. Backend fetches the user's tax profile and conversation history from Postgres
4. Builds a Gemini prompt with tax context + history
5. Streams the Gemini response back via SSE
6. Frontend renders tokens as they arrive using `@ai-sdk/react`

## Data flow — document parsing

1. User uploads a PDF (Form 16, AIS, 26AS)
2. `POST /api/documents/upload` receives the file
3. `services/document_parser.py` extracts fields locally with pdfplumber
4. Extracted fields (income, TDS, PAN) are merged into the user's tax profile
5. Document metadata stored in Postgres; raw file is not persisted

## Key modules

| Path | Purpose |
|------|---------|
| `backend/core/config.py` | Pydantic settings — reads `.env` |
| `backend/core/database.py` | SQLAlchemy session factory |
| `backend/core/security.py` | JWT encoding/decoding, password hashing |
| `backend/services/gemini.py` | Gemini API wrapper, streaming |
| `backend/services/tax_calculator.py` | Old vs new regime comparison |
| `backend/services/itr_generator.py` | ITR-1/ITR-2 XML generation |
| `frontend/lib/api.ts` | All backend API calls |
| `frontend/store/taxStore.ts` | Zustand global state |

## MCP server

`backend/mcp_server.py` exposes an MCP server for AI agent tooling. Tools include: `onboarding`, `chat`, `pan_verify`, `documents`, `tax_calculation`. Run it with `python mcp_server.py` for agent integrations.
