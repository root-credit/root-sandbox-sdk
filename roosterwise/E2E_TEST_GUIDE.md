# Roosterwise End-to-End Payment Flow Test Guide

This guide walks you through a complete payment flow in Roosterwise using the Root Sandbox API.

## Prerequisites

- Roosterwise app deployed and running
- Root API Key with sandbox access
- Upstash Redis configured

## End-to-End Flow Steps

### 1. Restaurant Admin Sign Up

**URL**: `https://your-deployed-app.vercel.app/signup`

1. Enter your email address (e.g., `admin@myrestaurant.com`)
2. Enter a password
3. Enter restaurant name (e.g., "Joe's Diner")
4. Enter phone number (e.g., `555-123-4567`)
5. Click "Create Account"

**What happens:**
- Your account is created in Upstash Redis
- A Root Payer customer is created for your restaurant
- You're redirected to the dashboard
- A session cookie is created and stored

### 2. Link Bank Account (ACH Debit Pull)

**URL**: `https://your-deployed-app.vercel.app/dashboard/restaurant`

1. Navigate to "Restaurant Settings" from the sidebar
2. Enter your bank account details:
   - Account Number: `121000248` (Root test account)
   - Routing Number: `021000021` (Root test routing)
3. Click "Link Bank Account"

**What happens:**
- Your bank account is linked to your Root Payer via `attachPayByBank()`
- The account is stored in Redis for reference
- You see a confirmation message with the account status

### 3. Add Restaurant Workers

**URL**: `https://your-deployed-app.vercel.app/dashboard/workers`

1. Click "Add Worker" button
2. Enter worker details:
   - Name: `John Smith`
   - Email: `john@example.com`
   - Phone: `555-456-7890`
3. Choose payment method type: **Debit Card**
4. Enter card details:
   - Card Number: `4111111111111111` (Root test card)
   - Expiry: `12/25`
5. Click "Add Worker"

**What happens:**
- Worker is created as a Root Payee via `createRootPayee()`
- Debit card is attached via `attachPushToCard()`
- Worker is stored in Redis with their payment method ID
- You see the worker listed in the workers table

**Repeat**: Add a second worker with a bank account instead:
- Choose **Bank Account**
- Use the same test account: `121000248` / `021000021`

### 4. Enter Daily Tips

**URL**: `https://your-deployed-app.vercel.app/dashboard/payouts`

1. You'll see all your workers listed
2. For each worker, enter their tip amount:
   - Worker 1 (Debit Card): `$15.50`
   - Worker 2 (Bank Account): `$22.75`
3. Review the total amount: `$38.25`
4. Click "Execute Tip Payouts"

**What happens:**
- The app validates that the restaurant has a bank account linked
- For each tip, it calls Root's `createTipPayout()` API
- Payouts are created with `instant_card` or `standard_ach` rails
- Each payout receives a transaction ID from Root
- Transaction records are stored in Redis with status "processing"

### 5. View Transaction History

**URL**: `https://your-deployed-app.vercel.app/dashboard/transactions`

1. View all completed and pending payouts
2. See details like:
   - Worker name and amount
   - Payout status (pending/completed/failed)
   - Root transaction ID
   - Timestamp

**What happens:**
- The app fetches all transaction records from Redis
- Each transaction shows the current status from Root (if applicable)
- You can use transaction IDs to look up details in Root Dashboard

## Root Sandbox Test Data

**Test Bank Account:**
- Account: `121000248`
- Routing: `021000021`
- Status: Always available in Root sandbox

**Test Debit Card:**
- Card: `4111111111111111`
- Expiry: `12/25` (any future date)
- CVV: `123` (any 3 digits)

## Troubleshooting

**"Unauthorized" error on any page:**
- Your session has expired
- Log out and log in again

**Bank account linking fails:**
- Verify the account and routing numbers
- Check that Root API Key is configured correctly

**Payout execution fails:**
- Ensure restaurant has a bank account linked
- Check that workers have valid payment methods
- Verify Root API Key has payout permissions

**Redis connection errors:**
- Check UPSTASH_REDIS_REST_URL and token are set
- Verify no typos in environment variables

## API Flow Diagram

```
1. Signup
   └─> createRootPayer() [Root API]
   └─> setRestaurant() [Redis]

2. Link Bank Account
   └─> attachPayerBankAccount() [Root API]
   └─> updateRestaurant() [Redis]

3. Add Worker
   └─> createRootPayee() [Root API]
   └─> attachPayeeDebitCard/PayeeBankAccount() [Root API]
   └─> setWorker() [Redis]

4. Execute Payouts
   └─> createTipPayout() [Root API] (for each worker)
   └─> setTransaction() [Redis] (for each transaction)

5. View Transactions
   └─> getRestaurantTransactions() [Redis]
```

## Testing Checklist

- [ ] Can sign up as a restaurant admin
- [ ] Can link a bank account
- [ ] Can add multiple workers (both card and bank account types)
- [ ] Can enter tip amounts for all workers
- [ ] Can execute payouts with success
- [ ] Can view transaction history
- [ ] Transaction IDs match between Roosterwise and Root dashboard
- [ ] Tips appear with correct amounts and worker names
- [ ] Can log out and log back in
- [ ] Session persists correctly across page refreshes
