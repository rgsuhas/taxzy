# Taxzy — Backend Plan (FastAPI)

## Team: Backend

## Stack: Python 3.11+, FastAPI, SQLAlchemy, Postgres, pdfplumber, lxml, google-generativeai, python-jose (JWT), bcrypt, questionary (setup CLI)

---

## Context

Taxzy is a conversational, AI-powered tax filing platform for India. Built for a hackathon (~48 hours).

- AI: Gemini 1.5 Flash (free tier)
- Backend: FastAPI (Python)
- DB: Local Postgres + SQLAlchemy
- Auth: JWT (bcrypt password hash)
- Storage: Postgres bytea blobs for uploaded documents

---

## API Contract (source of truth — share with frontend team)

Base URL: `http://localhost:8000`
All protected routes require: `Authorization: Bearer <jwt_token>`

### Auth

```
POST  /api/auth/register       { username, password } → { user_id, username }
POST  /api/auth/login          { username, password } → { access_token, token_type }
POST  /api/auth/logout         → { message }
GET   /api/auth/me             → { user_id, username, created_at }
```

### Chat / AI (Gemini streaming)

```
POST  /api/chat                          { message, conversation_id? }
                                         → SSE stream of Gemini response chunks
                                         → on completion: also emits structured_update event
                                            with extracted tax JSON { income?, tds?, deductions?, pan? }
GET   /api/chat/{conversation_id}        → { messages: [...] }
GET   /api/chat/history                  → [ { conversation_id, created_at, preview } ]
DELETE /api/chat/{conversation_id}       → { message }
```

### Tax Profile

```
GET   /api/tax-profile                   → full tax profile object (see schema below)
PUT   /api/tax-profile                   { field, value } → updated profile
POST  /api/tax-profile/calculate         → {
                                               regime: "old"|"new",
                                               gross_income, taxable_income,
                                               tax_liability, tds_paid,
                                               refund_or_payable,
                                               deductions_breakdown: { 80c, 80d, hra, standard }
                                             }
```

Tax profile schema:

```json
{
  "pan": "ABCDE1234F",
  "pan_verified": true,
  "full_name": "Aarav Sharma",
  "dob": "2001-03-15",
  "filing_type": "salaried|freelancer|both",
  "ay": "2024-25",
  "gross_income": 840000,
  "tds_paid": 42000,
  "other_income": { "interest": 0, "dividends": 0, "capital_gains": 0 },
  "deductions": { "80c": 150000, "80d": 25000, "hra": 0, "standard": 50000 },
  "regime": "new",
  "documents": [ { "doc_id", "type", "uploaded_at" } ]
}
```

### Documents

```
POST  /api/documents/upload              multipart: { file, doc_type? }
                                         auto-detects: form16_pdf | ais_json | itr_xml | form26as_pdf
                                         → { doc_id, doc_type, extracted_fields, merged_into_profile: bool }
GET   /api/documents                     → [ { doc_id, doc_type, filename, uploaded_at } ]
GET   /api/documents/{doc_id}            → { doc_id, doc_type, parsed_data, uploaded_at }
DELETE /api/documents/{doc_id}           → { message }
```

### PAN Verification

```
POST  /api/pan/verify                    { pan } → { valid, full_name, dob, pan_type, status }
                                         (proxies Setu API — keeps API key server-side)
```

### ITR Export

```
GET   /api/itr/generate-xml              → downloadable ITR-1 or ITR-2 XML file
                                         (auto-selects form based on tax profile)
POST  /api/itr/validate                  { xml_content } → { valid, errors: [] }
```

### Refund Marketplace

```
GET   /api/marketplace/offers            → [
                                             { offer_id, brand, logo_url, refund_amount,
                                               voucher_amount, conversion_rate, delivery: "instant" }
                                           ]
POST  /api/marketplace/redeem            { offer_id } → { voucher_code, brand, amount, redeemed_at }
```

### Refund Tracker

```
GET   /api/refund/status                 → {
                                             status: "filed"|"verified"|"processing"|"initiated"|"credited",
                                             current_step: 2,
                                             estimated_date: "2025-03-15",
                                             timeline: [ { step, label, date, done } ]
                                           }
```

