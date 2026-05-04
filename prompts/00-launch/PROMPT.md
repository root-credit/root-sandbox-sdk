# Prompt 00 — Launch a new vertical from scratch

Paste this entire block into any LLM (Claude, GPT-4o, Cursor, Windsurf, Copilot) with this
repo as project context. **Fill in the Business Definition section before pasting.**

---

## Your role

You are a Frontend Engineer building a new payments vertical on top of the Generic Root Payouts
Template. This template already has all payments logic wired up: payer signup/login, payee
onboarding, payout processing, transaction history, and bank-linking. Your job is to:

1. Inject the business identity into `lib/branding.ts`
2. Rewrite UI copy and layout in `app/` and `components/` to match the vertical
3. Leave the payments contract layer (`lib/hooks/`, `app/actions/`, `lib/types/`) completely untouched

Read `AGENTS.md` and `LLM-SDK.md` in full before writing any code.

---

## Business Definition (fill this in before pasting)

- **Industry Vertical:** [e.g., Creator Economy / Healthcare Staffing / Logistics / Payroll]
- **Payer** (the operator who logs in and funds payouts):
  - Singular: [e.g., Agency]   Plural: [e.g., Agencies]   Possessive: [e.g., agency's]
- **Payee** (the person or entity being paid):
  - Singular: [e.g., Contractor]   Plural: [e.g., Contractors]
- **Payout event:**
  - Verb: [e.g., Pay]   Noun: [e.g., Contractor payment]   Noun plural: [e.g., Contractor payments]
- **Funding source:** Label: [e.g., Agency bank account]   Short label: [e.g., Bank account]
- **Product name:** [e.g., AgencyPay]
- **Tagline:** [e.g., Contractor payments settled the moment the project ships.]
- **Console heading:** [e.g., Welcome back. Your contractors are ready to be paid.]
- **Console subheading:** [e.g., Manage your roster, run payments, and audit every transfer.]

---

## Hard Rules (non-negotiable — from AGENTS.md)

1. NEVER call `fetch('/api/...')` from a component. Use `lib/hooks/*` or `app/actions/*`.
2. NEVER import `@root-credit/root-sdk` or `@/lib/root-api` from a `'use client'` file.
3. NEVER rename `Payer`, `Payee`, `Payout`, `PaymentRail`, `PayoutStatus`, `Transaction`
   in TypeScript. Reskin via `lib/branding.ts` ONLY.
4. NEVER represent money in dollars in server code or storage. Always use integer cents
   (`Money` type). Use `dollarsToCents`, `centsToDollars`, `formatMoney` at display only.
5. NEVER hardcode payment rail strings. Use `PaymentRail` const enum from `lib/types/payments`.
6. NEVER modify `lib/types/*`, `lib/hooks/*`, `app/actions/*`, `app/api/*`, or `lib/redis*.ts`.
7. ALWAYS start new dashboard client pages with `useSession()` and redirect to `/login`
   if `session === undefined`.

---

## What's already built (do NOT rewrite these)

### Hooks (`lib/hooks/*` — import from `@/lib/hooks`)

| Hook | What it gives you |
|---|---|
| `useSession()` | `{ session, isLoading, error }` — current payer id + email |
| `usePayer()` | `{ payer, isLoading, error, refresh }` — payer record |
| `useLinkBank()` | `{ linkBank, isSubmitting, error }` — bank-linking mutation |
| `usePayees(payerId)` | `{ payees, isLoading, error, refresh, setPayees }` — payee list |
| `useCreatePayee()` | `{ createPayee, isSubmitting, error }` — add payee mutation |
| `useRemovePayee()` | `{ removePayee, isSubmitting, error }` — remove payee mutation |
| `useTransactions(payerId)` | `{ transactions, isLoading, error, refresh }` — ledger entries |
| `useProcessPayout()` | `{ processPayout, isProcessing, error, lastResult }` — batch payout |
| `useLogin()` | `{ login, isSubmitting, error }` |
| `useSignup()` | `{ signup, isSubmitting, error }` |
| `useLogout()` | `{ logout, isSubmitting }` |

### Server actions (`app/actions/*`)

`signIn`, `signUp`, `signOut` · `getCurrentPayer`, `linkPayerBank`
`listPayees`, `createPayee`, `removePayee` · `processPayout` · `listTransactions`

### Domain types (`lib/types/*` — import from `@/lib/types`)

`Payer`, `Payee`, `Transaction`, `ProcessPayoutInput`, `ProcessPayoutResult`,
`PaymentRail` (const enum: `instant_bank` / `instant_card` / `same_day_ach` / `standard_ach` / `wire`),
`PayoutStatus` (const enum: `pending` / `completed` / `success` / `failed`),
`Money` (always integer cents), `dollarsToCents`, `centsToDollars`, `formatMoney`

### Installed shadcn/ui components (import from `@/components/ui/<name>`)

`Button` (variants: default destructive outline secondary ghost link)
`Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`
`Input`, `Label`, `Separator`
`Table` / `TableHeader` / `TableBody` / `TableHead` / `TableRow` / `TableCell`
`Badge` (variants: default secondary destructive outline success warning)
`Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogTrigger` / `DialogDescription`
`toast` — `import { toast } from 'sonner'` → `toast.success()` / `toast.error()`

Do NOT install new packages or add new shadcn components.

---

## Step 1 — Brand injection (required, do first)

Edit ONLY `lib/branding.ts`. Replace all 14 values using the Business Definition above:

```ts
export const branding = {
  productName:       "AgencyPay",
  tagline:           "Contractor payments settled the moment the project ships.",
  payerSingular:     "Agency",
  payerPlural:       "Agencies",
  payerPossessive:   "agency's",
  payeeSingular:     "Contractor",
  payeePlural:       "Contractors",
  payoutVerb:        "Pay",
  payoutNoun:        "Contractor payment",
  payoutNounPlural:  "Contractor payments",
  funderLabel:       "Agency bank account",
  funderShortLabel:  "Bank account",
  consoleHeading:    "Welcome back. Your contractors are ready to be paid.",
  consoleSubheading: "Manage your roster, run payments, and audit every transfer.",
} as const;
```

Do NOT touch any other file for branding. All pages already read from `branding.*`.

---

## Step 2 — UI overhaul (these files are yours to rewrite)

All copy must use `branding.*` — never hardcode vertical nouns.

### `app/page.tsx` — public landing
- Rewrite hero headline and tagline using `branding.productName`, `branding.tagline`
- Rewrite feature bullets and How-it-works copy for the vertical
- Keep the two-column layout and CTA links (`/login`, `/signup`)
- No data fetching here

### `app/login/page.tsx` and `app/signup/page.tsx`
- Rewrite headlines and subheadings to match the vertical
- Keep `<LoginForm>` and `<SignupForm>` intact — do NOT rewrite their internals

### `components/DashboardHeader.tsx`
- Update nav tab labels if the vertical uses different names
- Keep the `NAV` array structure, `useLogout()`, and `usePathname` routing logic
- Logo monogram: `branding.productName.charAt(0)` — keep this pattern

### `app/dashboard/page.tsx` — overview
- Update stat card labels and module tile descriptions using `branding.*`
- Stat card values stay as static placeholders (`"0"`, `"$0.00"`) — do NOT add data fetching

### `app/dashboard/payees/page.tsx`
- Update header copy with `branding.payeeSingular` / `branding.payeePlural`
- Rail badge variants: `secondary` for bank account, `success` for debit card

### `app/dashboard/payouts/page.tsx`
- Update InfoCard copy (How it works / Quick tips) using `branding.*`

### `app/dashboard/transactions/page.tsx`
- Update page header using `branding.*`
- Status badge variants: `success` for completed/success, `warning` for pending, `destructive` for failed

### `app/dashboard/payer/page.tsx`
- Update "Why link your bank?" bullets using `branding.*`
- Keep `<BankAccountForm>` intact — do NOT rewrite its internals

---

## Step 3 — Adding a new dashboard page (optional)

Only add a page if your vertical genuinely needs functionality beyond what exists.

```tsx
'use client';
import { useSession } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyFeaturePage() {
  const { session } = useSession();
  const router = useRouter();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);
  if (!session) return null;

  // Use only existing hooks from @/lib/hooks
  // Never call fetch('/api/...')
}
```

Add a nav entry to the `NAV` array in `components/DashboardHeader.tsx`.
Do NOT add new API routes, server actions, or Redis keys.

---

## Verification

1. `pnpm typecheck` — must pass with zero errors
2. `pnpm dev` — click through every route:
   `/` → `/login` → `/signup` → `/dashboard` → `/dashboard/payees`
   → `/dashboard/payouts` → `/dashboard/transactions` → `/dashboard/payer`
3. Every user-visible noun reflects the new vertical — no "restaurant", "worker", or "tip"
4. `lib/types/*`, `lib/hooks/*`, `app/actions/*`, `app/api/*` were NOT modified

---

## Output expected

1. Complete updated `lib/branding.ts`
2. List of every other file modified (change type: copy-only / layout / new page)
3. Explicit confirmation that contract and core layers were not modified
4. `pnpm typecheck` result (zero errors)
