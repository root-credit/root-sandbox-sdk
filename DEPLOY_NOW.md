# Deploy Roosterwise to Vercel Now

## Status
✅ **Application**: Fully built and tested
✅ **Environment Variables**: Added to Vercel project
✅ **Configuration**: vercel.json configured to deploy roosterwise subdirectory only
✅ **Ready**: YES

## Deployment Steps

### Step 1: Commit Your Changes
```bash
cd /vercel/share/v0-project
git add -A
git commit -m "Deploy Roosterwise - just-in-time tip payouts platform"
```

### Step 2: Push to Vercel
```bash
git push origin restaurant-tip-payouts
```

That's it! Vercel will automatically:
1. Detect the push on `restaurant-tip-payouts` branch
2. Build the Next.js app from the `roosterwise/` directory
3. Deploy to production (2-5 minutes)
4. Inject environment variables

## What Gets Deployed

**Only the Roosterwise App** (`/roosterwise` directory):
- `app/` - Next.js pages and API routes
- `lib/` - Root SDK wrapper, Redis client, Auth utilities
- `components/` - React components
- `public/` - Static assets
- `package.json` - Dependencies

The Root SDK repository code (`/dist`, `/src`, etc.) is NOT deployed.

## Your App URL

After deployment, your app will be available at:
```
https://[your-vercel-project].vercel.app
```

The Vercel project is: **prj_ghNM9Jyk5koG6Qkn2gAOVI2A3Vqy**

## Environment Variables (Already Set)

The following variables are injected automatically:
- `ROOT_API_KEY` - Root Sandbox API key
- `ROOT_BASE_URL` - Root Sandbox API endpoint
- `UPSTASH_REDIS_REST_URL` - Redis connection
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication

## Testing After Deployment

### 1. Verify App is Running
Visit: `https://[your-url].vercel.app`

You should see the **Roosterwise** landing page with:
- "5-Second Tip Payouts" headline
- Sign up / Login buttons
- Features highlighting instant payouts

### 2. Run End-to-End Test
Complete this flow:

**Step A: Sign Up**
- Click "Sign Up"
- Email: `admin@testrestaurant.com`
- Restaurant: `Test Pizzeria`
- Password: `Test123!`

**Step B: Link Bank Account**
- Navigate to Restaurant settings
- Click "Link Bank Account"
- Account: `121000248`
- Routing: `021000021`
- Click "Link Account"

**Step C: Add Workers**
- Go to Workers section
- Add Worker 1:
  - Name: `John Smith`
  - Email: `john@test.com`
  - Payment: Debit Card
  - Card: `4111111111111111`
  - Expiry: `12/25`

- Add Worker 2:
  - Name: `Jane Doe`
  - Email: `jane@test.com`
  - Payment: Bank Account
  - Account: `121000248`
  - Routing: `021000021`

**Step D: Execute Payouts**
- Go to Payouts
- Enter tips:
  - John: $15.50
  - Jane: $22.75
- Click "Execute Payouts"
- See "✓ Payouts completed!"

**Step E: Verify History**
- Go to Transactions
- See 2 transactions with Root IDs
- Status should be "completed"

## Expected Results

After the test:
- ✓ Restaurant created in Root Sandbox
- ✓ Payer (restaurant) registered with Root
- ✓ Bank account linked for ACH funding
- ✓ 2 Payees (workers) created in Root
- ✓ Payment methods attached
- ✓ 2 Payouts executed (5-second settlements)
- ✓ Transaction history visible in app

## Verify in Root Dashboard

Log into your Root Sandbox dashboard and confirm:
1. **Payer**: 1 restaurant with ACH funding source
2. **Payees**: 2 workers (John & Jane)
3. **Payouts**: 2 completed payouts ($15.50 + $22.75)
4. **Total Disbursed**: $38.25

## Common Issues & Solutions

### "Failed to connect to Redis"
- Check `UPSTASH_REDIS_REST_URL` is set
- Check `UPSTASH_REDIS_REST_TOKEN` is set
- Restart deployment

### "Root API error: Unauthorized"
- Check `ROOT_API_KEY` is valid
- Verify key is for SANDBOX, not production
- Check `ROOT_BASE_URL` is `https://sandbox.root.com`

### "Session expired"
- Clear browser cookies
- Try signing up again
- Check cookie settings

### Page shows "Cannot find module"
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Try redeploying

## View Logs & Monitor

**Real-time Logs:**
- Vercel Dashboard → Project → Deployments → [Latest] → Functions

**Browser Console:**
- Open DevTools (F12)
- Network tab for API calls
- Console for debug logs (prefixed with `[v0]`)

## Deployment Complete ✓

The Roosterwise application is ready to deploy. Your users can now:
1. Sign up as restaurant admins
2. Link bank accounts
3. Add workers
4. Execute 5-second tip payouts
5. Track transaction history

**Ready to go live!**
