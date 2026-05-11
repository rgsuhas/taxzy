# SuperTax Design System — Skill

A calm, earthy fintech design system for **TaxEase AI** — India's "ChatGPT for taxes". Slate-blue primary on stone neutrals, with a muted clay accent for delight moments. Use this when designing any surface for the SuperTax product family: filing flows, the AI chat, dashboards, refund/marketplace screens, glossary content, or any marketing material that uses the brand.

## When to use this skill

Reach for it whenever the user mentions:
- SuperTax, TaxEase, "tax filing", "ChatGPT for taxes", "rgsuhas/super-tax"
- A calm, earthy fintech aesthetic (slate blue + clay + stone neutrals) with glassmorphism
- Indian tax UX in particular — `₹` currency, AY 2024-25, ITR, 80C, AIS/TDS terminology, lakh/crore grouping

## What to read first

In this order, no exceptions:

1. **`README.md`** — full system at a glance. Includes voice/copy, visual foundations, iconography, and the index of every file.
2. **`colors_and_type.css`** — every design token: brand colors (`--accent` = `#3D5A80` Slate Blue, `--secondary` = `#A86545` Muted Clay used sparingly), the neutral-ink type stack (Manrope + JetBrains Mono), spacing (4 pt base), radii, shadows, motion, and the three-mode theme switcher (light / dark / reading).
3. **`preview/`** — 16 visual reference cards, one per token group. Open any of them in a browser to see what "right" looks like.
4. **`ui_kits/taxease/index.html`** — the product surface, with every token exercised in context. The fastest way to understand how the system composes.

## Hard rules

These are non-negotiable. Violating any one immediately makes the design off-brand:

- **Never `#000` or pure `#FFF`.** Text is `#1C1F23` (neutral ink). Page background is `#F3F2EF` (stone). Always.
- **One primary CTA per screen.** It is Slate Blue `#3D5A80`. Secondary actions are white-on-ink. Clay (`#A86545`) is for delight only — never two primary buttons competing.
- **Clay is rationed.** Use the muted-clay accent at most once per screen, only on a moment of warmth (refund unlock, gift card redeem, congratulations toast). It is never a CTA color.
- **Currency uses `₹` and Indian comma grouping.** `₹28,450`, never `INR 28,450` or `Rs. 28450` or `₹28.450,00`.
- **Manrope for everything.** JetBrains Mono only for currency columns and inline code. No system fonts, no Inter, no Roboto.
- **Underline every jargon term on first appearance** with a tooltip. TDS, AIS, 26AS, 80C, HRA, ITR — never appear naked.
- **Sentence case for all UI text** (headers, buttons, nav). ALL CAPS only for overlines. Title case is never used.
- **Glass is for floating surfaces only** — modals, toasts, hero cards, the composer. Never on opaque buttons or body cards. Pair `backdrop-filter: blur()` with `saturate(140–180%)` or it goes grey.
- **No emoji in product UI.** Allowed inside AI chat replies only, max one per message.
- **Voice is "calm friend who is good at math".** Second person ("you"), plain language, faintly encouraging. "You're owed ₹28,450 back. Nice." not "A refund of INR 28,450 is due."

## Standard ingredients

When building a new surface, reach for these by default:

| Need | Pattern |
|---|---|
| Page background | Stone neutral + two soft radial halos (slate-100 top-left, clay-50 bottom-right). See `ui_kits/taxease/index.html`. |
| Primary action | Slate-blue filled button, `var(--accent)`, lifts 1 px on hover. |
| Money display | `.t-currency-xl` / `.t-currency-lg` — Manrope 800, tabular numerals, tight tracking. |
| Hero number (refund, owed) | The slate-blue gradient card from `preview/cards-glass.html`. ONE per screen. |
| Stat block | Glass card from `preview/cards-glass.html`. Multiple OK in a grid. |
| Status feedback | Pills from `preview/pills-badges.html`; alerts from `preview/alerts.html`. |
| Form input | `preview/inputs.html` — 10 px radius, slate-blue focus ring. |
| Icons | Tabler Icons (`<i class="ti ti-…"></i>`), 1.5 px stroke, `currentColor`. See `assets/ICONOGRAPHY.md`. |
| Logo | `assets/supertax-logo.svg` (wordmark) or `assets/supertax-mark.svg` (icon only). |

## File map (quick)

```
colors_and_type.css        ← all design tokens, three themes
README.md                  ← full content + visual foundations
assets/                    ← logo, mark, icon docs
preview/*.html             ← 16 reference cards for each token group
ui_kits/taxease/           ← the product surface to learn from / lift
taxease_prd_design_system.html, VYAS-design-system-final.html  ← source files
```

## What this skill is not

- Not a generic fintech kit. The warmth, the Hinglish-friendliness, the jargon-explainer voice — these are SuperTax-specific. Do not strip them out to make the system "more universal".
- Not a component library. Patterns are CSS-first, vanilla HTML. There is no React/Vue dependency. Copy markup from `preview/` or `ui_kits/taxease/` and adapt.
- Not a brand guideline document. For pure brand questions (logo lockups, formal voice docs), tell the user to brief that separately.
