# VELYRA DESIGN SYSTEM SPECIFICATION (MASTER.md)
*Version: 1.0.0 — Production-Ready D2C Luxury Beauty*

---

## 1. Brand Essence & Positioning
- **Name**: VELYRA
- **Positioning**: Elevated Indian D2C Skincare. Formulated specifically for Indian climates (high UV indices, tropical humidity, urban pollution) without the heavy, suffocating white casts of legacy sunscreens.
- **Tone & Mood**: Tactile, editorial, minimal, restrained, confident, dermatologically credible, calm luxury (in the realm of Aesop, Byredo, Rhode, and modern Ayurvedic botanical minimalism).
- **Strict Anti-AI Rules**:
  - NO purple/blue neon gradients.
  - NO generic 3-column feature cards with floating icons.
  - NO robotic placeholder copy ("Transform your skin forever").
  - NO bloated card borders or artificial glassmorphism.
  - Every layout follows editorial grid pacing with deliberate white/sand space and distinct typography scale.

---

## 2. Color System
| Token Name | Hex Code | HSL / RGB | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--surface-base` | `#FAF8F5` | `hsl(36, 33%, 97%)` | Primary page canvas (Warm Alabaster) |
| `--surface-elevated`| `#FFFFFF` | `hsl(0, 0%, 100%)` | Modals, cards, drawers, popovers |
| `--surface-muted` | `#F2ECE4` | `hsl(35, 29%, 92%)` | Section alternates, tag backgrounds |
| `--surface-dark` | `#171614` | `hsl(40, 7%, 9%)` | Dark editorial statements, footer |
| `--color-charcoal` | `#1A1918` | `hsl(40, 5%, 10%)` | Primary headings, buttons, deep contrast |
| `--color-mineral` | `#6D675E` | `hsl(38, 7%, 40%)` | Secondary body text, captions, labels |
| `--color-amber` | `#C9944D` | `hsl(35, 53%, 55%)` | Subtle gold accent, badges, ratings |
| `--color-olive` | `#485246` | `hsl(110, 8%, 30%)` | Botanical accents, natural formulation tags |
| `--color-sand` | `#E8DFD3` | `hsl(34, 30%, 87%)` | Subtle dividers, border lines |
| `--border-subtle` | `rgba(26,25,24,0.08)` | — | Hairline editorial borders |

---

## 3. Typography Scale
- **Display Serif**: *Playfair Display* / *Cormorant Garamond* (Editorial flair, high-fashion impact)
- **Body Sans**: *Plus Jakarta Sans* / *Inter* (Crisp geometric clarity, perfect legibility at micro sizes)

| Role | Font Family | Size | Weight | Tracking | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Serif | 48px - 72px | 400 (Regular) | -0.02em | 1.05 |
| **H1 (Editorial)** | Serif | 36px - 48px | 400 (Regular) | -0.01em | 1.15 |
| **H2 (Section)** | Serif | 28px - 36px | 400 / 500 | -0.01em | 1.2 |
| **H3 (Subheading)**| Sans | 20px - 24px | 500 (Medium) | 0.00em | 1.3 |
| **Body Large** | Sans | 16px - 18px | 400 (Regular) | 0.01em | 1.6 |
| **Body Regular** | Sans | 14px - 15px | 400 (Regular) | 0.01em | 1.5 |
| **Micro/Caps** | Sans | 11px - 12px | 600 (SemiBold) | 0.12em (Wide) | 1.2 |

---

## 4. Spacing & Grid System
- 8-point base spacing rhythm (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`, `128px`).
- Generous editorial gutters: 24px on mobile, 48px on tablet, 80px on desktop.
- Asymmetrical photo-text balance with alternating cadence between full-bleed imagery and quiet typography sections.

---

## 5. Micro-Interactions & Motion Rules
- **Duration**: 200ms - 400ms for UI actions, 600ms - 800ms for editorial page reveals.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (luxury deceleration curve).
- **States**:
  - Buttons: Subtle scale + background opacity shift, tactile feedback.
  - Product Cards: Smooth cross-fade to secondary editorial texture image on hover.
  - Cart Drawer: Slide from right with 300ms ease and backdrop blur.
  - Sticky PDP Purchase Bar: Slide up smoothly only when original Add-to-Cart is out of viewport on mobile.
