# SuperTax — Design System

**Product:** TaxEase AI — a conversational, AI-powered tax filing platform for India.
**Tagline:** "We are building ChatGPT for taxes — an AI-powered platform that helps ordinary people understand, file, and benefit from taxes in the simplest way possible."
**Market:** India · ~82 million taxpayers · AY 2024-25 onwards.
**Stage:** Hackathon build → v1.2 design system.

---

## Sources

The system is derived from `rgsuhas/super-tax` (private GitHub). Two source HTML files were imported and live at the project root for reference — every token, component, and copy fragment in this kit traces back to one of them:

| File | What it is |
|---|---|
| `taxease_prd_design_system.html` | PRD + DS for **TaxEase AI**. Warm orange/teal palette, Manrope, three-mode theming (light / dark / reading). This is the primary brand source. |
| `VYAS-design-system-final.html` | An earlier, sister design system (Navy/Gold). Kept for reference on motion, sidebar patterns, and dark-mode behaviour. We did **not** carry the navy palette through — SuperTax is warm. |
| `source_README.md` | The original two-line repo README ("Finance Domain · Problem Statement: Tax filing systems are difficult for ordinary citizens"). |

Repo: `https://github.com/rgsuhas/super-tax` (private — view access required).

---

## What's in here — Index

```
SuperTax Design System/
├── README.md                          ← you are here
├── SKILL.md                           ← skill descriptor for Claude Code / Skills
├── colors_and_type.css                ← tokens: colors, type, spacing, shadow, glass, motion
├── source_README.md                   ← original repo README (preserved)
├── taxease_prd_design_system.html     ← imported source · TaxEase PRD + DS
├── VYAS-design-system-final.html      ← imported source · sister DS reference
│
├── assets/                            ← logos, mark, brand SVG
│   ├── supertax-logo.svg
│   ├── supertax-mark.svg
│   └── ICONOGRAPHY.md
│
├── preview/                           ← 16 cards rendered into the Design System tab
│   ├── colors-brand.html
│   ├── colors-neutrals.html
│   ├── colors-semantic.html
│   ├── colors-glass.html
│   ├── type-display.html
│   ├── type-scale.html
│   ├── type-currency.html
│   ├── spacing-scale.html
│   ├── radii-shadows.html
│   ├── motion.html
│   ├── buttons.html
│   ├── pills-badges.html
│   ├── inputs.html
│   ├── alerts.html
│   ├── cards-glass.html
│   └── logo.html
│
├── ui_kits/
│   └── taxease/                       ← the only UI kit — TaxEase product surface
│       ├── README.md
│       ├── index.html                 ← click-through prototype
│       ├── Sidebar.jsx
│       ├── ChatPanel.jsx
│       ├── DashboardCards.jsx
│       ├── RefundCard.jsx
│       └── components.jsx              ← shared atoms (Button, Pill, Input…)
```

---

## CONTENT FUNDAMENTALS — Voice & Copy

The product is talking to a 22-year-old freelancer or a salaried first-time filer, not a CA. Every line should sound like a calm friend who is also good at math.

**Voice in one breath:** warm, plain-spoken, faintly encouraging, occasionally Hinglish.

### Tone Rules

| Do | Don't |
|---|---|
| "Your employer paid ₹18,200 in taxes for you." | "TDS of ₹18,200 has been deducted at source." |
| "You're owed ₹28,450 back. Nice." | "Refund of INR 28,450 is due." |
| "We'll explain TDS in a sec." | "Tax Deducted at Source (TDS) is a mechanism…" |
| "File my taxes — it's free" | "Initiate income tax return submission" |
| "Great, that's the hardest part." | (silence after a long form) |
| "Hinglish chalega? Bata dena." (in chat only) | Forced English-only translations |

### Person
- **You / your.** Always second-person. Never "the user".
- **We** for the product, sparingly. ("We checked your AIS — looks clean.")
- **I** only inside the AI assistant's voice when answering a direct question.

### Casing
- Sentence case everywhere — headers, buttons, nav.
- ALL CAPS only for overlines (10 px tracking-wide labels: `TOTAL REFUND`, `AY 2024-25`).
- Title case is **never** used.

### Numbers & Currency
- Always use `₹` (U+20B9), never "INR" or "Rs." in UI.
- Indian comma grouping: `₹28,450` not `₹28450` and not `₹28.450,00`.
- Lakhs/crores OK in narrative copy ("3.2 lakh users"), exact rupees in dashboard.
- Use the `.t-mono` class or `font-feature-settings: "tnum"` for any column of numbers so they align.

