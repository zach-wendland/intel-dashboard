# Setup Instructions - America First Intelligence Grid

## Quick Start (5 minutes to deploy)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings → API
3. Run the database schema:
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Execute the SQL
4. Update `.env.local` with your Supabase credentials

### 2. Stripe Setup (for monetization)

1. Create account at [stripe.com](https://stripe.com)
2. Get your publishable key from Developers → API keys
3. Create a product and price:
   - Product name: "America First Premium"
   - Price: $9.99/month recurring
   - Copy the Price ID (starts with `price_`)
4. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret
5. Update `.env.local` with Stripe keys

### 3. Plausible Analytics Setup (optional but recommended)

1. Create account at [plausible.io](https://plausible.io) - $9/month for 10k visitors
2. Add your domain
3. Copy the tracking script domain
4. Update `.env.local` with `VITE_PLAUSIBLE_DOMAIN`

**OR use Google Analytics (free but privacy-invasive)**

### 4. Email Service Setup (Resend)

1. Create account at [resend.com](https://resend.com) - Free tier: 3k emails/month
2. Get API key from Dashboard
3. Verify your domain (or use test emails)
4. Update `.env.local` with `RESEND_API_KEY`

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# ... add all variables from .env.example

# Redeploy with env vars
vercel --prod
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in .env.local with your actual values

# Start dev server
npm run dev
```

## Migration from localStorage to Supabase

The app currently uses localStorage for bookmarks/history. After setting up Supabase:

1. Users will see "Migrate to Cloud" button in their bookmarks/history tabs
2. They create account (email/password or social OAuth)
3. Their localStorage data is automatically uploaded to Supabase
4. Future sessions sync across devices

## Stripe Webhook Testing (local development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# Test webhook
stripe trigger customer.subscription.created
```

## Cost Breakdown (Monthly)

### Minimum Viable Stack
- **Supabase**: $0 (free tier - 50k users, 500MB database)
- **Stripe**: $0 + 2.9% + $0.30 per transaction
- **Vercel Pro**: $20 (required for serverless functions)
- **Resend**: $0 (free tier - 3k emails/month)
- **Plausible**: $9 (10k monthly visitors)
- **Total**: ~$29/month + transaction fees

### At Scale (10k users, 300 paid)
- **Supabase**: $25 (Pro tier - 100k users, 8GB database)
- **Stripe fees**: ~$90 (300 × $9.99 × 3%)
- **Vercel Pro**: $20
- **Resend**: $20 (50k emails/month)
- **Plausible**: $19 (100k visitors)
- **Total**: ~$174/month
- **Revenue**: $2,997/month (300 × $9.99)
- **Net**: $2,823/month ($33.8k/year)

## Monitoring & Analytics

1. **Supabase Dashboard** - Database metrics, auth users
2. **Stripe Dashboard** - MRR, churn, failed payments
3. **Plausible Dashboard** - Traffic, conversions, referrers
4. **Vercel Analytics** - Performance, errors
5. **Resend Dashboard** - Email delivery rates

## Security Checklist

- [x] RLS policies enabled on all Supabase tables
- [x] API keys stored in environment variables (never in code)
- [x] Stripe webhook signature verification
- [x] HTTPS enforced on production
- [ ] Rate limiting on API endpoints (TODO: add Vercel edge middleware)
- [ ] CAPTCHA on email signup form (TODO: add Cloudflare Turnstile)

## Troubleshooting

### Supabase connection errors
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Verify RLS policies allow authenticated users to access their data
- Check browser console for auth errors

### Stripe webhook failures
- Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
- Check webhook endpoint is publicly accessible
- Use `stripe listen` for local testing

### Email delivery issues
- Verify domain in Resend dashboard
- Check RESEND_API_KEY is correct
- Use test mode for development

## Next Steps

After basic setup works:

1. **Week 1**: Deploy and validate email signups work
2. **Week 2**: Post on Twitter/Gab/Truth Social to get initial users
3. **Week 3**: Survey users on $9.99/month willingness to pay
4. **Week 4**: Launch premium tier if validation succeeds
5. **Month 2**: Implement affiliate links for all 30+ streamers
6. **Month 3**: Build email digest automation
7. **Month 6**: Consider investigative reports / paid newsletter tier

## Support

For issues:
1. Check this SETUP.md file
2. Review Supabase logs
3. Check Vercel deployment logs
4. Open GitHub issue with error details
