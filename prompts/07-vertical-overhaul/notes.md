# Notes — Vertical overhaul prompt

## Common LLM mistakes and how the contract layer catches them

### 1. Referencing non-existent shadcn components
**Mistake:** v0 invents imports for `Sidebar`, `DataTable`, `Stepper`, `Breadcrumb` — none of
which are installed in this project.

**Catch:** The build fails immediately with "Module not found". The prompt's installed-component
table prevents this by listing only what actually exists in `components/ui/`.

---

### 2. Leaving restaurant-vertical copy in place
**Mistake:** v0 updates `payerSingular` but misses `payerPossessive`, `funderLabel`,
`consoleHeading`, `consoleSubheading`, `payoutVerb`. The payer settings page still says "your
restaurant's bank account" and the dashboard still says "Let's settle the night."

**Catch:** The prompt lists all 14 `branding.ts` keys explicitly and says "leaving any key as
the old restaurant value is a bug."

---

### 3. Adding a `fetch('/api/...')` call for live stat tiles
**Mistake:** v0 sees the hardcoded `"0"` stat tiles and tries to make them dynamic by calling
`fetch('/api/transactions')` or `fetch('/api/payees')` directly from the overview page.

**Catch:** Hard Rule 1 forbids `fetch('/api/...')` from components. The prompt also explicitly
says "stat card values must remain static placeholders — do not add data fetching to this page."

---

### 4. Importing money as dollars into a new page
**Mistake:** v0 adds a new stat like "Average payout" and computes it in dollars (`amountCents / 100`)
inline instead of using `centsToDollars` and `formatMoney`.

**Catch:** Hard Rule 4 and the existing `useTransactions` hook return `amountCents` (integer).
`pnpm typecheck` will fail if the type is mishandled. The prompt points to the display-boundary
helpers explicitly.

---

### 5. Replacing DashboardHeader with a sidebar that breaks routing
**Mistake:** v0 interprets "modern navigation" as a full sidebar replacement that omits
`useLogout()`, `usePathname`, or the `NAV` array pattern, breaking sign-out and active tab
highlighting.

**Catch:** The prompt scopes DashboardHeader changes to "update tab nav labels" and explicitly
says to "keep the NAV array structure, `useLogout()`, and `usePathname` logic intact."

---

### 6. Skipping the `useSession()` guard on a new dashboard page
**Mistake:** v0 adds a new page without the session redirect, leaving an unauthenticated route.

**Catch:** Hard Rule 7 gives the exact boilerplate. `pnpm verify-contract` (if wired) also
catches this.

---

## Why UI Vibe is input-only (not implemented by the prompt)
The prompt accepts a "UI Vibe" field but does not give specific Tailwind classes for it — that
is intentional. The existing `globals.css` oklch palette and shadcn defaults already produce a
clean, professional look. If a team wants a dark mode or brand-specific palette, that is a
separate, scoped task (edit `globals.css` CSS variables only). Mixing palette changes into the
vertical overhaul prompt increases blast radius significantly.