### Jargon
Every tax term — TDS, 80C, 26AS, AIS, ITR, HRA — is **underlined** the first time it appears in a flow, with a tooltip on hover/tap. No jargon ever stands alone.

> **TDS** = Tax Deducted at Source. Think of it as your employer paying your taxes in advance on your behalf.

### Emoji & Symbols
- Emoji are **not** used in product UI. Allowed in chat-bot replies (sparingly, max 1 per message) for tonal warmth: 🎉 on refund redeem, 👋 in greetings.
- The Tabler Icons set is the iconography system (see `assets/ICONOGRAPHY.md`).
- Decorative unicode (✦, ✓, →) is OK in marketing surfaces.

### Sample Copy Block

> **File taxes. Fear nothing.**
> Tell us what you earned. We'll do the math, find your deductions, and tell you how much you're owed back. Usually under 15 minutes.
> [Start filing — it's free →]

---

## VISUAL FOUNDATIONS

### Vibe
Calm, earthy fintech. Stone-neutral paper, slate-blue ink, with a layer of soft frosted glass on top. A muted clay accent shows up only for delight moments (refund unlock, marketplace). Think: a financial product that whispers, not one that shouts.

_(v1 of this system used a warm orange + teal palette — preserved in git history. v2 (current) is the earthy-blue / neutral direction.)_

### Color
- **Primary brand:** Flame Orange `#E8521A` (warm, decisive, energetic — used for the single primary CTA on any screen).
- **Secondary brand:** Teal `#0F6E56` (calm, "everything is fine" colour — used for success, safety, refund-status confirmations).
- **Surface:** Warm cream `#F5F2EF` / paper `#FFFFFF`. **Never** pure neutral grey, never pure white as the page background.
- **Ink:** Warm-black text `#1A1208` (a touch of brown). Never `#000`.
- Three modes: **light** (cream, default), **dark** (deep ink, orange brightens to `#F4845A`), **reading** (warmer paper, identical text colors to light).
- Full black (`#000000`) and full white (`#FFFFFF`) are **never** used as text on background pairs.

### Type
- **Manrope** everywhere (300 / 400 / 500 / 600 / 700 / 800).
- **JetBrains Mono** for currency-heavy tables and inline `code`.
- Tight tracking on display (`-0.03em` at 56 px, easing to 0 at body).
- Headings 1.1 line-height, body 1.6, currency 1.0.
- Tabular & lining numerals on every money number.

### Spacing
- 4 pt base grid. Tokens: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
- Card inner padding: **20 px** (mobile) / **24 px** (desktop).
- Section vertical rhythm: **80 px** between sections, **32 px** between subsections, **16 px** between paragraphs.

### Backgrounds
- **Page:** flat warm cream — no patterns, no noise, no gradients on the body.
- **Glass cards:** layered over a soft warm halo (radial gradient from orange-50 toward cream). The glass is what creates depth, not shadows alone.
- **Refund card** is the one place we use a saturated `linear-gradient(135deg, #E8521A 0%, #C94211 100%)` — it should feel like a single warm object on the page.
- **No** hand-drawn illustrations, **no** stock photos, **no** repeating textures.

### Glass
- All overlays / floating panels / hero cards: `backdrop-filter: saturate(160%) blur(18px)` over a warm-tinted `rgba(255,252,248,0.62)`.
- Inner top-edge highlight (`linear-gradient(135deg, rgba(255,255,255,0.55), transparent 60%)`) is what gives the "real glass" feel — never skip it.
- Glass borders are `rgba(255,255,255,0.55)` (light) or `rgba(245,237,224,0.08)` (dark).
- Glass shadows are warm and soft: `0 8px 24px rgba(26,18,8,0.08)`.

### Corner Radii
- **6 px** — small chips, pills, sub-elements.
- **10 px** — inputs, buttons, badges. The most common radius.
- **16 px** — cards, alerts, panels.
- **24 px** — hero cards, the refund card, modals.
- **9999 px** — pills, avatars, segmented controls.

### Borders
- 1 px hairline `--border-default` (warm cream-200) on most surfaces.
- 1 px `--border-subtle` (4–6 % ink) for low-contrast dividers inside cards.
- 1 px `--border-strong` (warm sandstone) on inputs.
- Focus ring is **always** the orange brand colour, with a 3 px halo at 12 % alpha.

### Shadows
Two systems, both warm:
- **Solid shadows** for opaque cards: `--shadow-sm` → `--shadow-xl`, tinted with `rgba(26,18,8,0.0X)`. They are SOFT — long y-offset, low alpha.
- **Glass shadow** (`--shadow-glass`) for floating panels: combines a soft drop with an `inset 0 1px 0` top highlight.
- Never use pure-black shadow. Never use a hard, short shadow.

### Hover & Press
- **Buttons:** `translateY(-1px)` + colour darken on hover; `translateY(0)` + shadow disappears on press. Duration 180 ms `var(--ease-out)`.
- **Cards (clickable):** shadow steps from `--shadow-sm` → `--shadow-md`, no lift.
- **Ghosts / icon buttons:** background fades in at 6–10 % alpha; never opacity-only.
- **Links / text buttons:** color shifts one step darker, no underline animation.

### Motion
- Easing: `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`) for entries, `--ease-spring` for delight moments (refund unlock).
- Durations: 120 ms / 180 ms / 320 ms / 520 ms — never longer.
- Page transitions: fade + 8 px translate-up. No slide-from-side.
- Progress bars: 600 ms `cubic-bezier(0.4, 0, 0.2, 1)` with a shimmer overlay.
- Pulse dots: 2 s, opacity 1→0.4, scale 1→0.75.
- **Never** bounce on routine interactions. Spring easing is reserved for the marketplace / refund unlock moment.

