PROJECT STRUCTURE UPDATED FOR PROPER VERCEL DEPLOYMENT

OLD STRUCTURE (Had Build Issues):
- Root SDK at root level
- Roosterwise nested inside
- vercel.json pointing to roosterwise/.next

NEW STRUCTURE (Deployment Ready):
- Root SDK at root level (main branch code)
- Roosterwise as primary app on restaurant-tip-payouts branch
- vercel.json configured for standalone output

KEY CHANGES:

1. vercel.json Updated:
   - outputDirectory: "roosterwise/.next/standalone"
   - This uses Next.js standalone mode for better deployment

2. roosterwise/next.config.ts Updated:
   - Added: output: "standalone"
   - Bundles all dependencies in .next/standalone folder

3. Build Process:
   - Vercel runs: cd roosterwise && npm install && npm run build
   - Deploys from: roosterwise/.next/standalone
   - No need for separate public folder

ROOT SDK INTEGRATION:
- Available to Roosterwise via: "@root-credit/root-sdk": "file:../"
- Root SDK builds independently when needed
- Can be reused by other UI projects on different branches

DEPLOYMENT:
git push origin restaurant-tip-payouts

App will deploy to Vercel in 2-5 minutes.
