# The Next 5 Minutes - MVP

A full-stack parenting connection app that delivers daily 5-minute prompts to strengthen parent-child relationships.

## Features

- **Authentication**: Supabase Auth with email/password
- **Daily Prompts**: Database-driven daily connection activities
- **Subscription Management**: Stripe integration for monthly/yearly plans
- **Responsive Design**: Clean Tailwind CSS UI
- **Protected Routes**: Server-side authentication checks

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **Payments**: Stripe Checkout + Webhooks
- **Deployment**: Vercel

## Project Structure

```
parenting-app/
├── app/
│   ├── api/
│   │   ├── auth/callback/    # Supabase auth callback
│   │   ├── checkout/          # Stripe checkout session
│   │   ├── portal/            # Stripe customer portal
│   │   └── webhook/           # Stripe webhooks
│   ├── account/               # Subscription management page
│   ├── dashboard/             # Daily prompts page
│   ├── signup/                # Auth page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── CheckoutButton.tsx     # Stripe checkout component
│   ├── ManageSubscriptionButton.tsx
│   └── SignOutButton.tsx
├── lib/
│   ├── stripe.ts              # Stripe utilities
│   └── supabase.ts            # Supabase client helpers
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example               # Environment variables template
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- Stripe account (test mode is fine)
- Vercel account (for deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Wait for the database to be ready (takes ~2 minutes)
3. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (needed for webhooks)

4. Go to **SQL Editor** and run the migration script:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in SQL Editor
   - This creates the `profiles` and `daily_prompts` tables

5. Configure authentication:
   - Go to **Authentication > Providers**
   - Enable Email provider
   - (Optional) Disable email confirmation for testing:
     - Go to **Authentication > Settings**
     - Uncheck "Enable email confirmations"

### 3. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Test Mode** (toggle in top right)
3. Go to **Products** and create two products:
   - **Monthly Premium**: $9.99/month recurring
   - **Annual Premium**: $99/year recurring
4. Copy the Price IDs (starts with `price_...`)
5. Go to **Developers > API Keys** and copy:
   - Publishable key
   - Secret key
6. Set up webhook endpoint (we'll do this after deploying, or use Stripe CLI locally)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Update `.env.local` with your actual keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Leave empty for now, add after webhook setup

# Stripe Price IDs
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test Locally with Stripe CLI (Optional)

To test webhooks locally:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhook

# Copy the webhook signing secret (whsec_xxx) to .env.local
# as STRIPE_WEBHOOK_SECRET
```

In another terminal, trigger test events:

```bash
stripe trigger checkout.session.completed
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/parenting-app.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **Import Project**
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
5. Click **Deploy**

### 3. Set Up Stripe Webhook (Production)

1. After deployment, copy your Vercel URL
2. Go to **Stripe Dashboard > Developers > Webhooks**
3. Click **Add endpoint**
4. Enter: `https://your-app.vercel.app/api/webhook`
5. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the webhook signing secret
7. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy the app

### 4. Update Supabase Redirect URL

1. Go to **Supabase Dashboard > Authentication > URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`

## Testing the App

### Create an Account

1. Go to `/signup`
2. Create account with email/password
3. You'll be redirected to `/dashboard`

### View Daily Prompt

- The dashboard shows today's prompt from the database
- Sample prompts are auto-inserted by the migration script

### Test Subscription Flow

1. Click **Account** in navigation
2. Click **Upgrade Now** on Monthly or Annual plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date and any CVC
5. Complete checkout
6. You'll be redirected back to account page
7. Subscription status should update to "Premium"

### Manage Subscription

1. Go to `/account`
2. Click **Manage Subscription**
3. Opens Stripe Customer Portal
4. Can update payment method, view invoices, cancel subscription

## Database Schema

### profiles

```sql
- id: UUID (references auth.users)
- email: TEXT
- subscription_status: TEXT (active|inactive|cancelled)
- subscription_tier: TEXT (free|monthly|yearly)
- stripe_customer_id: TEXT
- stripe_subscription_id: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### daily_prompts

```sql
- id: UUID
- title: TEXT
- description: TEXT
- activity: TEXT
- date: DATE (unique)
- created_at: TIMESTAMP
```

## Stripe Test Cards

Use these cards in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future date for expiry and any 3-digit CVC.

## Troubleshooting

### Supabase Auth Issues

- Check that email provider is enabled
- Verify redirect URLs are configured
- Check browser console for errors

### Stripe Checkout Not Working

- Verify Stripe keys are correct (test mode vs live mode)
- Check Price IDs match your Stripe products
- Ensure webhook secret is set (for subscription updates)

### Database Errors

- Verify migration script ran successfully
- Check RLS policies are enabled
- Use Supabase SQL Editor to debug queries

### Build Errors

- Run `npm run build` locally to catch errors early
- Check all environment variables are set
- Verify TypeScript errors: `npx tsc --noEmit`

## Next Steps

- Add email notifications (Resend, SendGrid)
- Implement prompt completion tracking
- Add user preferences/settings
- Create admin dashboard for managing prompts
- Add social sharing features
- Implement analytics (PostHog, Mixpanel)

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | `pk_test_xxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes | `whsec_xxx` |
| `STRIPE_PRICE_ID_MONTHLY` | Monthly subscription price ID | Yes | `price_xxx` |
| `STRIPE_PRICE_ID_YEARLY` | Yearly subscription price ID | Yes | `price_xxx` |
| `NEXT_PUBLIC_APP_URL` | App URL | Yes | `http://localhost:3000` |

## License

MIT
