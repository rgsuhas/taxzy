# Taxzy Landing Page — Full Build Plan

## Stack
- **Next.js 16** (already set up) + **Framer Motion 12** (already installed)
- **Spline** for the hero 3D element — embed via `@splinetool/react-spline`
- **Tabler Icons** for all iconography
- **Manrope** font (already in design system)

---

## Page Structure (top to bottom)

### 1. NAVBAR
**Sticky, glass background**
```
[Taxzy logo + chevron mark]          [Features] [How it works] [Pricing]    [Log in]  [File free →]
```
- `backdrop-filter: blur(18px) saturate(150%)`, `rgba(252,252,250,0.72)` bg
- Shrinks height on scroll (80px → 60px), 180ms ease-out
- CTA button: Slate Blue `#3D5A80`

---

### 2. HERO SECTION
**Full viewport, stone bg `#F3F2EF`**

**Layout (2-column on desktop):**
```
LEFT (60%)                              RIGHT (40%)
──────────────────────────────────────  ─────────────────────────
Overline pill: "AY 2025-26 · Free"      [Spline 3D scene]
                                         Floating receipt/phone
H1: "Your taxes,                         or abstract tax document
    done in 15 min."                     with particle effects
                                        
Sub: "Stop dreading ITR. Taxzy          [Floating glass card]
      asks the right questions,          "₹28,450 refund found"
      calculates your refund, and        LIVE ticker animation
      files it — in plain English."
      
[File my taxes — it's free]   [See how it works ↓]

Social proof row:
★★★★★  "82,000+ people filed"  "ITR-1 & ITR-2"
──────────────────────────────────────────────────
```

**Spline scene:** An abstract glowing document/form that unfolds or floats. Option: use their pre-made "phone" scene. Fallback: custom CSS 3D card stack if Spline load is slow.

**Hero animations (Framer Motion):**
- H1: stagger-in word by word, `y: 20 → 0`, opacity 0→1, 320ms each, 80ms stagger
- Subtext: fade up, 400ms delay
- CTA: fade up, 600ms delay
- Glass "refund card": float animation loop (y: 0→-8→0, 3s ease-in-out loop)

---

### 3. SOCIAL PROOF BAR
**Full-width, white surface, 1px border top/bottom**
```
[HDFC Bank logo]  [Razorpay]  [SBI]  [IT Dept. compatible]  [ClearTax integrated]
```
Marquee scroll, 40s loop, pauses on hover. Label: "Works with your existing accounts"

---

### 4. PROBLEM → SOLUTION SECTION
**Headline:** "Tax filing is broken. We fixed it."

**Split card layout (2 columns):**
```
┌─────────────────────────────┐   ┌─────────────────────────────┐
│ ❌  BEFORE TAXZY             │   │ ✅  WITH TAXZY               │
│                              │   │                              │
│  Dense government portal     │   │  Chat-style Q&A, plain       │
│  Jargon everywhere           │   │  English answers             │
│  CAs cost ₹2,000–10,000      │   │  Free forever for ITR-1/2    │
│  2–3 hours of confusion      │   │  Under 15 minutes            │
│  Still not sure if correct   │   │  AI validates everything      │
└─────────────────────────────┘   └─────────────────────────────┘
```
- Left card: `--bg-subtle` bg, muted red icon tint
- Right card: `--accent-subtle` bg, slate blue icon tint
- Animate in with stagger on scroll (Framer `whileInView`)

---

### 5. HOW IT WORKS
**3-step horizontal flow on desktop, vertical stack on mobile**

```
     ①                    ②                    ③
  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │  📋      │  ────▶  │  🤖      │  ────▶  │  ✅      │
  │ Connect  │         │  Chat    │         │  File    │
  │ your 26AS│         │  with AI │         │  & done  │
  │ or AIS   │         │          │         │          │
  └──────────┘         └──────────┘         └──────────┘
  "Link your form      "Answer simple       "One click to 
   26AS — we pull       questions in         submit to
   everything in."      plain English."      IT portal."
```

