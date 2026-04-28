# Roosterwise - Just-in-Time Tip Payouts for Restaurants

**Deploy your app**: The Roosterwise app is ready for deployment on Vercel. All code is in the `roosterwise/` directory and will be automatically deployed from the `restaurant-tip-payouts` branch.

## Quick Start - Test the App

### 1. Local Development

```bash
cd roosterwise
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Run End-to-End Test (after deployment)

```bash
node roosterwise/e2e-test.js --baseUrl https://your-deployed-app.vercel.app
```

This will automatically:
- Create a test restaurant account
- Link a test bank account
- Add test workers with different payment methods
- Execute tip payouts
- Verify transaction history

## Application Features

### For Restaurant Admins

1. **Sign Up & Authentication**
   - Email-based account creation
   - Session management via Upstash Redis
   - Secure password storage

2. **Bank Account Linking**
   - Link restaurant bank account via ACH
   - Root API integration for account verification
   - Persistent storage in Redis

3. **Worker Management**
   - Add workers with full details
   - Support for both debit card and bank account payment methods
   - Worker data synced with Root Payee API

4. **Daily Tip Entry**
   - Enter end-of-day tip amounts for each worker
   - Automatic amount calculation and total tracking
   - One-click payout execution via Root API

5. **Transaction History**
   - View all completed and pending payouts
   - Track payout status (processing/completed/failed)
   - Transaction IDs linked to Root dashboard

## Tech Stack

- **Frontend**: Next.js 16 (React 19.2)
- **Backend**: Next.js API Routes (server-side)
- **Database**: Upstash Redis
- **Payments**: Root API (via @root-credit/root-sdk)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation

## Environment Variables

Required in Vercel project settings:

```
ROOT_API_KEY=<your_root_sandbox_api_key>
ROOT_BASE_URL=https://sandbox.root.com
UPSTASH_REDIS_REST_URL=<your_upstash_redis_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_token>
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register restaurant
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Restaurant
- `POST /api/restaurant/bank-account` - Link bank account

### Workers
- `GET /api/workers?restaurantId=...` - List workers
- `POST /api/workers` - Add worker
- `DELETE /api/workers/[id]` - Remove worker

### Payouts
- `POST /api/payouts` - Execute tip payouts
- `GET /api/payouts?restaurantId=...` - Get transaction history

### Session
- `GET /api/session` - Check current session

## Testing End-to-End Payment Flow

See `E2E_TEST_GUIDE.md` for detailed manual testing steps, or use the automated test script:

```bash
# After deployment to Vercel
node e2e-test.js --baseUrl https://your-app.vercel.app
```

**Test Flow**:
1. Restaurant signup (creates Root Payer)
2. Bank account linking (ACH debit setup)
3. Add workers (creates Root Payees, attaches payment methods)
4. Enter daily tips
5. Execute payouts (creates Root Payouts with instant_card rail)
6. View transaction history

## Root Sandbox Test Data

Use these test credentials:

**Bank Account**:
- Account: `121000248`
- Routing: `021000021`

**Debit Card**:
- Card: `4111111111111111`
- Expiry: `12/25` (any future date)

## Deployment

The app deploys automatically from `restaurant-tip-payouts` branch to Vercel. The `vercel.json` configuration ensures only the `roosterwise` directory is deployed.

### Deploy Steps

1. Push to `restaurant-tip-payouts` branch
2. Vercel automatically triggers deployment
3. Environment variables are injected
4. App builds and deploys to edge network
5. Available at your Vercel URL

### Build Configuration

```json
{
  "buildCommand": "cd roosterwise && npm run build",
  "installCommand": "cd roosterwise && npm install",
  "outputDirectory": "roosterwise/.next"
}
```

## Troubleshooting

### Application won't start
- Verify all environment variables are set
- Check Redis connection string is correct
- Ensure Root API Key has sandbox access

### Tests fail
- Confirm Root API Key and Redis URL are accessible
- Check network connectivity to Root API
- Verify test data hasn't been modified

### Payments not processing
- Verify restaurant has linked bank account
- Check workers have valid payment methods
- Ensure tip amounts are greater than zero

## Documentation

- `E2E_TEST_GUIDE.md` - Detailed manual testing guide
- `DEPLOYMENT_GUIDE.md` - Deployment architecture & configuration
- `README_ROOSTERWISE.md` - Complete feature documentation

## Next Steps

1. ✅ Code is ready to deploy
2. ✅ Environment variables are set
3. 📤 Deploy to Vercel (automatic on push to `restaurant-tip-payouts`)
4. 🧪 Run E2E tests to verify payment flow
5. 🚀 Go live with tip payouts for restaurants
