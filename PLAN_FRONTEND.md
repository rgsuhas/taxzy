# Taxzy — Frontend Plan (Next.js)

## Team: Frontend
## Stack: Next.js 14 (App Router), React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Recharts, Vercel AI SDK, canvas-confetti, Fuse.js, Zustand

---

## Context
Taxzy is a conversational, AI-powered tax filing platform for India. Built for a hackathon (~48 hours).
- AI responses stream from FastAPI backend (SSE)
- Design system: Earthy Slate Blue (#3D5A80), Stone neutrals, Manrope typeface — all tokens in `taxzy_prd_design_system.html`
- Three themes: light (default), dark, reading

---

## API Contract (source of truth — backend team owns this)

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
                                         → on completion: emits structured_update event
                                            with extracted tax JSON { income?, tds?, deductions?, pan? }
GET   /api/chat/{conversation_id}        → { messages: [...] }
GET   /api/chat/history                  → [ { conversation_id, created_at, preview } ]
DELETE /api/chat/{conversation_id}       → { message }
```

### Tax Profile
```
GET   /api/tax-profile                   → full tax profile object
PUT   /api/tax-profile                   { field, value } → updated profile
POST  /api/tax-profile/calculate         → { regime, gross_income, taxable_income,
                                             tax_liability, tds_paid, refund_or_payable,
                                             deductions_breakdown: { 80c, 80d, hra, standard } }
```

### Documents
```
POST  /api/documents/upload              multipart: { file, doc_type? }
                                         → { doc_id, doc_type, extracted_fields, merged_into_profile }
GET   /api/documents                     → [ { doc_id, doc_type, filename, uploaded_at } ]
GET   /api/documents/{doc_id}            → { doc_id, doc_type, parsed_data, uploaded_at }
DELETE /api/documents/{doc_id}           → { message }
```

### PAN Verification
```
POST  /api/pan/verify                    { pan } → { valid, full_name, dob, pan_type, status }
```

### ITR Export
```
GET   /api/itr/generate-xml              → downloadable XML file
POST  /api/itr/validate                  { xml_content } → { valid, errors: [] }
```

### Refund Marketplace
```
GET   /api/marketplace/offers            → [ { offer_id, brand, logo_url, refund_amount,
                                               voucher_amount, conversion_rate, delivery } ]
POST  /api/marketplace/redeem            { offer_id } → { voucher_code, brand, amount, redeemed_at }
```

### Refund Tracker
```
GET   /api/refund/status                 → { status, current_step, estimated_date,
                                             timeline: [ { step, label, date, done } ] }
```

### Tax Usage Visualization
```
POST  /api/tax-usage                     { tax_paid } → { breakdown: [...], summary: "..." }
```

### Glossary
```
GET   /api/glossary                      → [ { term, definition, example } ]
GET   /api/glossary/{term}               → { term, definition, example }
POST  /api/glossary/explain              { term } → { term, definition }
```

---

## Directory structure

```
frontend/
├── app/
│   ├── layout.tsx               ← root layout, theme provider
│   ├── page.tsx                 ← landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx           ← app shell: sidebar + topbar
│   │   ├── chat/page.tsx        ← AI chat interface
│   │   ├── dashboard/page.tsx   ← tax visualization dashboard
│   │   ├── documents/page.tsx   ← upload + manage docs
│   │   ├── marketplace/page.tsx ← refund marketplace
│   │   ├── tracker/page.tsx     ← refund tracker
│   │   └── tax-usage/page.tsx   ← tax usage map
│   └── api/
│       └── proxy/[...path]/route.ts  ← optional: proxy to FastAPI (avoids CORS in prod)
│
├── components/
│   ├── ui/                      ← shadcn/ui primitives (auto-generated)
│   ├── chat/
│   │   ├── ChatWindow.tsx       ← message list + scroll
│   │   ├── ChatBubble.tsx       ← user / AI bubble with Framer Motion entrance
│   │   ├── ChatInput.tsx        ← input + send button
│   │   ├── TypingIndicator.tsx  ← 3-dot pulse
│   │   └── JargonTooltip.tsx    ← underlined term + tooltip
│   ├── dashboard/
│   │   ├── StatCard.tsx         ← animated countup number card
│   │   ├── TaxDonutChart.tsx    ← Recharts donut: income breakdown
│   │   ├── RefundCard.tsx       ← gradient refund hero card
│   │   └── DeductionBar.tsx     ← progress bar per deduction
│   ├── documents/
│   │   ├── UploadZone.tsx       ← drag-drop file upload
│   │   ├── DocCard.tsx          ← uploaded doc preview
│   │   └── AISGuide.tsx         ← step-by-step guide to download AIS from IT portal
│   ├── marketplace/
│   │   ├── OfferCard.tsx        ← brand card with redeem CTA
│   │   └── ConfettiRedemption.tsx ← canvas-confetti on redeem
│   ├── tracker/
│   │   └── RefundTimeline.tsx   ← step timeline with status colours
│   ├── tax-usage/
│   │   ├── IndiaMap.tsx         ← SVG map with animated segments
│   │   └── UsageBreakdown.tsx   ← staggered bar reveal
│   └── layout/
│       ├── Sidebar.tsx          ← desktop nav
│       ├── BottomNav.tsx        ← mobile tab bar
│       └── ModeSwitcher.tsx     ← light/dark/reading pill
│
├── lib/
│   ├── api.ts                   ← typed fetch wrapper (all FastAPI calls)
│   ├── auth.ts                  ← JWT cookie helpers
│   ├── glossary.ts              ← Fuse.js search over glossary
│   ├── tax-calculator.ts        ← client-side slab calc (mirrors backend, for instant feedback)
│   └── mocks/                   ← static JSON fixtures for every endpoint (work offline)
│       ├── tax-profile.json
│       ├── marketplace-offers.json
│       ├── refund-status.json
│       └── glossary.json
│
├── hooks/
│   ├── useChat.ts               ← SSE streaming hook, dispatches structured_update to store
│   ├── useTaxProfile.ts         ← fetches + caches tax profile, re-fetches on structured_update
│   └── useCountUp.ts            ← animated number countup (Framer Motion)
│
├── store/
│   └── taxStore.ts              ← Zustand: tax profile, chat state, theme mode
│
├── types/
│   └── api.ts                   ← TypeScript interfaces mirroring all API response schemas
│
└── public/
    └── india-map.svg            ← segmented India SVG for tax usage visualization
```

---

## Implementation steps

### Step 1 — Project bootstrap
- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Install: `framer-motion recharts zustand canvas-confetti fuse.js @ai-sdk/react`
- [ ] `npx shadcn@latest init` — set theme to neutral, configure CSS variables
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`
- [ ] Apply Taxzy design tokens to `globals.css`:
  - `--accent: #3D5A80`, `--secondary: #A86545`, `--bg-base: #F3F2EF`
  - Import Manrope (300–800) + JetBrains Mono (400–600) from Google Fonts
  - Define all `[data-theme="light/dark/reading"]` token blocks from PRD

### Step 2 — API client + types ← DO THIS FIRST, unblocks everything
- [ ] `types/api.ts` — TypeScript interfaces for: `TaxProfile`, `Message`, `Conversation`, `Document`, `MarketplaceOffer`, `RefundStatus`, `GlossaryTerm`, `TaxCalculation`, `TaxUsage`
- [ ] `lib/api.ts` — typed fetch wrapper:
  - Auto-attaches `Authorization: Bearer <token>` from cookie
  - Handles 401 → redirect to `/login`
  - Named functions: `getProfile()`, `calculate()`, `uploadDocument()`, `getOffers()`, `redeemOffer()`, `getRefundStatus()`, `getTaxUsage()`, etc.
- [ ] `lib/mocks/` — create JSON fixture for every endpoint
  - Frontend runs 100% offline against mocks until backend is ready
  - Toggle via `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`

### Step 3 — Auth pages
- [ ] `/login` — shadcn Card + Input + Button, Framer Motion fade-in
  - `POST /api/auth/login` → store JWT in HTTP-only cookie → redirect to `/chat`
- [ ] `/register` — same pattern → redirect to `/chat`
- [ ] `middleware.ts` — redirect unauthenticated users to `/login` on all `(app)/*` routes

### Step 4 — App shell (layout)
- [ ] `(app)/layout.tsx` — sidebar (desktop) + bottom nav (mobile) + mode switcher fixed top-right
- [ ] `Sidebar.tsx`:
  - Links: Chat, Dashboard, Documents, Marketplace, Tracker, Tax Usage
  - Active state: slate-blue gradient pill per design system
  - Framer Motion: `whileHover` scale + color transition
- [ ] `BottomNav.tsx` — mobile tab bar with same 6 routes, Tabler icons
- [ ] `ModeSwitcher.tsx` — pill segmented control, sets `data-theme` on `<html>`, glass background

### Step 5 — Landing page
- [ ] Hero: `"File taxes. Fear nothing."` — Manrope 800, -0.035em tracking, Framer Motion fade+translateY on load
- [ ] Problem (left) / Solution (right) two-column info cards
- [ ] Feature rows: AI assistant, Refund marketplace, Tax visualization, Jargon simplifier
- [ ] Competitive table vs ClearTax
- [ ] Single primary CTA: `"File my taxes — it's free"` → `/chat`
- [ ] Scroll-triggered animations: `initial={{ opacity:0, y:8 }}` → `whileInView={{ opacity:1, y:0 }}` at 180ms per section

### Step 6 — Chat interface (core feature — highest priority)
- [ ] `useChat.ts` hook:
  - `POST /api/chat` → `EventSource` / `fetch` with SSE
  - Appends chunks to messages array as they arrive
  - On `structured_update` event → `taxStore.updateProfile(data)`
- [ ] `ChatWindow.tsx` — scrollable list, `useEffect` auto-scroll to bottom on new message
- [ ] `ChatBubble.tsx`:
  - AI: stone background, 4px/12px/12px/12px radius
  - User: slate-blue background, 12px/4px/12px/12px radius
  - Framer Motion: `initial={{ opacity:0, y:8 }}` → `animate={{ opacity:1, y:0 }}` 180ms ease-out
- [ ] `TypingIndicator.tsx` — 3-dot pulse animation, shown while `isStreaming`
- [ ] `JargonTooltip.tsx`:
  - Post-process AI response text, detect known terms via `lib/glossary.ts` (Fuse.js)
  - Wrap matched terms in `<u>` with dotted underline + tooltip on hover/tap
- [ ] Sticky filing progress bar at page top (% of required fields collected)

### Step 7 — Tax dashboard
- [ ] `useTaxProfile.ts` — `GET /api/tax-profile`, re-fetches automatically when `taxStore` signals `structured_update`
- [ ] `useCountUp.ts` — Framer Motion `useMotionValue` + `useSpring`, animates 0 → target over 800ms ease-out
- [ ] `StatCard.tsx` — label + animated number + description. Four cards:
  - Gross Income (ink), TDS Deducted (success green), Deductions Found (accent blue), Refund Expected (clay)
- [ ] `TaxDonutChart.tsx` — Recharts `PieChart`, animated on data change, centre label shows refund amount
- [ ] `RefundCard.tsx` — slate-blue gradient (`#3D5A80 → #1F3654`), JetBrains Mono for ₹ amount, subtle radial halo
- [ ] `DeductionBar.tsx` — progress bars for 80C / 80D / HRA with shimmer `::after` animation

### Step 8 — Document upload
- [ ] `UploadZone.tsx`:
  - Drag-drop zone + click-to-browse, accepts `.pdf`, `.json`, `.xml`
  - Shows file type icon (Tabler), filename, upload progress bar
  - On success: slide-in summary of extracted fields (income, TDS, PAN found, etc.)
  - `POST /api/documents/upload` multipart
- [ ] `AISGuide.tsx` — collapsible accordion:
  - "How to download your AIS from the IT portal" — 5 numbered steps with deep link to incometax.gov.in
  - Explains: login → e-File → AIS → Download JSON
- [ ] `DocCard.tsx` — uploaded doc list: type badge (pill), filename, date, parsed field count, delete button

### Step 9 — Refund marketplace (WOW feature)
- [ ] `OfferCard.tsx`:
  - Brand logo square (Amazon orange, Swiggy orange, Flipkart yellow)
  - Shows: your refund amount, voucher amount, conversion rate, "instant delivery"
  - Amazon: primary slate-blue CTA. Swiggy: clay CTA (per design system — one delight CTA only)
  - Framer Motion `whileHover`: `translateY(-2px)` + `shadow-md`
- [ ] `ConfettiRedemption.tsx` — on Redeem click:
  1. `POST /api/marketplace/redeem`
  2. `canvas-confetti` in slate blue `#3D5A80` + clay `#A86545` colours
  3. Card Framer Motion `rotateY(180deg)` flip → back face shows voucher code
  4. Total duration: 1200ms

### Step 10 — Refund tracker
- [ ] `RefundTimeline.tsx` — vertical timeline, 5 steps: Filed → Verified → Processing → Initiated → Credited
  - Done: slate-blue filled dot + checkmark icon
  - Current: pulsing dot (CSS `pulse` animation)
  - Pending: stone grey dot
  - Framer Motion staggered entrance: each step `delay: index * 0.1s`
  - Estimated credit date shown at bottom

### Step 11 — Tax usage visualization
- [ ] `IndiaMap.tsx`:
  - SVG India map with labelled segments per budget category
  - Framer Motion `pathLength` animation: 0 → 1 staggered (100ms delay per segment)
  - Hover: highlight segment + show tooltip with ₹ amount
- [ ] `UsageBreakdown.tsx`:
  - Horizontal bar per category: Roads, Railways, Healthcare, Education, Defence, Digital India, Other
  - Count-up percentages + personalized ₹ copy: "Your ₹X funded Y"
  - Full reveal: 1.5s staggered, ease-out

### Step 12 — Setup + packaging
- [ ] `setup.js` (Node, uses `@clack/prompts`):
  - Prompts: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
  - Writes `frontend/.env.local`
- [ ] `package.json` scripts:
  ```json
  {
    "setup": "node setup.js",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
  ```

---

## Key design rules (from PRD — non-negotiable)

1. **Never `#000` or `#FFF` as text/bg pairs** — use `--text-primary: #1C1F23`, `--bg-base: #F3F2EF`
2. **One primary CTA per screen** — slate blue only. Clay (`#A86545`) is delight-only (refund redeem)
3. **`₹` + Indian comma grouping** — `₹28,450` always. JetBrains Mono for all money figures
4. **Manrope everywhere** — JetBrains Mono only for currency columns and `<code>`
5. **Sentence case for all UI text** — ALL CAPS only for overlines (`TOTAL REFUND`)
6. **Glass on floating surfaces only** — never on opaque cards or buttons
7. **No emoji in product UI** — chatbot replies only, max one per message
8. **Underline every jargon term on first use** with a dotted underline + tooltip

---

## How to run
```bash
npm run setup       # first time only — writes .env.local
npm run dev         # http://localhost:3000
```

To run fully offline against mocks (no backend needed):
```bash
NEXT_PUBLIC_USE_MOCKS=true npm run dev
```

---

## Coordination points with backend team

| When | What |
|---|---|
| Day 1 | Share `types/api.ts` with backend — they must match these shapes |
| Backend Step 3 done | Swap `/api/auth/*` mock for real endpoints |
| Backend Step 4 done | Swap `/api/chat` mock for real SSE stream — dashboard goes live |
| Backend Step 5 done | Swap document upload mock for real parser |
| All other endpoints | Can be swapped independently, no ordering required |