### Transparency & Blur
- Use blur **only** on glass surfaces, modals, and toasts — never on opaque cards or buttons.
- Blur depth: 8 px (toolbars), 18 px (cards), 24 px+ (modal scrims).
- Always pair blur with a `saturate(140–180%)` — the warm halo behind needs the saturation boost or glass goes grey.

### Imagery Vibe
- Warm-toned, never cool/blue. Slight grain is OK.
- B&W or cool photography is **off-brand**.
- Avoid hero stock-photo people. Prefer iconography, illustrations, or abstract paper textures.

### Layout
- Sidebar nav on desktop, bottom tab bar on mobile.
- Mode switcher sits **top-right, fixed** as a pill segmented control with a glass background.
- Max content width: 940 px for docs, 1200 px for product surfaces.
- Sticky filing progress bar at the top of the chat flow.

### Cards
- White surface, 16 px radius, 1 px `--border-default`, `--shadow-sm`. That's the default.
- Glass card variant for floating UI.
- Highlight variant: tinted accent-subtle background with a coral border.
- Never use a `border-left: 3px solid` accent-only treatment.

---

## ICONOGRAPHY

The system uses **Tabler Icons** as its icon font, loaded from CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

Then any icon is `<i class="ti ti-check"></i>` — 1.7K+ icons, 1.5 px stroke, rounded joins. This matches both source design files.

### Why Tabler
- Same stroke weight as the existing system (the source files use it directly).
- Open source, free, no licence fuss.
- Hinted at small sizes (12–16 px) which we use heavily in inline labels.

### Usage rules
- Default size: **16 px** inline / **18 px** in feature rows / **20 px** in icon-only buttons.
- Default color: `currentColor`. Inherit from parent — never hardcode a colour.
- Stroke icons only — `ti-*-filled` variants are reserved for active nav states and pulse dots.
- Always pair icons with a text label or `aria-label`. Icon-only buttons must have a tooltip.

### Brand marks (in `assets/`)
- `supertax-logo.svg` — full wordmark with chevron mark.
- `supertax-mark.svg` — chevron mark only, square, for favicons / app icons / small placements.

### What we don't use
- **Emoji** — not in product UI. Only inside chat-bot replies for warmth (max 1 per message).
- **Custom illustration system** — not built. If you need one, brief it separately.
- **Multi-colour icons** — outside the brand.

---

## Notes / Caveats

- **Fonts are loaded from Google Fonts CDN** rather than self-hosted `.woff2`. If you want to ship the system offline, download Manrope (300–800) and JetBrains Mono (400–600) into `/fonts/` and replace the `@import` in `colors_and_type.css`.
- **No logo file existed in source.** The `supertax-logo.svg` and `supertax-mark.svg` were built from the brand DNA (warm orange flame + Manrope wordmark). **Flagged for review.**
- **Source files used Tabler Icons via CDN** — we kept the same link rather than vendoring the icon font. Swap to a local font if you need offline.
- **Glassmorphism is an addition, not a port.** The source DS does not use `backdrop-filter`; we added it because the brief asked for it. All glass tokens live under `--glass-*` in `colors_and_type.css` and are opt-in.
