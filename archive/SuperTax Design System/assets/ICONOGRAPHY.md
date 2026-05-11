# Iconography

**Icon set:** [Tabler Icons](https://tabler.io/icons) (web font, CDN).
**Stroke:** 1.5 px outline, rounded caps/joins.
**Default size:** 16 px inline, 18 px in feature rows, 20 px in icon-only buttons.

## How to use

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">

<i class="ti ti-check"></i>           <!-- inline -->
<i class="ti ti-message-chatbot"></i> <!-- AI chat -->
<i class="ti ti-chart-pie"></i>       <!-- dashboard -->
<i class="ti ti-gift"></i>            <!-- refund marketplace -->
<i class="ti ti-map-2"></i>           <!-- tax usage map -->
```

## Rules

- `currentColor` only — never hardcode a colour. Inherit from parent.
- Stroke variants only (`ti-name`). Filled variants (`ti-name-filled`) are reserved for **active nav** and **pulse dots**.
- Always pair with a text label OR `aria-label`. Icon-only buttons require a tooltip.

## Common icons in this product

| Use | Icon |
|---|---|
| AI assistant | `ti-message-chatbot` |
| Dashboard | `ti-chart-pie`, `ti-chart-bar` |
| Refund / money | `ti-gift`, `ti-clock-dollar`, `ti-coin-rupee` |
| Filing | `ti-file-text`, `ti-check`, `ti-shield-check` |
| Glossary / help | `ti-book`, `ti-bulb`, `ti-question-mark` |
| Tax usage map | `ti-map-2`, `ti-building-bank` |
| User | `ti-user`, `ti-users` |
| Status | `ti-circle-check`, `ti-alert-triangle`, `ti-circle-x` |

## Brand marks

| File | Use |
|---|---|
| `supertax-logo.svg` | Wordmark + chevron. Headers, marketing, email. |
| `supertax-mark.svg` | Chevron only. Favicons, app icons, avatars. |

## What we don't use

- **Emoji in product UI.** Allowed only inside the AI chat reply text, max one per message.
- **Custom illustration system** — not built. Brief separately.
- **Multi-colour or 3-D icons** — off-brand.
