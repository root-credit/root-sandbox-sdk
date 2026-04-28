# Complete End-to-End Test Walkthrough

This document walks you through testing the entire Roosterwise payment flow from start to finish.

## Test Scenario

**Restaurant**: "Joe's Diner"
**Workers**: John (Debit Card) + Jane (Bank Account)
**Tips**: $15.50 + $22.75 = $38.25 total

---

## Step 1: Landing Page

**URL**: `https://your-app.vercel.app/`

What you'll see:
- Hero section: "5-Second Tip Payouts"
- Features: Instant Payouts, Security, One-Click Payouts
- Buttons: "Get Started Free" and "Login"

**Action**: Click "Get Started Free" or "Sign Up" button

---

## Step 2: Sign Up

**URL**: `https://your-app.vercel.app/signup`

Form fields:
- Email: `admin@joesdiner.com` (or any email)
- Password: `TestPassword123!`
- Restaurant Name: `Joe's Diner`
- Phone: `555-123-4567`

**What happens**:
1. Form validates with Zod schema
2. Password is hashed with crypto-js
3. Root Payer created in sandbox
4. Restaurant data stored in Upstash Redis
5. Session cookie created

**Expected**: Redirect to `/dashboard` with success message

---

## Step 3: Restaurant Dashboard

**URL**: `https://your-app.vercel.app/dashboard`

What you'll see:
- Navigation sidebar with 4 options:
  - Restaurant Settings
  - Workers
  - Daily Payouts
  - Transaction History
- Welcome message with restaurant name
- Quick stats (if data exists)

**Next**: Click "Restaurant Settings"

---

## Step 4: Link Bank Account

**URL**: `https://your-app.vercel.app/dashboard/restaurant`

Form fields:
- Account Number: `121000248`
- Routing Number: `021000021`

**What happens**:
1. Form submits to `/api/restaurant/bank-account`
2. Root API: `attachPayerBankAccount()` is called
3. Bank account attached to Root Payer
4. Restaurant data updated in Redis

**Expected**: Success message "Bank account linked successfully"

---

## Step 5: Add Worker 1 (Debit Card)

**URL**: `https://your-app.vercel.app/dashboard/workers`

Click "Add Worker" button

Form fields:
- Name: `John Smith`
- Email: `john@joesdiner.com`
- Phone: `555-456-7890`
- Payment Method: **Debit Card** (radio button)
- Card Number: `4111111111111111`
- Expiry Month: `12`
- Expiry Year: `2025`

**What happens**:
1. Form submits to `/api/workers`
2. Root API: `createRootPayee()` - creates worker
3. Root API: `attachPayeeDebitCard()` - attaches card
4. Worker data stored in Redis
5. Worker appears in table

**Expected**: Worker listed with status "Active"

---

## Step 6: Add Worker 2 (Bank Account)

**URL**: `https://your-app.vercel.app/dashboard/workers` (same page)

Click "Add Worker" button again

Form fields:
- Name: `Jane Doe`
- Email: `jane@joesdiner.com`
- Phone: `555-456-7891`
- Payment Method: **Bank Account** (radio button)
- Account Number: `121000248`
- Routing Number: `021000021`

**What happens**:
1. Form submits to `/api/workers`
2. Root API: `createRootPayee()` - creates worker
3. Root API: `attachPayeeBankAccount()` - attaches account
4. Worker data stored in Redis
5. Second worker appears in table

**Expected**: 2 workers listed, different payment methods

---

## Step 7: Enter Daily Tips & Execute Payouts

**URL**: `https://your-app.vercel.app/dashboard/payouts`

What you'll see:
- Table with all workers
- Input field for each worker to enter tips
- "Execute Tip Payouts" button

Enter tip amounts:
- John (Debit Card): `15.50`
- Jane (Bank Account): `22.75`

**What happens**:
1. Form validates amounts > 0
2. Calculates total: $38.25
3. Shows confirmation: "Ready to disburse $38.25?"
4. Click "Execute Tip Payouts"
5. For each worker:
   - Root API: `createTipPayout()` is called
   - Payout created with `instant_card` rail
   - Transaction stored in Redis with status "processing"

**Expected**: Success message with transaction IDs

Example response:
```
✓ Payouts executed successfully
  Transaction ID: txn_sand_12345678 (John - $15.50)
  Transaction ID: txn_sand_87654321 (Jane - $22.75)
  Total: $38.25
```

---

## Step 8: View Transaction History

**URL**: `https://your-app.vercel.app/dashboard/transactions`

What you'll see:
- Table with all executed payouts
- Columns: Worker Name, Amount, Status, Root Transaction ID, Date/Time

For our test, you should see:
1. John Smith - $15.50 - Status: `completed` or `processing`
2. Jane Doe - $22.75 - Status: `completed` or `processing`

**What happened**:
1. App fetches transactions from `/api/payouts`
2. Redis returns all stored transactions
3. Displayed in reverse chronological order

**Expected**: Both transactions listed with Root transaction IDs

---

## Step 9: Verify in Root Dashboard

Go to Root Dashboard (sandbox):

1. Navigate to **Payers** section
   - Should see "Joe's Diner"
   - Bank account attached (ACH)

