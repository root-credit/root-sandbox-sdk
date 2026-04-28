# Notes — reskinning the vertical

## Common mistakes

1. **Renaming code symbols.** The temptation is to rename `Merchant` → `Studio`
   in TypeScript. Don't. The whole point of `lib/branding.ts` is that you don't.
2. **Changing Redis keys.** `merchant:*` and `payee:*` stay as-is. Renaming them
   would orphan all existing data and break `redis-admin.ts`.
3. **Swapping product name in `package.json`.** Optional and isolated; it does
   not affect the running app. If you do, keep `name` as the npm package name
   (kebab-case) — it's not user-facing.
4. **Forgetting marketing prose.** The hero headline on `app/page.tsx` still
   talks about "tips" by default. After updating `branding`, scan the landing
   page for any literal that hasn't been replaced.

## How the contract prevents drift

- `.cursor/rules/branding.mdc` is auto-applied to every UI file and tells the
  agent to read from `branding.*`.
- `pnpm verify-contract` does not check copy, but `pnpm typecheck` will catch
  any accidental rename of an exported `branding.*` key.
