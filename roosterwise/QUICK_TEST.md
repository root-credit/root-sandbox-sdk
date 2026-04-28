# Quick Reference: Testing Roosterwise

## Application URLs (After Deployment)

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `https://your-app.vercel.app/` | Overview & features |
| Sign Up | `https://your-app.vercel.app/signup` | Create restaurant account |
| Login | `https://your-app.vercel.app/login` | Sign in |
| Dashboard | `https://your-app.vercel.app/dashboard` | Main admin panel |
| Workers | `https://your-app.vercel.app/dashboard/workers` | Manage workers |
| Payouts | `https://your-app.vercel.app/dashboard/payouts` | Daily tips & execute |
| Settings | `https://your-app.vercel.app/dashboard/restaurant` | Link bank account |
| History | `https://your-app.vercel.app/dashboard/transactions` | View payouts |

## Test Credentials (Root Sandbox)

### Bank Account (for restaurant & workers)
```
Account Number: 121000248
Routing Number: 021000021
Status: Always works in sandbox
```

### Debit Card (for workers)
```
Card Number: 4111111111111111
Expiry: 12/25 (or any future date)
CVV: 123 (or any 3 digits)
Status: Always works in sandbox
```

## Test Flow (5 Minutes)

1. **Signup** (1 min)
   - Visit `/signup`
   - Email: anything@example.com
   - Password: TestPassword123!
   - Restaurant: "My Test Restaurant"
   - Phone: 555-123-4567

2. **Link Bank Account** (1 min)
   - Visit `/dashboard/restaurant`
   - Account: 121000248
   - Routing: 021000021
   - Click "Link Bank Account"

3. **Add Workers** (1.5 min)
   - Visit `/dashboard/workers`
   - Add Worker 1:
     - Name: John Smith
     - Email: john@test.com
     - Phone: 555-456-7890
     - Method: Debit Card
     - Card: 4111111111111111
     - Expiry: 12/25
   - Add Worker 2:
     - Name: Jane Doe
     - Email: jane@test.com
     - Phone: 555-456-7891
     - Method: Bank Account
     - Account: 121000248
     - Routing: 021000021

4. **Execute Payouts** (0.5 min)
   - Visit `/dashboard/payouts`
   - John: $15.50
   - Jane: $22.75
   - Click "Execute Tip Payouts"

5. **Verify** (1 min)
   - Visit `/dashboard/transactions`
   - Should see 2 transactions
   - Status: "completed" or "processing"
   - Root transaction IDs visible

**Expected Outcome**: ✅ Both workers receive tips in 5 seconds via Root Sandbox

## Automated Testing

After deployment, run the automated E2E test:

```bash
# Clone the repo
git clone https://github.com/root-credit/root-sandbox-sdk.git
cd root-sandbox-sdk/roosterwise

# Run E2E test
node e2e-test.js --baseUrl https://your-app.vercel.app
```

Output should show:
```
✓ Signup successful
✓ Bank account linked
✓ Worker 1 added (Debit Card)
✓ Worker 2 added (Bank Account)
✓ Payouts executed successfully
✓ Retrieved 2 transactions
✓ END-TO-END TEST COMPLETED SUCCESSFULLY
```

## What Gets Created in Root

When you run through the flow, Root sandbox will have:

```
Payers (Restaurants)
└─ 1 payer created during signup
   └─ Bank account attached (ACH)

Payees (Workers)
└─ 2 payees created (1 per worker)
   ├─ Payee 1: Debit card attached
   └─ Payee 2: Bank account attached

Payouts
└─ 2 payouts created
   ├─ Payout 1: $15.50 to debit card (instant_card rail)
   └─ Payout 2: $22.75 to bank account (instant_card rail)
```

View these in: Root Dashboard → Sandbox → Payers/Payees/Payouts

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" on any page | Log out and log back in (session expired) |
| Bank linking fails | Verify account 121000248 and routing 021000021 |
| Worker creation fails | Check email format is valid |
| Payout fails | Ensure restaurant has bank linked & workers have payment methods |
| Redis error | Check UPSTASH_REDIS_REST_URL and token in Vercel settings |
| Root API error | Verify ROOT_API_KEY and ROOT_BASE_URL in Vercel settings |

## Expected Performance

- **Signup**: < 1 second
- **Bank linking**: < 1 second
- **Worker creation**: < 500ms per worker
- **Payout execution**: < 2 seconds (calls Root API)
- **Tip appearance**: < 5 seconds in Root (instant_card rail)

---

**Status**: ✅ Ready to test
**Environment**: Sandbox (test data, no real transactions)
**Risk Level**: 🟢 None (all test data)