**Card spec:**
- 16px radius, white surface, `--shadow-sm`
- Step number: large background watermark `#3D5A80` at 8% opacity
- Connecting arrow: dashed SVG line, draws in on scroll (SVG `stroke-dashoffset` animation)
- `whileInView` stagger: each card slides up 24px, 320ms, 80ms stagger offset

---

### 6. FEATURE CARDS GRID
**Headline:** "Everything you need. Nothing you don't."

**3×2 grid (desktop), 1-col (mobile):**

| # | Icon | Title | Body |
|---|------|-------|------|
| 1 | `ti-message-chatbot` | AI that speaks your language | Ask "Will I get a refund?" and actually get an answer — not a PDF. |
| 2 | `ti-receipt-rupee` | Auto-fetch from 26AS & AIS | Link once. We pull your TDS, interest income, and capital gains automatically. |
| 3 | `ti-shield-check` | Validates before you file | Catches common mistakes — like missing HRA claims or wrong regime selection. |
| 4 | `ti-currency-rupee` | Free for most people | ITR-1 and ITR-2 are free, forever. Pay only if you have complex gains or business income. |
| 5 | `ti-clock` | Under 15 minutes | Not a marketing claim. Median time for salaried filers: 11 minutes. |
| 6 | `ti-lock` | Bank-grade encryption | AES-256 at rest, TLS in transit. We never store your Aadhaar or passwords. |

**Card spec:**
- White, 16px radius, `--shadow-sm`
- Icon: 40×40 `--accent-subtle` bg circle, slate-blue icon
- `whileHover`: `y: -4`, shadow deepen, 180ms ease-out
- Stagger in on scroll, 60ms offset between cards

---

### 7. LIVE DEMO / CHAT PREVIEW SECTION
**Full-width, `--bg-surface-2` background (`#FAF9F6`)**

**Headline:** "This is what filing feels like."

**Mockup: Glass card showing simulated chat**
```
┌─────────────────────────────────────────────────┐  glass card
│  Taxzy                               ● ● ●      │
│  ─────────────────────────────────────────────  │
│                                                  │
│  👋 Hey! Do you have a Form 16 from your         │
│     employer this year?                          │
│                                                  │
│  ┌───────────────────────────────────┐           │
│  │ Yes, I do          ✓              │  user btn │
│  └───────────────────────────────────┘           │
│                                                  │
│  Great — your employer paid ₹18,200 in           │
│  taxes for you. Let's see if you're owed         │
│  any of that back. 👀                            │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  ✨ Estimated refund: ₹28,450        [→]   │  │  
│  └────────────────────────────────────────────┘  │  accent card
└─────────────────────────────────────────────────┘
```
- Messages type in one by one on scroll-trigger (Framer Motion `useAnimate`)
- Refund amount counts up: 0 → ₹28,450 using `useMotionValue` + `useSpring`
- Refund card uses clay `#A86545` accent — the "delight" moment

---

### 8. PRICING SECTION
**Headline:** "Free for the other 70 million of you."