### Tax Usage Visualization

```
POST  /api/tax-usage                     { tax_paid } → {
                                             breakdown: [
                                               { category, percentage, amount, personalized_copy }
                                             ],
                                             summary: "Your ₹18,200 built 0.4m of national highway..."
                                           }
```

### Glossary

```
GET   /api/glossary                      → [ { term, definition, example } ]
GET   /api/glossary/{term}               → { term, definition, example }
POST  /api/glossary/explain              { term } → { term, definition } (Gemini fallback)
```

---

## Directory structure

```
backend/
├── main.py                  ← FastAPI app entry, CORS, router registration
├── requirements.txt
├── setup.py                 ← first-run CLI
├── .env.example
│
├── core/
│   ├── config.py            ← settings from .env (pydantic BaseSettings)
│   ├── database.py          ← SQLAlchemy engine + session
│   └── security.py          ← JWT encode/decode, bcrypt
│
├── models/                  ← SQLAlchemy ORM models
│   ├── user.py
│   ├── conversation.py
│   ├── message.py
│   ├── tax_profile.py
│   ├── document.py
│   └── marketplace.py
│
├── schemas/                 ← Pydantic request/response schemas
│   ├── auth.py
│   ├── chat.py
│   ├── tax_profile.py
│   ├── document.py
│   └── marketplace.py
│
├── routers/                 ← one file per API group
│   ├── auth.py
│   ├── chat.py
│   ├── tax_profile.py
│   ├── documents.py
│   ├── pan.py
│   ├── itr.py
│   ├── marketplace.py
│   ├── refund.py
│   ├── tax_usage.py
│   └── glossary.py
│
├── services/                ← business logic, no HTTP here
│   ├── gemini.py            ← Gemini streaming + JSON extraction
│   ├── tax_calculator.py    ← slab calculation, old vs new regime
│   ├── document_parser.py   ← pdfplumber for Form16/26AS, JSON for AIS
│   ├── itr_generator.py     ← lxml ITR-1/ITR-2 XML builder
│   ├── pan_verifier.py      ← Setu API proxy
│   ├── marketplace.py       ← offer logic, redemption
│   └── tax_usage.py         ← budget allocation breakdown
│
└── data/
    ├── glossary.json         ← 40+ tax terms
    ├── itr1_schema.xsd       ← official ITR-1 XSD from incometax.gov.in
    ├── itr2_schema.xsd
    └── marketplace_offers.json
```

---

## Implementation steps

### Step 1 — Project bootstrap

- [ ] `pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic-settings python-jose passlib pdfplumber lxml google-generativeai python-multipart questionary httpx`
- [ ] `core/config.py` — load `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `SETU_API_KEY` from `.env`
- [ ] `core/database.py` — SQLAlchemy async engine + `get_db` dependency
- [ ] `main.py` — FastAPI app with CORS (`http://localhost:3000`), register all routers

### Step 2 — DB models + migrations

- [ ] `models/user.py` — id, username, hashed_password, created_at
- [ ] `models/conversation.py` — id, user_id, created_at
- [ ] `models/message.py` — id, conversation_id, role (user/assistant), content, created_at
- [ ] `models/tax_profile.py` — id, user_id, pan, pan_verified, full_name, dob, filing_type, ay, gross_income, tds_paid, other_income (JSONB), deductions (JSONB), regime, updated_at
- [ ] `models/document.py` — id, user_id, doc_type, filename, raw_blob (LargeBinary), parsed_data (JSONB), uploaded_at
- [ ] `models/marketplace.py` — id, user_id, offer_id, voucher_code, amount, redeemed_at
- [ ] Run `Base.metadata.create_all()` on startup (or Alembic migrations)

### Step 3 — Auth router

- [ ] `POST /api/auth/register` — hash password with bcrypt, insert user
- [ ] `POST /api/auth/login` — verify password, return JWT (24h expiry)
- [ ] `GET /api/auth/me` — decode JWT, return user
- [ ] `core/security.py` — `get_current_user` FastAPI dependency used on all protected routes

