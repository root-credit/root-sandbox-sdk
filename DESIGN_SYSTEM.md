# Workforce Connect: Visual Reference & Design System

## Color Palette Reference

### Primary Colors
```
Deep Navy (Primary Brand)
  HEX: #0F172A
  RGB: 15, 23, 42
  Usage: Header backgrounds, primary buttons, main text
  
Teal Accent (Interactive)
  HEX: #0891B2
  RGB: 8, 145, 178
  Usage: Borders, accent elements, links
  
Bright Cyan (Highlights)
  HEX: #06B6D4
  RGB: 6, 182, 212
  Usage: Call-to-action buttons, hero highlights, key metrics
```

### Neutral Scale (Slate Grays)
```
Background:     #F8FAFB (Light blue-white)
Surface:        #FFFFFF (Pure white)
Surface-2:      #F0F4F8 (Subtle secondary)
Text Primary:   #0F172A (Same as navy)
Text Secondary: #475569 (Medium gray)
Border:         #CBD5E1 (Light gray)
```

### Component Colors
```
Success:  #15803D (Deep green)
Error:    #B91C1C (Red)
Warning:  #B45309 (Amber)
Info:     #0369A1 (Blue)
```

---

## Typography System

### Font Stack
- **Display Font**: Fraunces (serif) – Headlines, hero text, module codes
- **Body Font**: Geist Sans – Body text, form inputs, UI labels
- **Mono Font**: Geist Mono – Code, amounts, technical text

### Type Scale
```
Hero H1:      2.75rem (44px) → 7rem (112px) on desktop
Section H2:   3rem (48px) → 5rem (80px) on desktop
Card H3:      1.25rem (20px)
Body:         1rem (16px)
Small:        0.875rem (14px)
Eyebrow:      0.7rem (11px), uppercase, 0.18em letter-spacing
```

### Text Classes
```
.font-display     – Fraunces serif, "ss01" and "salt" OpenType features
.font-mono-tab    – Geist Mono with tabular numbers ("tnum") for alignment
.tracking-tightest – -0.04em letter-spacing for display headlines
.text-eyebrow     – Uppercase section labels with elevated styling
.text-balance     – Optimal line breaking for headings
.text-pretty      – Readable line breaks in body copy
```

---

## Shadow & Elevation System

```
Shadow SM:  0 1px 2px rgba(15, 23, 42, 0.04)
            Used for: Subtle depth, section dividers

Shadow MD:  0 1px 2px rgba(15, 23, 42, 0.04) + 
            0 8px 24px -12px rgba(15, 23, 42, 0.12)
            Used for: Card hover states, elevated UI

Shadow LG:  0 1px 2px rgba(15, 23, 42, 0.04) +
            0 14px 32px -10px rgba(15, 23, 42, 0.18)
            Used for: Hero sections, prominent cards, modals
```

---

## Component Design Patterns

### Module Receipt Cards
```
┌─────────────────────────────────────┐
│ CODE           LABEL                │ (gold-rule divider below)
├─────────────────────────────────────┤
│ Module Title                        │
│                                     │
│ • Feature 1                         │ (bullet: accent color dot)
│ • Feature 2                         │
│ • Feature 3                         │
│ • Feature 4                         │
│                                     │
│ ⚪ Status · Live                    │ (accent dot + status)
└─────────────────────────────────────┘

Colors:
- Border: --color-neutral-200
- Background: --color-surface (white)
- Hover: -translate-y-0.5 shadow-lg-custom
- Feature bullets: --color-cyan-500
- Status indicator: --color-cyan-600
```

### Stat Tiles
```
┌──────────────────────┐
│ Active Employees     │ (text-eyebrow gray)
│ 2,847                │ (font-display large, text-ink or accent)
└──────────────────────┘

Accent variant includes teal glow: radial-gradient at -right-6 -bottom-6
Colors:
- Label: --color-neutral-500
- Value (primary): --color-ink
- Value (accent): --color-cyan-600
- Glow: rgba(6, 182, 212, 0.15)
```