**3-column cards:**

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  FREE            │   │  PRO  ← popular │   │  CA ASSIST       │
│                  │   │  ─────────────  │   │                  │
│  ₹0              │   │  ₹499 / year    │   │  ₹1,999 / year   │
│                  │   │                  │   │                  │
│  • ITR-1 & ITR-2 │   │  • Everything   │   │  • Everything in │
│  • AI chat       │   │    in Free      │   │    Pro           │
│  • 26AS autofill │   │  • Capital gains│   │  • 30-min CA     │
│  • 1 filing/yr   │   │  • Business inc │   │    video call    │
│                  │   │  • Priority help│   │  • Sign-off      │
│  [Get started →] │   │  [Start free →] │   │  [Book now →]    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                         ↑ ring: 2px #3D5A80, shadow-lg
```

- Middle (Pro): `--accent` border ring, subtle blue bg tint, `--shadow-lg`
- All prices in `JetBrains Mono` with `font-feature-settings: "tnum"`
- Annual/monthly toggle: spring animation on pill indicator

---

### 9. TESTIMONIALS
**Headline:** "From first-time filers to freelancers."

**Horizontal scroll carousel (3 visible desktop, 1 mobile):**

| Quote | Name | Role |
|-------|------|------|
| "I was terrified of ITR. Taxzy made it feel like texting a friend." | Priya M. | Salaried, Bengaluru |
| "Got ₹31,000 back that my CA missed for 3 years." | Rohan K. | Freelance designer |
| "Finally understood what 80C actually means." | Ananya S. | First-time filer |
| "Filed in 9 minutes. My CA took 3 days." | Vikram T. | Software engineer |

**Card spec:** White, 16px radius, shadow-sm. Avatar: initials in `--accent-subtle` circle. Quote in italics, Manrope 400. Star row: `--st-clay-600` fill.

Drag-scroll on mobile. Auto-scroll pauses on hover.

---

### 10. FAQ
**Headline:** "The stuff everyone wonders."

**Accordion, 2-column on desktop:**

| Q | A |
|---|---|
| Is it really free? | Yes. ITR-1 and ITR-2 for salaried/freelance income — free, forever. |
| Is my data safe? | AES-256 at rest. We never store Aadhaar or login passwords. Read our security page. |
| What if I have capital gains? | Pro plan covers equity, MF, and property gains. |
| Can it replace my CA? | For most salaried people, yes. For complex businesses — we have CA Assist. |
| Which ITR forms do you support? | ITR-1, ITR-2, ITR-3 (Pro), ITR-4 (Pro). |
| What happens after I file? | You get an ITR-V email and we track acknowledgement for you. |

Expand/collapse: `height: 0 → auto` via Framer `AnimatePresence` + `motion.div` layout animation.

---

### 11. FINAL CTA SECTION
**Full-width, Slate Blue `#3D5A80` background (the ONE dark section)**

```
            "Filing opens April 1st.
             Start for free today."

         [File my taxes — it's free]
         "No credit card · No jargon · Under 15 min"
```

- White text on slate blue
- CTA button: white bg, slate blue text
- Subtle radial gradient halo behind text (same glow from design system)
- Framer Motion: hero-style stagger on scroll entry

---

### 12. FOOTER
```
[Taxzy logo]     Features  How it works  Pricing  Blog  Security

₹ India · AY 2025-26      Privacy · Terms · Grievance
```
- Stone bg, 1px border-top `--border-default`
- Text: `--text-tertiary`, links hover to `--text-primary`

---

## Animation Choreography Summary

| Element | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Nav | Glass blur fades in | page load | 320ms |
| H1 words | Stagger up | page load | 80ms/word |
| Hero glass card | Float loop | always | 3s loop |
| Spline scene | Lazy load + fade | page load | 400ms |
| Section headings | Fade + slide up 16px | scroll enter | 320ms |
| Feature cards | Stagger up, 60ms gap | scroll enter | 320ms |
| How-it-works arrows | SVG stroke draw | scroll enter | 600ms |
| Chat messages | Typewriter sequence | scroll enter | per message |
| Refund counter | Spring count-up | chat visible | 800ms spring |
| Pricing toggle | Spring pill slide | click | 200ms |
| Testimonial carousel | Drag + auto-scroll | — | — |
| FAQ accordion | Height layout anim | click | 200ms |
| Final CTA | Stagger up | scroll enter | 320ms |

---

## File Structure to Create

```
frontend/app/(marketing)/
├── page.tsx                  ← landing page root
└── _components/
    ├── Navbar.tsx
    ├── Hero.tsx              ← Spline embed here
    ├── SocialProof.tsx
    ├── ProblemSolution.tsx
    ├── HowItWorks.tsx
    ├── Features.tsx
    ├── ChatDemo.tsx          ← animated chat mockup
    ├── Pricing.tsx
    ├── Testimonials.tsx
    ├── FAQ.tsx
    ├── FinalCTA.tsx
    └── Footer.tsx
```

---

## Spline Setup

Install: `npm install @splinetool/react-spline`

Use a **pre-made Spline scene** from spline.design community (search "document", "fintech", "card float") or build one: a flat tax document/receipt that slowly rotates in 3D with a soft ambient light. Export → copy the scene URL → drop into `<Spline scene="https://prod.spline.design/..." />`.

Wrap in `Suspense` with a skeleton placeholder so it doesn't block the LCP.
