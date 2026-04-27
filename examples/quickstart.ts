/**
 * Quickstart example — runnable with `pnpm tsx examples/quickstart.ts`
 * after `pnpm build` and with ROOT_API_KEY set in your environment.
 *
 * Demonstrates the three main usage patterns the SDK is optimized for:
 *   1. One-shot payout via `flows.payTo`
 *   2. One-shot payin via `flows.chargeFrom`
 *   3. Manual resource calls + polling via `root.payouts.waitForTerminal`
 */

import { Root, RootApiError, statusLabel } from '../src/index.js'

async function main() {
  const root = new Root({
    onRequest: ({ method, path, status, durationMs }) => {
      // eslint-disable-next-line no-console
      console.log(`  ${method} ${path} → ${status} (${durationMs}ms)`)
    },
  })

  // 1) One-shot money-out
  console.log('\n→ flows.payTo (instant_bank, $42.00)')
  const payTo = await root.flows.payTo({
    payee: { name: 'Quinn Ramirez', email: `quinn+${Date.now()}@example.com` },
    amount_in_cents: 4200,
    rail: 'instant_bank',
    onStatus: (status) => console.log(`    status: ${statusLabel(status)} (${status})`),
  })
  console.log(
    `  payout ${payTo.payout.id}: ${statusLabel(payTo.finalPayout.status)} (${payTo.finalPayout.status})`,
  )

  // 2) One-shot money-in
  console.log('\n→ flows.chargeFrom (standard_ach, $99.90)')
  const charge = await root.flows.chargeFrom({
    payer: { name: 'Acme Buyer', email: `ap+${Date.now()}@acme.example` },
    amount_in_cents: 9990,
    rail: 'standard_ach',
    onStatus: (status) => console.log(`    status: ${statusLabel(status)} (${status})`),
  })
  console.log(
    `  payin ${charge.payin.id}: ${statusLabel(charge.finalPayin.status)} (${charge.finalPayin.status})`,
  )

  // 3) Manual flow with explicit poller
  console.log('\n→ Manual: subaccount → payee → bank PM → payout → waitForTerminal')
  const subaccount = await root.subaccounts.getOrCreateDefault({ name: 'SDK Quickstart' })
  const payee = await root.payees.create({
    name: 'Morgan Liu',
    email: `morgan+${Date.now()}@example.com`,
  })
  await root.payees.attachPayToBank(payee.id)
  const payout = await root.payouts.create({
    payee_id: payee.id,
    amount_in_cents: 1234,
    rail: 'same_day_ach',
    subaccount_id: subaccount.id,
  })
  const final = await root.payouts.waitForTerminal(payout.id, {
    rail: 'same_day_ach',
    onUpdate: (snap) => console.log(`    polled: ${snap.status}`),
  })
  console.log(`  payout ${final.id}: ${statusLabel(final.status)} (${final.status})`)
}

main().catch((err) => {
  if (err instanceof RootApiError) {
    console.error(`RootApiError ${err.status}: ${err.message}`)
    console.error('  body:', err.body)
  } else {
    console.error(err)
  }
  process.exit(1)
})
