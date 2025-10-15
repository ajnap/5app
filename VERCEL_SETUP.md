# Vercel Deployment Setup

## Required Environment Variables

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel project settings:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

**Where to find these:**
1. Go to your Stripe dashboard
2. Navigate to Developers → API keys
3. Copy the keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. For webhook secret:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-vercel-domain.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`
5. For price IDs:
   - Go to Products
   - Click on your products
   - Copy the price IDs for monthly and yearly plans

### Application URL
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** Set this to your Vercel deployment URL after the first deployment

---

## Steps to Deploy

### 1. Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add each of the variables listed above
5. Make sure to add them for all environments (Production, Preview, Development)

### 2. Trigger Deployment

After adding all environment variables:
1. Go to Deployments tab
2. Click on the three dots (...) on the latest deployment
3. Click "Redeploy"
4. OR push a new commit to trigger automatic deployment

### 3. Configure Stripe Webhook

Once deployed:
1. Copy your Vercel deployment URL
2. Go to Stripe Dashboard → Developers → Webhooks
3. Add endpoint: `https://your-domain.vercel.app/api/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
7. Redeploy to apply the new webhook secret

---

## Troubleshooting

### Build Fails with "supabaseUrl is required"
- Make sure all Supabase environment variables are added to Vercel
- Verify the variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Build Fails with Environment Variable Errors
- All `NEXT_PUBLIC_*` variables are embedded at build time
- Other variables are only available at runtime
- Make sure variables are added to all environments

### Webhooks Not Working
- Verify the webhook endpoint URL is correct
- Check that the signing secret matches in Vercel
- Make sure the webhook events are properly selected in Stripe
- Check Vercel function logs for webhook errors

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` or any files containing secrets to git
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - use with extreme caution
- Keep your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` secure
- Rotate keys immediately if they are ever exposed

---

## Post-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] First deployment successful
- [ ] Stripe webhook configured with production URL
- [ ] `NEXT_PUBLIC_APP_URL` updated to production URL
- [ ] Test user signup flow
- [ ] Test subscription checkout (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify webhook events are being received
- [ ] Check Vercel function logs for any errors

---

## Local Development vs Production

**Local (.env.local):**
- Uses local environment variables
- Stripe webhook requires Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

**Production (Vercel):**
- Uses Vercel environment variables
- Stripe webhook points directly to production URL
- No Stripe CLI needed

---

Generated: October 15, 2025
