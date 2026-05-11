# TaxEase AI — UI kit

The product surface that ties the design system together. Single-file prototype showing:

- **Left sidebar** (nav) — Ask TaxEase · Dashboard · My filings · Refund marketplace · Where my tax goes · Glossary · Connect a CA
- **Centre column** — Sticky filing progress strip → chat conversation (jargon-underline tooltips, inline mini-tables, follow-up chips) → glass composer
- **Right rail** — Refund hero card (the warm orange gradient moment) · Stat cards · Deductions found

## Why this kit and not more

The product is the chat. Everything else is supporting. We built the one surface that exercises every token in the system (glass cards, jargon underlines, currency type, primary CTA, three different card styles, status pills, the warm halo background) so a developer or designer can lift patterns directly.

## What's interactive

- Click any **chip** under a bot message → it appends a "you" message with that text.
- Hover the dotted-underlined terms (TDS, AIS, 26AS) → native tooltip with plain-English definition.
- Resize the viewport → tablet collapses to icon-only sidebar at < 1100 px; mobile drops the right rail and pins the sidebar to the bottom at < 680 px.

## What's intentionally NOT built

- Auth, real filing, document upload backend — out of scope for a DS kit.
- Dark / reading mode toggle — tokens exist in `colors_and_type.css`; flip `data-theme` on `<html>` to test. We didn't ship a switcher UI to keep this file focused on the warm/light direction.
- Onboarding, settings, glossary detail pages — patterns are the same as this surface.

## How to read it

Open `index.html` directly. Every CSS class is documented inline. All values reference the `--*` tokens in `../../colors_and_type.css` — change a token there and the whole kit moves with it.