### Navigation Patterns
```
Top Header:
├─ Monogram + Product Name (font-display)
├─ Navigation Links (hidden on mobile)
└─ Auth CTAs (Sign in, Get started)

Active Link Indicator: bottom border with --color-cyan-400
Hover State: --color-ink text with subtle bg shift
```

---

## Spacing & Layout

### Vertical Rhythm
```
--space-section:  clamp(2rem, 4vw, 3.5rem)    (32px → 56px)
--space-stack:    1.25rem                      (20px)

Section padding:  py-24 lg:py-28              (96px, 112px)
Grid gap:         gap-8 lg:gap-12             (32px, 48px)
```

### Responsive Breakpoints
```
Mobile:           0px (default)
SM (Small):       640px
MD (Medium):      768px
LG (Large):       1024px
XL (Extra large): 1280px
2XL:              1536px

Example: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## Interactive States

### Buttons
```
Primary Button (Dark Navy)
- Default:  bg-ink text-white
- Hover:    bg-ink-soft (softer navy)
- Active:   shadow-lg-custom
- Focus:    outline-2 outline-offset-2 outline-ring

Secondary Button (Outline)
- Default:  border-neutral-300 text-foreground
- Hover:    border-ink bg-neutral-50
- Focus:    outline with accent color

Accent Button (Cyan/Teal)
- Default:  bg-cyan-500 text-ink
- Hover:    bg-cyan-400
- Focus:    shadow with cyan glow
```

### Link Hover Effects
```
Navigation Links:     text-neutral-500 → text-ink + border-neutral-300
Call-to-action Links: translate-y-1 for lift effect
Primary CTAs:         -translate-y-0.5 shadow-lg-custom (card lift)

Transition utility: transition-smooth (0.25s cubic-bezier(0.4, 0, 0.2, 1))
```

---

## Decorative Elements

### Gold-Rule Divider (Now Teal)
```css
.gold-rule {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-gold-bright) 30%,     /* #06B6D4 bright cyan */
    var(--color-gold-bright) 70%,
    transparent 100%
  );
}
```
Usage: Between section headers and content, beneath module codes

### Gradient Backgrounds
```
Hero Section:
  radial-gradient(ellipse at 80% -10%, rgba(6,182,212,0.15), transparent 55%)
  radial-gradient(ellipse at 0% 110%, rgba(8,145,178,0.12), transparent 60%)
  base: #0F172A
  
Operations Card Glow:
  radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.20), transparent 60%)
```

### Grid Pattern (Subtle)
```css
background-image: 
  linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
background-size: 64px 64px;
opacity: 0.05;
```

---

## Brand Application Checklist

✅ **Branding File** (`lib/branding.ts`)
- productName: "Workforce Connect"
- payerSingular: "Organization"
- payeeSingular: "Employee"
- payoutNoun: "Earnings Disbursement"
- consoleHeading: "Empowering every employee, in any moment."

✅ **Color Tokens** (CSS Variables)
- --color-ink: #0F172A (navy)
- --color-gold-bright: #06B6D4 (cyan teal)
- Neutral scale: Slate grays #F8FAFC → #0F172A

✅ **Components Updated**
- Landing page: Workforce narrative + teal accents
- Login page: Enterprise messaging
- Dashboard: Operations focus
- Module cards: Updated with HCM features

✅ **Typography Applied**
- Display headlines: Fraunces serif
- Body text: Geist Sans
- Monospace: Geist Mono

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: Latest 2 versions

### CSS Features Used
- CSS Variables (custom properties)
- CSS Grid
- Flexbox
- Gradients (radial & linear)
- Transitions (cubic-bezier easing)
- @supports for fallbacks (where needed)

---

## Accessibility Considerations

### Color Contrast
- Text on navy: Minimum 7:1 WCAG AAA
- Text on white: Minimum 7:1 WCAG AAA
- Interactive elements: Enhanced focus states with 2px outline

### Focus Indicators
```css
.ring-focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
/* Applies to buttons, links, form inputs */
```

### Semantic HTML
- Proper heading hierarchy (H1 → H2 → H3)
- Navigation landmarks
- Form labels connected to inputs
- ARIA attributes where needed

### Motion
- `prefers-reduced-motion` respected
- Transitions are short (0.25s default)
- No auto-playing animations
