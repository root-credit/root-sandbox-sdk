# Roosterwise - Just-in-Time Tip Payouts

A modern, full-stack application for restaurant management that enables instant tip payouts to workers in ~5 seconds using Root's payment infrastructure.

## Features

- **Restaurant Admin Authentication**: Email-based login with secure session management
- **Worker Management**: Add and manage restaurant workers with flexible payment methods
- **Multiple Payment Methods**: Support for both bank accounts and debit cards
- **One-Click Payouts**: Process end-of-day tips to all workers instantly
- **Transaction History**: Complete audit trail of all payouts
- **Bank Account Linking**: Secure ACH debit setup for restaurant funding
- **Root API Integration**: Direct integration with Root's payment infrastructure for real-time payouts

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Upstash Redis (serverless caching + data persistence)
- **Payments**: Root SDK (@root-credit/root-sdk)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **Auth**: Custom session-based auth with HTTP-only cookies

## Prerequisites

1. **Upstash Redis Account**
   - Create account at https://upstash.com
   - Create a new Redis database
   - Copy REST URL and Token

2. **Root API Credentials**
   - Get API key from Root's dashboard
   - Ensure you have sandbox credentials for testing
   - API documentation: https://docs.useroot.com

## Setup Instructions

### 1. Clone and Install

```bash
cd roosterwise
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-token
ROOT_API_KEY=your-root-api-key
ROOT_API_BASE_URL=https://sandbox.root.com/api
AUTH_SECRET=your-secure-random-string
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Application Flow

### 1. Getting Started
- Visit the landing page at `/`
- Click "Sign Up" to create a restaurant account
- Provide restaurant name, email, and phone

### 2. Bank Account Setup
- Navigate to `/dashboard/restaurant`
- Link your restaurant's bank account for ACH transfers
- Provide routing number and account number

### 3. Add Workers
- Go to `/dashboard/workers`
- Click "Add Worker"
- Choose payment method (bank account or debit card)
- Fill in worker details and payment information
- Worker is registered in Root system automatically

### 4. Process Tip Payouts
- Visit `/dashboard/payouts`
- Enter end-of-day tip amounts for each worker
- Click "Process Payouts Now"
- Tips are sent instantly via Root API

### 5. View Transaction History
- Check `/dashboard/transactions`
- See all historical payouts with status
- View total amounts paid and success rates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new restaurant
- `POST /api/auth/login` - Login with email
- `POST /api/auth/logout` - Logout and clear session

### Restaurant Management
- `POST /api/restaurant/bank-account` - Link bank account

### Workers
- `GET /api/workers` - List all workers for restaurant
- `POST /api/workers` - Add new worker with payment method
- `DELETE /api/workers/[id]` - Remove worker

### Payouts
- `POST /api/payouts` - Process tip payouts
- `GET /api/payouts` - Get transaction history

## Data Structure (Upstash Redis)

### Sessions
```
session:{sessionId} -> { adminEmail, restaurantId }
```

### Restaurants
```
restaurant:{restaurantId} -> {
  id, adminEmail, restaurantName, phone,
  rootCustomerId, bankAccountToken, createdAt, updatedAt
}
```

### Workers
```
worker:{workerId} -> {
  id, restaurantId, name, email, phone,
  paymentMethodId, paymentMethodType, createdAt, updatedAt
}

restaurant:{restaurantId}:workers -> Set of workerIds
```

### Transactions
```
transaction:{transactionId} -> {
  id, restaurantId, workerId, amount,
  status, rootPayoutId, createdAt, completedAt
}

restaurant:{restaurantId}:transactions -> Set of transactionIds
```

## Root API Integration

The application uses the Root SDK for:

1. **Customer Registration** - Creates customer profiles in Root for restaurants and workers
2. **Bank Account Linking** - Securely links ACH accounts for ACH debits
3. **Payment Method Management** - Adds bank accounts and debit cards as payment methods
4. **Tip Payouts** - Processes instant payouts to worker payment methods

All API calls minimize caching and read fresh data from Root for accuracy.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Redis database URL | `https://us1-cold-falcon-xyz.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token | `ABCDEFg...` |
| `ROOT_API_KEY` | Root API authentication key | `rk_sandbox_...` |
| `ROOT_API_BASE_URL` | Root API base URL | `https://sandbox.root.com/api` |
| `AUTH_SECRET` | Session encryption secret | `your-secure-random-string` |

## Security Considerations

- Sessions are HTTP-only cookies (cannot be accessed via JavaScript)
- All sensitive data (card numbers, account numbers) are transmitted securely
- Restaurant IDs are verified on every API call
- Root API handles actual payment processing (not stored locally)
- Use HTTPS in production
- Change `AUTH_SECRET` in production to a secure random value

## Deployment

### Option 1: Vercel

1. Push to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing Checklist

- [ ] Can sign up new restaurant
- [ ] Can login with existing email
- [ ] Can link bank account
- [ ] Can add workers (both bank account and card methods)
- [ ] Can view worker list
- [ ] Can process tip payouts
- [ ] Can view transaction history
- [ ] Root API calls succeed (check console logs)
- [ ] Logout works properly

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env.local` is in the project root
- Restart dev server after changing env vars
- Check file isn't in `.gitignore`

### Redis Connection Error
- Verify Upstash Redis URL and token
- Check network connectivity
- Ensure Redis database is active in Upstash dashboard

### Root API Errors
- Verify API key is correct
- Check API endpoint URL matches environment
- Ensure you're using sandbox URL for testing
- Check Root API documentation for error codes

## Performance Notes

- Tip payouts typically complete in 5 seconds per worker
- Redis lookups are instant (<10ms)
- Root API calls vary (100-500ms depending on payload)
- Multiple payouts are processed sequentially

## Future Enhancements

- Real-time payout status updates via WebSockets
- Batch processing with scheduled payouts
- Analytics dashboard with earnings charts
- Direct bank transfers from worker accounts
- Multi-location restaurant support
- Advanced worker scheduling features
- Email notifications for payouts

## Support & Documentation

- Root API Docs: https://docs.useroot.com
- Upstash Redis Docs: https://upstash.com/docs
- Next.js Documentation: https://nextjs.org/docs

## License

MIT
