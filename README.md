# SuperTax — Taxzy Design System

**Product:** Taxzy — a conversational, AI-powered tax filing platform for India.
**Tagline:** "We are building ChatGPT for taxes — an AI-powered platform that helps ordinary people understand, file, and benefit from taxes in the simplest way possible."
**Market:** India · ~82 million taxpayers · AY 2024-25 onwards.
**Stage:** Hackathon build → v1.2 design system.
**Repo:** `rgsuhas/super-tax` (private GitHub)

---

## Problem Statement

Tax filing in India is broken for the average person. The Income Tax Department's portal is dense, jargon-heavy, and built for chartered accountants — not the 22-year-old freelancer or the salaried first-time filer who just wants to know how much they're getting back. Taxzy is that calm friend who is also good at math: plain language, warm tone, under 15 minutes.

---

## What's in this repo

```
team117/
├── README.md                         ← you are here
├── taxzy_prd_design_system.html    ← primary source: Taxzy PRD + full design system
│
└── archive/
    ├── VYAS-design-system-final.html     ← sister DS (Navy/Gold) — motion & sidebar reference only
    ├── SuperTax Design System.html       ← earlier compiled snapshot
    └── SuperTax Design System/
        ├── README.md                     ← deep-dive system docs (voice, visual, iconography)
        ├── SKILL.md                      ← Claude Code skill descriptor
        ├── colors_and_type.css           ← all design tokens: colors, type, spacing, shadow, glass, motion
        ├── source_README.md              ← original two-line repo README (preserved)
        ├── taxzy_prd_design_system.html
        ├── VYAS-design-system-final.html
        │
        ├── assets/
        │   ├── supertax-logo.svg         ← full wordmark + chevron mark
        │   ├── supertax-mark.svg         ← chevron mark only (favicon / app icon)
        │   └── ICONOGRAPHY.md
        │
        └── preview/                      ← 16 standalone HTML reference cards
            ├── colors-brand.html
            ├── colors-neutrals.html
            ├── colors-semantic.html
            ├── colors-glass.html
            ├── type-display.html
            ├── type-scale.html
            ├── type-currency.html
            ├── spacing-scale.html
            ├── radii-shadows.html
            ├── motion.html
            ├── buttons.html
            ├── pills-badges.html
            ├── inputs.html
            ├── alerts.html
            ├── cards-glass.html
            └── logo.html
```

---

## Source files

| File | Role |
|---|---|
| `taxzy_prd_design_system.html` | **Primary brand source.** Full PRD + design system for Taxzy. Earthy slate-blue / stone-neutral palette, Manrope typeface, three-mode theming (light / dark / reading). Every token, component, and copy fragment in this kit traces back to this file. |
| `archive/VYAS-design-system-final.html` | Earlier sister DS (Navy/Gold palette). Kept **for reference only** — motion patterns, sidebar layout, and dark-mode behaviour. The navy palette was not carried through; SuperTax is warm and earthy. |

---

## Design foundations

### Brand palette

| Role | Token | Hex |
|---|---|---|
| Primary brand (CTAs, focus rings) | `--accent` / `--st-blue-600` | `#3D5A80` (Earthy Slate Blue) |
| Delight / secondary (rationed) | `--secondary` / `--st-clay-600` | `#A86545` (Muted Clay) |
| Page background | `--bg-base` | `#F3F2EF` (Stone) |
| Surface | `--bg-surface-1` | `#FFFFFF` |
| Primary text | `--text-primary` | `#1C1F23` (Neutral Ink) |

Three modes: **light** (stone, default), **dark** (deep ink, slate brightens), **reading** (warmer paper, identical text colours to light).

Full black (`#000000`) and full white (`#FFFFFF`) are **never** used as text-on-background pairs.

### Type

- **Manrope** (300–800) — every surface.
- **JetBrains Mono** (400–600) — currency columns and inline `code` only.
- Loaded from Google Fonts CDN; self-hosting path: drop Manrope + JetBrains Mono into `/fonts/` and replace `@import` in `colors_and_type.css`.
- Tight tracking on display (`-0.03em` at 56 px → 0 at body). 1.1 heading line-height, 1.6 body, 1.0 currency.
- Tabular lining numerals on every money figure (`font-feature-settings: "tnum"`).

