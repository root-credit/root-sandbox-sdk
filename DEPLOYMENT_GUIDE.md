# Roosterwise Deployment Guide

## Project Overview

Roosterwise is a just-in-time tip payout system for restaurants using the Root payment API. The app is built with Next.js 16 and Upstash Redis.

## Deployment Configuration

The application is deployed from the `restaurant-tip-payouts` branch of the `root-credit/root-sandbox-sdk` repository to Vercel. The deployment is configured to deploy only the `roosterwise` directory using `vercel.json`.

### Deployment Settings

- **Vercel Project ID**: `prj_ghNM9Jyk5koG6Qkn2gAOVI2A3Vqy`
- **Repository**: `root-credit/root-sandbox-sdk`
- **Branch**: `restaurant-tip-payouts`
- **Root Directory**: `roosterwise` (configured via `vercel.json`)

## Environment Variables Required

All environment variables must be set in Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `ROOT_API_KEY` | Root API authentication key | `sk_sandbox_...` |
| `ROOT_BASE_URL` | Root API base URL | `https://sandbox.root.com` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | `AaTTWkdDc...` |

## Deployed Application Structure

```
roosterwise/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── workers/       # Worker management
│   │   ├── payouts/       # Tip payout processing
│   │   ├── restaurant/    # Restaurant settings
│   │   └── session/       # Session management
│   ├── dashboard/
│   │   ├── page.tsx       # Main dashboard
│   │   ├── workers/       # Worker listing & management
│   │   ├── payouts/       # Daily tip entry & payout
│   │   ├── transactions/  # Transaction history
│   │   └── restaurant/    # Restaurant settings
│   ├── login/
│   ├── signup/
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Landing page
│   └── globals.css        # Design system & theming
├── components/            # Reusable React components
├── lib/
│   ├── redis.ts          # Upstash Redis client & operations
│   ├── root-api.ts       # Root SDK wrapper & API functions
│   ├── auth.ts           # Authentication utilities
│   └── session.ts        # Session management
├── package.json          # Dependencies
└── vercel.json          # Vercel deployment config
```

## How Deployment Works

1. **Trigger**: When you push to `restaurant-tip-payouts` branch, Vercel automatically starts a deployment
2. **Install**: Runs `cd roosterwise && npm install`
3. **Build**: Runs `cd roosterwise && npm run build`
4. **Deploy**: Deploys the `.next` output directory to Vercel edge network
5. **Environment**: All environment variables from Vercel project settings are injected at build and runtime

## Access the Application

Once deployed, the application is available at your Vercel deployment URL. The default routes are:

- **Landing Page**: `/` - Describes Roosterwise features
- **Sign Up**: `/signup` - Create new restaurant account
- **Login**: `/login` - Log into existing account
- **Dashboard**: `/dashboard` - Restaurant admin main page (protected)
- **Workers**: `/dashboard/workers` - Manage restaurant workers (protected)
- **Payouts**: `/dashboard/payouts` - Enter tips and execute payouts (protected)
- **Transactions**: `/dashboard/transactions` - View payout history (protected)
- **Restaurant Settings**: `/dashboard/restaurant` - Link bank account (protected)

## Testing the Payment Flow

See `E2E_TEST_GUIDE.md` for step-by-step instructions on testing a complete payment flow from signup through tip payouts.

Key flow:
1. Sign up as restaurant admin
2. Link bank account (ACH debit pull)
3. Add workers with payment methods (card or bank account)
4. Enter daily tip amounts
5. Execute payouts via Root API
6. View transaction history

## Troubleshooting Deployments

### Build Fails
- Check `vercel.json` is in repository root
- Verify `roosterwise/package.json` exists
- Ensure all dependencies are listed in package.json

### Runtime Errors
- Verify all environment variables are set in Vercel project settings
- Check application logs in Vercel dashboard
- Ensure Root API Key has sandbox API access

### Application Won't Start
- Check Redis connection strings in environment variables
- Verify Redis credentials are correct
- Ensure firewall allows connections to Upstash Redis

## Development Notes

- The Root SDK is included as a local dependency (`file:../`)
- Redis is used for all data persistence (no database)
- Sessions are stored in Redis with 24-hour TTL
- All API routes are server-side and validate sessions via cookies
- The app minimizes caching to ensure real-time data from Root APIs