### Step 4 — Gemini service + Chat router

- [ ] `services/gemini.py`:
  - System prompt: Indian tax assistant, Hinglish ok, ask one question at a time
  - `stream_chat(messages, user_profile)` → async generator of text chunks
  - `extract_tax_fields(full_response)` → call Gemini with responseSchema to pull structured JSON: `{ income?, tds?, deductions?, pan?, filing_type? }`
- [ ] `routers/chat.py`:
  - `POST /api/chat` → StreamingResponse (SSE), saves messages to DB, emits `structured_update` event at end
  - `GET /api/chat/{conversation_id}` → fetch messages
  - `GET /api/chat/history` → list conversations
  - `DELETE /api/chat/{conversation_id}` → delete

### Step 5 — Document parser + router

- [ ] `services/document_parser.py`:
  - `parse_form16_pdf(bytes)` → extract: employer name, gross salary, TDS, 80C deductions
  - `parse_ais_json(bytes)` → extract: all income sources, TDS entries, interest, dividends
  - `parse_form26as_pdf(bytes)` → extract: TDS entries per deductor
  - `parse_itr_xml(bytes)` → extract: previously filed return data
  - `merge_into_profile(parsed_data, tax_profile)` → update tax profile fields
- [ ] `routers/documents.py` — upload, list, get, delete endpoints
- [ ] Store raw bytes in `raw_blob`, parsed dict in `parsed_data` JSONB column

### Step 6 — Tax calculator service

- [ ] `services/tax_calculator.py`:
  - Old regime slabs (AY 2024-25): 0→2.5L=0%, 2.5L→5L=5%, 5L→10L=20%, >10L=30%
  - New regime slabs: 0→3L=0%, 3L→6L=5%, 6L→9L=10%, 9L→12L=15%, 12L→15L=20%, >15L=30%
  - Apply standard deduction (₹50,000 new regime / ₹50,000 old regime)
  - Apply 80C (max ₹1.5L), 80D (max ₹25,000), HRA calculation
  - Returns: taxable_income, tax_liability, refund_or_payable
- [ ] `POST /api/tax-profile/calculate` uses this service1

### Step 7 — ITR XML generator

- [ ] Download ITR-1 XSD schema from incometax.gov.in
- [ ] `services/itr_generator.py` — build XML tree with lxml from tax profile
- [ ] Auto-select ITR-1 (salaried, single employer) vs ITR-2 (multiple sources)
- [ ] `GET /api/itr/generate-xml` → FileResponse with correct MIME type
- [ ] `POST /api/itr/validate` → validate against XSD, return errors

### Step 8 — PAN verifier

- [ ] `services/pan_verifier.py` — calls Setu PAN API with API key
- [ ] `POST /api/pan/verify` — proxy endpoint, returns name/DOB/status
- [ ] On success: update tax_profile.pan + pan_verified

### Step 9 — Marketplace, Refund tracker, Tax usage, Glossary

- [ ] `data/marketplace_offers.json` — static offers (Amazon, Flipkart, Swiggy) with conversion rates
- [ ] `GET /api/marketplace/offers` — read from JSON, filter by user's refund amount
- [ ] `POST /api/marketplace/redeem` — generate mock voucher code, save to DB
- [ ] `GET /api/refund/status` — return mock timeline (5 steps, step 2 active for demo)
- [ ] `POST /api/tax-usage` — apply fixed budget percentages, generate personalized copy
- [ ] `GET /api/glossary` + `GET /api/glossary/{term}` — serve from `data/glossary.json`
- [ ] `POST /api/glossary/explain` — Gemini call for unknown terms

### Step 10 — Setup CLI + packaging

- [ ] `setup.py` — questionary prompts: Gemini API key (test ping), Postgres URL, first admin username/password
- [ ] Writes `.env`, runs `Base.metadata.create_all()`, seeds glossary.json to DB
- [ ] `.env.example` with all required keys documented

---

## Critical path

Steps 3 → 4 → 5 must be done in order. Everything else (6–9) can be parallelised after Step 2.

## How to run

```bash
python setup.py          # first time only
uvicorn main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```