### Spacing

- 4 pt base grid. Tokens: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
- Card inner padding: **20 px** mobile / **24 px** desktop.
- Section rhythm: **80 px** between sections → **32 px** subsections → **16 px** paragraphs.

### Corner radii

| Radius | Used for |
|---|---|
| 6 px | Small chips, pills, sub-elements |
| 10 px | Inputs, buttons, badges (most common) |
| 16 px | Cards, alerts, panels |
| 24 px | Hero cards, modals |
| 9999 px | Pills, avatars, segmented controls |

### Glass system

All overlays, floating panels, and hero cards:
- `backdrop-filter: saturate(150%) blur(18px)`
- Background: `rgba(252,252,250,0.62)`
- Border: `rgba(255,255,255,0.55)` (light) or `rgba(245,237,224,0.08)` (dark)
- Inner highlight: `linear-gradient(135deg, rgba(255,255,255,0.55), transparent 60%)` — this is what makes it read as real glass; never skip it.
- Shadow: `0 8px 24px rgba(26,18,8,0.08)` (warm, soft)

Glass is **opt-in** — all tokens live under `--glass-*` in `colors_and_type.css`. Never apply blur to opaque buttons or body cards.

### Motion

| Token | Value | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | All entries |
| `--ease-spring` | spring | Refund unlock, marketplace delight only |
| Durations | 120 / 180 / 320 / 520 ms | Scale by importance |

Page transitions: fade + 8 px translate-up. No slide-from-side. Never bounce on routine interactions.

### Shadows

Two systems, both warm (never pure-black, never hard/short):
- **Solid shadows** `--shadow-sm` → `--shadow-xl`: `rgba(28,31,35,0.04–0.14)`, long y-offset, low alpha.
- **Glass shadow** `--shadow-glass`: soft drop + `inset 0 1px 0` top highlight.
- Focus glow `--shadow-glow`: `0 0 0 4px rgba(61,90,128,0.20)` (Slate Blue at 20 %).

---

## Component patterns

### Buttons

- **Primary:** Slate-blue filled, `var(--accent)`, `translateY(-1px)` + colour darken on hover; `translateY(0)` + shadow out on press. One per screen.
- **Secondary:** White-on-ink, ghost style.
- **Delight CTA (rationed):** Clay `var(--secondary)` — refund unlock / gift-card redeem only. Never two primary buttons competing.
- Duration: 180 ms `var(--ease-out)`.

### Cards

- Default: white surface, 16 px radius, 1 px `--border-default`, `--shadow-sm`.
- Glass variant: floating UI, hero numbers.
- Highlight variant: accent-subtle background + coral border. Never `border-left: 3px solid`.

### Inputs

- 10 px radius, 1 px `--border-strong`, Slate Blue focus ring with 3 px halo at 12 % alpha.
- Error state: `--status-error` border, no shake animation.

### Pills & badges

- 9999 px radius, Manrope 500, sentence case.
- Status colours map to semantic tokens (`--status-success`, `--status-warning`, `--status-error`, `--status-info`).

### Alerts

- 16 px radius, left-aligned icon, semantic background tint, no coloured left-border treatment.

---

## Iconography

