# Reference implementation — payee onboarding

- [`components/PayeeForm.tsx`](../../../components/PayeeForm.tsx) — the form.
- [`app/dashboard/payees/page.tsx`](../../../app/dashboard/payees/page.tsx) — the
  page that hosts it (with the toggle to show/hide and the existing payee list).
- [`lib/hooks/useCreatePayee.ts`](../../../lib/hooks/useCreatePayee.ts) — the hook.
- [`app/actions/payees.ts`](../../../app/actions/payees.ts) — the server action.
- [`lib/types/payee.ts`](../../../lib/types/payee.ts) — the schemas.
