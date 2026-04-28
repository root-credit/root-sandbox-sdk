# How to Access Roosterwise

## Option 1: Preview in v0 (Development)
The v0 preview will automatically detect when the dev server starts and show the app at the preview URL in your browser.

## Option 2: Direct URL After Deployment (Production)
Once deployed to Vercel, access your app at:
```
https://[your-vercel-project-name].vercel.app
```

To find your deployment URL:
1. Go to https://vercel.com/dashboard
2. Select your project (prj_ghNM9Jyk5koG6Qkn2gAOVI2A3Vqy)
3. Copy the deployment URL from the "Domains" section

## Environment Variables Already Set
Your Vercel project has these environment variables configured:
- ROOT_API_KEY ✓
- ROOT_BASE_URL ✓
- UPSTASH_REDIS_REST_URL ✓
- UPSTASH_REDIS_REST_TOKEN ✓

## Current Project Info
- **Repository**: root-credit/root-sandbox-sdk
- **Branch**: restaurant-tip-payouts
- **Vercel Project ID**: prj_ghNM9Jyk5koG6Qkn2gAOVI2A3Vqy
- **App Directory**: /roosterwise (configured in vercel.json)

## Next Steps
1. **Commit changes**: `git add . && git commit -m "Deploy Roosterwise"`
2. **Push to deploy**: `git push origin restaurant-tip-payouts`
3. **Wait 2-5 minutes** for Vercel to build and deploy
4. **Visit your Vercel URL** to access the app