**Tabler Icons** — 1700+ icons, 1.5 px stroke, rounded joins.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<!-- usage -->
<i class="ti ti-check"></i>
```

| Size | Context |
|---|---|
| 16 px | Inline labels |
| 18 px | Feature rows |
| 20 px | Icon-only buttons (must have tooltip + `aria-label`) |

Color is always `currentColor` — never hardcoded. Filled variants (`ti-*-filled`) reserved for active nav states and pulse dots only.

**Brand marks** (`archive/SuperTax Design System/assets/`):
- `supertax-logo.svg` — full wordmark with chevron mark.
- `supertax-mark.svg` — chevron mark only; use for favicons and small placements.

Note: these SVGs were constructed from brand DNA (no logo file existed in the original source). Flagged for design review before production use.

---

## Voice & copy

The product speaks to a 22-year-old freelancer or a salaried first-time filer — not a CA.

**Voice in one breath:** warm, plain-spoken, faintly encouraging, occasionally Hinglish.

| Do | Don't |
|---|---|
| "Your employer paid ₹18,200 in taxes for you." | "TDS of ₹18,200 has been deducted at source." |
| "You're owed ₹28,450 back. Nice." | "Refund of INR 28,450 is due." |
| "File my taxes — it's free" | "Initiate income tax return submission" |
| "Great, that's the hardest part." | (silence after a long form) |
| "Hinglish chalega? Bata dena." (chat only) | Forced English-only translations |

**Person:** You / your (always). We for the product, sparingly. I only inside the AI assistant's direct answers.

**Casing:** Sentence case everywhere. ALL CAPS only for overlines (`TOTAL REFUND`, `AY 2024-25`). Title case is never used.

**Currency:** Always `₹` (U+20B9), never "INR" or "Rs.". Indian comma grouping: `₹28,450`.

**Jargon rule:** Every tax term (TDS, 80C, 26AS, AIS, ITR, HRA) is underlined on first appearance in a flow, with a hover/tap tooltip. No term stands naked.

**Emoji:** Not in product UI. Chat-bot replies only, max one per message, for warmth (🎉 on refund, 👋 in greeting).

---

## Layout

- Desktop: sidebar nav. Mobile: bottom tab bar.
- Mode switcher: top-right, fixed, pill segmented control with glass background.
- Max content width: 940 px (docs), 1200 px (product surfaces).
- Sticky filing-progress bar at the top of the chat flow.
- Page background: flat stone — no patterns, no noise, no body gradients. Depth comes from glass cards and the soft radial halos behind them.

---

## Token file quick-reference (`colors_and_type.css`)

| Group | Prefix |
|---|---|
| Brand (Slate Blue) | `--st-blue-*` |
| Accent (Clay) | `--st-clay-*` |
| Neutral stone | `--st-stone-*` |
| Ink (text) | `--st-ink-*` |
| Semantic surfaces | `--bg-*` |
| Semantic text | `--text-*` |
| Semantic borders | `--border-*` |
| Accent / secondary | `--accent`, `--secondary` |
| Status | `--status-*` |
| Glass | `--glass-*` |
| Shadows | `--shadow-*` |
| Motion | `--ease-*`, `--duration-*` |

All tokens are defined in three `[data-theme]` blocks: `light`, `dark`, `reading`. The theme switcher swaps the attribute on `<html>`.

---

## Hard rules (non-negotiable)

1. **Never `#000` or `#FFF` as text/bg pairs.** Text is `#1C1F23`, page bg is `#F3F2EF`.
2. **One primary CTA per screen.** Slate Blue only. Clay is delight — never a second primary.
3. **`₹` + Indian comma grouping.** `₹28,450` always.
4. **Manrope everywhere.** JetBrains Mono only for money columns and `code`.
5. **Underline every jargon term on first use** with a tooltip.
6. **Sentence case for all UI text.** ALL CAPS only for overlines. Title case never.
7. **Glass on floating surfaces only.** Never on opaque cards or buttons. Always pair blur with `saturate(140–180%)`.
8. **No emoji in product UI.** Chat-bot replies only, one max.
9. **Voice is "calm friend who is good at math."** Second person, plain language, warm.

---

## Caveats

- Fonts are loaded from Google Fonts CDN. For offline/production, self-host Manrope (300–800) and JetBrains Mono (400–600) in `/fonts/` and replace the `@import` in `colors_and_type.css`.
- Logo SVGs were built from brand DNA — no original logo file existed in source. **Needs design sign-off before shipping.**
- Glassmorphism (`backdrop-filter`) is an addition not present in the original source DS. It is entirely opt-in via `--glass-*` tokens.
- Tabler Icons are loaded from CDN. Vendor the font locally if you need offline capability.