2. Navigate to **Payees** section
   - Should see "John Smith" (debit card attached)
   - Should see "Jane Doe" (bank account attached)

3. Navigate to **Payouts** section
   - Should see 2 payouts created
   - John: $15.50 (instant_card rail)
   - Jane: $22.75 (instant_card rail)
   - Status: `settled` or `pending`

---

## Step 10: Test Session & Logout

**Logout**: Click "Logout" button in header

- Session cookie cleared
- Redirects to landing page

**Login Again**: Click "Login" button

Form fields:
- Email: `admin@joesdiner.com`
- Password: `TestPassword123!`

**What happens**:
1. Credentials verified against Redis
2. New session created
3. Redirects to `/dashboard`

**Expected**: Same restaurant data persists

---

## Automated E2E Test

Instead of manual steps, run:

```bash
node roosterwise/e2e-test.js --baseUrl https://your-app.vercel.app
```

Output:

```
[v0] Starting Roosterwise E2E Test
[v0] Base URL: https://your-app.vercel.app
[v0] ============================================

[v0] TEST 1: Restaurant Signup
[v0] POST https://your-app.vercel.app/api/auth/signup
[v0] Status: 201
[v0] ✓ Signup successful. Restaurant ID: 550e8400-e29b-41d4-a716-446655440000

[v0] TEST 2: Link Bank Account
[v0] POST https://your-app.vercel.app/api/restaurant/bank-account
[v0] Status: 200
[v0] ✓ Bank account linked successfully

[v0] TEST 3: Add Worker 1 (Debit Card)
[v0] POST https://your-app.vercel.app/api/workers
[v0] Status: 201
[v0] ✓ Worker 1 added. ID: 660f9511-f40c-52e5-b827-557766551111

[v0] TEST 4: Add Worker 2 (Bank Account)
[v0] POST https://your-app.vercel.app/api/workers
[v0] Status: 201
[v0] ✓ Worker 2 added. ID: 770g0622-g51d-63f6-c938-668877662222

[v0] TEST 5: Execute Tip Payouts
[v0] POST https://your-app.vercel.app/api/payouts
[v0] Status: 200
[v0] ✓ Payouts executed successfully
[v0] Total amount: $38.25

[v0] TEST 6: View Transaction History
[v0] GET https://your-app.vercel.app/api/payouts?restaurantId=...
[v0] Status: 200
[v0] ✓ Retrieved 2 transactions
[v0]   Transaction 1: $15.50 - Status: completed
[v0]   Transaction 2: $22.75 - Status: completed

[v0] ============================================
[v0] ✓ END-TO-END TEST COMPLETED SUCCESSFULLY
[v0] ============================================

[v0] Test Summary:
[v0] • Restaurant created: admin-xxxxx@testrestaurant.com
[v0] • Bank account linked
[v0] • 2 workers added (1 card, 1 bank)
[v0] • Payouts executed: $38.25
[v0] • Transactions recorded: 2
```

---

## Expected Root API Calls

During the test, these Root API calls are made (visible in Root dashboard logs):

1. **createRootPayer()** - Create "Joe's Diner" payer
2. **attachPayerBankAccount()** - Link bank account for ACH
3. **createRootPayee()** - Create "John Smith" payee (appears in Payees)
4. **attachPayeeDebitCard()** - Attach debit card to John
5. **createRootPayee()** - Create "Jane Doe" payee
6. **attachPayeeBankAccount()** - Attach bank account to Jane
7. **createTipPayout()** - Create $15.50 payout to John
8. **createTipPayout()** - Create $22.75 payout to Jane

---

## Success Criteria ✅

Your test is successful if:

- [ ] Restaurant signup creates account in Root Payer
- [ ] Bank account linking works without errors
- [ ] Worker 1 (debit card) created successfully
- [ ] Worker 2 (bank account) created successfully
- [ ] Payouts executed with Root transaction IDs returned
- [ ] Transaction history shows both payouts
- [ ] Root dashboard shows payers, payees, and payouts
- [ ] Logout clears session
- [ ] Login recreates session correctly

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Session expired or not logged in | Login again or check cookies |
| Bank account linking fails | Wrong account/routing numbers | Use 121000248 / 021000021 |
| Worker creation fails | Invalid email or missing payment method | Check form fields |
| Payout fails | No bank account linked or invalid payment method | Link bank account first, verify worker payment method |
| Transaction not appearing | Redis connection issue | Check UPSTASH_REDIS_REST_URL and token |
| Root API error | Invalid API key or wrong URL | Verify ROOT_API_KEY and ROOT_BASE_URL |

---

## Performance Expectations

- **Signup**: 500-1000ms
- **Bank linking**: 800-1500ms
- **Worker creation**: 600-1200ms per worker
- **Payout execution**: 1500-3000ms total (includes Root API calls)
- **Transaction history**: 200-500ms
- **Full flow**: 5-10 seconds

---

**Test Duration**: ~5-10 minutes (manual) or ~30 seconds (automated)
**Test Risk**: 🟢 None (sandbox data, test credentials only)
**Data Persistence**: All data saved in Upstash Redis
