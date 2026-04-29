# Prompt — Reskin to a new vertical + overhaul UI copy

Paste the block below into v0. Fill in Section 1 before running.

---

Role: You are an expert Frontend Engineer building on top of the Generic Root Payouts Template.

Read `AGENTS.md` and `LLM-SDK.md` before generating any code. All hard rules in those files
apply to every file you touch.

---

## 1. Business Definition (fill in before running)

- **Industry Vertical:** [e.g., Creator Economy / Healthcare / Logistics]
- **Payer (the operator who logs in):**
  - Singular: [e.g., Studio]   Plural: [e.g., Studios]   Possessive: [e.g., studio's]
- **Payee (the person being paid):**
  - Singular: [e.g., Freelancer]   Plural: [e.g., Freelancers]
- **Payout event:**
  - Verb: [e.g., Pay out]   Noun: [e.g., Project payout]   Noun plural: [e.g., Project payouts]
- **Funding source:** Label: [e.g., Studio bank account]   Short label: [e.g., Bank account]
- **Product name:** [e.g., StudioPay]
- **Tagline:** [e.g., Project earnings settled the moment you ship.]
- **Console heading:** [e.g., Welcome back. Your freelancers are ready to be paid.]
- **Console subheading:** [e.g., Manage your roster, run payouts, and audit every transaction.]
- **UI Vibe:** [e.g., Modern Fintech / Professional Healthcare / Minimalist Dark]

---

## 2. Hard Rules (from AGENTS.md — non-negotiable)

1. **NEVER** call `fetch('/api/...')` from a component. Use `lib/hooks/*` or `app/actions/*`.
2. **NEVER** import `@root-credit/root-sdk` or `@/lib/root-api` from a `'use client'` component.
3. **NEVER** rename `Payer`, `Payee`, `Payout`, `PaymentRail`, `PayoutStatus`, or `Transaction`
   in TypeScript. Reskin via `lib/branding.ts` ONLY.
4. **NEVER** represent money in dollars in server code or storage. Always integer cents (`Money`
   type). Use `dollarsToCents`, `centsToDollars`, `formatMoney` at the display boundary only.
5. **NEVER** hardcode payment rail strings (e.g. `'instant_bank'`). Use the `PaymentRail` const
   enum from `lib/types/payments`.
6. **NEVER** modify `lib/types/*`, `lib/hooks/*`, `app/actions/*`, `app/api/*`, or `lib/redis*.ts`.
7. **ALWAYS** start new dashboard client pages with `useSession()` and redirect to `/login` if
   `session === undefined`. Pattern:
   ```tsx
   const { session } = useSession();
   useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);
   if (!session) return null;
   ```

---

## 3. Step 1 — Brand Injection (required)

Edit **only** `lib/branding.ts`. Replace every value with the Business Definition above.
All 14 keys must be updated — leaving any key as the old restaurant value is a bug.

```ts
export const branding = {
  productName:       "<Product Name>",
  tagline:           "<Tagline>",
  payerSingular:     "<Payer singular>",
  payerPlural:       "<Payer plural>",
  payerPossessive:   "<Payer possessive>",      // e.g. "studio's"
  payeeSingular:     "<Payee singular>",
  payeePlural:       "<Payee plural>",
  payoutVerb:        "<Payout verb>",            // e.g. "Pay out"
  payoutNoun:        "<Payout noun>",            // e.g. "Project payout"
  payoutNounPlural:  "<Payout noun plural>",     // e.g. "Project payouts"
  funderLabel:       "<Funding source label>",   // e.g. "Studio bank account"
  funderShortLabel:  "<Short label>",            // e.g. "Bank account"
  consoleHeading:    "<Console heading>",
  consoleSubheading: "<Console subheading>",
} as const;
```

Do NOT touch any other file for branding. Every page and component already reads from `branding.*`.

---

## 4. Step 2 — Copy & Layout Overhaul (optional, encouraged)

Files in `app/` and `components/` are v0 territory. You may rewrite their layouts and copy to
match the vertical and UI vibe. Use **only** the shadcn/ui components already installed in this
project — do **not** install new packages or add new shadcn components.

**Installed components** (import from `@/components/ui/<name>`):

| Component | Export names |
|---|---|
| Button | `Button` |
| Card | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Input | `Input` |
| Label | `Label` |
| Separator | `Separator` |
| Table | `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell` |
| Badge | `Badge` — variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning` |
| Dialog | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`, `DialogDescription`, `DialogClose` |
| Toast | import `{ toast }` from `sonner` — call `toast.success()` / `toast.error()` |

### Pages you may rewrite

#### `app/page.tsx` — public landing
- Rewrite hero headline, tagline, and feature bullets using `branding.*`
- Keep the two-column layout and CTA links to `/login` and `/signup`
- No data fetching on this page

#### `app/login/page.tsx` and `app/signup/page.tsx`
- Rewrite headlines, subheadlines, and placeholder text to match the vertical
- Keep `<LoginForm>` and `<SignupForm>` unchanged — do NOT rewrite their internals

#### `components/DashboardHeader.tsx`
- You may update tab nav labels to match the vertical's terminology
- Keep the `NAV` array structure, `useLogout()`, and `usePathname` logic intact
- Logo monogram pattern: `branding.productName.charAt(0)` — keep this, do not hardcode

#### `app/dashboard/page.tsx` — overview
- Update stat card labels and module tile descriptions using `branding.*`
- Stat card values must remain static placeholders (`"0"`, `"$0.00"`) — do **not** add
  data fetching to this page

#### `app/dashboard/payees/page.tsx`
- Update header copy using `branding.payeeSingular` / `branding.payeePlural`
- Rail badge convention: `variant="secondary"` for bank account, `variant="success"` for card

#### `app/dashboard/payouts/page.tsx`
- Update InfoCard copy (How it works / Quick tips) using `branding.*`

#### `app/dashboard/transactions/page.tsx`
- Update page header copy using `branding.*`
- Status badge convention: `success` for completed/success · `warning` for pending · `destructive` for failed

#### `app/dashboard/payer/page.tsx`
- Update "Why link your bank?" bullet list copy using `branding.*`
- Keep `<BankAccountForm>` intact — do not touch its internals

### Adding a new dashboard page (only if the vertical genuinely needs one)

Follow the recipe from `AGENTS.md` exactly:
1. Create `app/dashboard/<feature>/page.tsx` marked `'use client'`
2. Open with the `useSession()` + redirect pattern from Rule 7 above
3. Fetch data exclusively via hooks from `lib/hooks/*` (import from `@/lib/hooks`)
4. Add a nav entry to the `NAV` array in `components/DashboardHeader.tsx`
5. Do **not** add new API routes, server actions, Redis keys, or npm packages

---

## 5. Verification

After all changes:

1. Run `pnpm typecheck` — must pass with **zero errors**
2. Run `pnpm dev` and navigate every route:
   `/` · `/login` · `/signup` · `/dashboard` · `/dashboard/payees` ·
   `/dashboard/payouts` · `/dashboard/transactions` · `/dashboard/payer`
3. Confirm every user-visible noun reflects the new vertical — no "restaurant", "Worker",
   "Roosterwise", or "Tip" copy should remain

---

## 6. Output

Provide:
1. The complete updated `lib/branding.ts`
2. A list of every other file modified, with the type of change:
   `copy-only` / `layout` / `new page`
3. Explicit confirmation that `lib/types/*`, `lib/hooks/*`, `app/actions/*`, `app/api/*`
   were **not** modified
4. `pnpm typecheck` output (zero errors expected)
