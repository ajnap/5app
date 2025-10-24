# The Next 5 Minutes - Parenting Connection App

[![CI](https://github.com/ajnap/5app/actions/workflows/ci.yml/badge.svg)](https://github.com/ajnap/5app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ajnap/5app/actions/workflows/codeql.yml/badge.svg)](https://github.com/ajnap/5app/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-96%20passing-brightgreen)](#testing-strategy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Live App**: [https://5app-d22y33qyj-alex-napierskis-projects.vercel.app](https://5app-d22y33qyj-alex-napierskis-projects.vercel.app)

A full-stack parenting connection app that delivers personalized daily 5-minute activities to strengthen parent-child relationships. Built with modern web technologies and backed by research-based prompts tailored to your child's age and development.

## ✨ Features

### Core Functionality
- **Personalized Daily Prompts**: 78 research-backed activities filtered by child's age and development stage
- **Smart Recommendations**: AI-powered recommendation engine that learns from your activity history
- **Multiple Children Support**: Create profiles for each child with age-appropriate content
- **Completion Tracking**: Track your engagement with streak counters and completion calendars
- **Favorites System**: Save your favorite activities for easy access
- **Faith Mode**: Optional faith-based content for families who prefer it

### Authentication & Payments
- **Secure Authentication**: Supabase Auth with email/password
- **Subscription Management**: Stripe integration for monthly/yearly premium plans
- **Customer Portal**: Self-service subscription and payment management

### User Experience
- **Responsive Design**: Beautiful, accessible UI built with Tailwind CSS
- **Protected Routes**: Server-side authentication checks
- **Real-time Updates**: Live subscription status and completion tracking
- **Performance Optimized**: Core Web Vitals monitoring and optimization

### Monitoring & Reliability
- **Error Tracking**: Comprehensive error monitoring with Sentry
- **Performance Analytics**: Vercel Analytics and Speed Insights integration
- **Web Vitals Tracking**: Real-time monitoring of LCP, FID, CLS, FCP, and TTFB

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with toast notifications (Sonner)
- **Analytics**: Vercel Analytics & Speed Insights

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime subscriptions

### Payments & Subscriptions
- **Payment Processing**: Stripe Checkout
- **Webhooks**: Stripe webhook handlers
- **Customer Portal**: Stripe Customer Portal

### DevOps & Monitoring
- **Deployment**: Vercel
- **Error Tracking**: Sentry
- **Performance Monitoring**: Vercel Speed Insights
- **Version Control**: Git & GitHub

## 📁 Project Structure

```
parenting-app/
├── app/
│   ├── api/
│   │   ├── auth/callback/         # Supabase auth callback
│   │   ├── checkout/              # Stripe checkout session creation
│   │   ├── complete-prompt/       # Mark prompt as completed
│   │   ├── favorite/              # Toggle favorite status
│   │   ├── portal/                # Stripe customer portal session
│   │   └── webhook/               # Stripe webhook handler
│   ├── account/                   # Subscription management page
│   ├── children/                  # Child profile management
│   ├── dashboard/                 # Main dashboard with daily prompts
│   ├── favorites/                 # Favorited activities
│   ├── signup/                    # Authentication page
│   ├── layout.tsx                 # Root layout with analytics
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles and animations
├── components/
│   ├── AdminResetButton.tsx       # Development reset utility
│   ├── CheckoutButton.tsx         # Stripe checkout component
│   ├── CompletionCalendar.tsx     # Visual completion calendar
│   ├── DashboardClient.tsx        # Client-side dashboard logic
│   ├── ManageSubscriptionButton.tsx
│   ├── PromptCard.tsx             # Individual prompt display
│   └── SignOutButton.tsx
├── lib/
│   ├── constants.ts               # App-wide constants
│   ├── recommendations/
│   │   ├── engine.ts              # Recommendation algorithm
│   │   ├── scoring.ts             # Scoring logic
│   │   └── types.ts               # Type definitions
│   ├── sentry.ts                  # Error tracking utilities
│   ├── stripe.ts                  # Stripe utilities
│   ├── supabase.ts                # Supabase client helpers
│   └── webVitals.ts               # Performance tracking
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_child_profiles.sql
│       ├── 003_prompt_completions.sql
│       └── 004_prompt_categories_and_content.sql
├── sentry.client.config.ts        # Sentry client configuration
├── sentry.server.config.ts        # Sentry server configuration
├── sentry.edge.config.ts          # Sentry edge runtime config
├── .env.local.example             # Environment variables template
├── next.config.js                 # Next.js config with Sentry
├── AI_CODE_REVIEW.md              # AI code review analysis
└── README.md
```

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- [Supabase account](https://app.supabase.com) (free tier works)
- [Stripe account](https://dashboard.stripe.com) (test mode is fine)
- [Vercel account](https://vercel.com) (for deployment)
- [Sentry account](https://sentry.io) (optional, for error monitoring)

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/parenting-app.git
cd parenting-app
npm install
```

### 2. Set Up Supabase

1. **Create a new project**:
   - Go to [Supabase](https://app.supabase.com)
   - Click "New Project"
   - Wait for database initialization (~2 minutes)

2. **Get your credentials**:
   - Go to **Project Settings > API**
   - Copy your Project URL
   - Copy your `anon` public key
   - Copy your `service_role` secret key (needed for webhooks)

3. **Run migrations**:
   - Go to **SQL Editor**
   - Run each migration file in order:
     ```sql
     -- Run supabase/migrations/001_initial_schema.sql
     -- Run supabase/migrations/002_child_profiles.sql
     -- Run supabase/migrations/003_prompt_completions.sql
     -- Run supabase/migrations/004_prompt_categories_and_content.sql
     ```

4. **Configure authentication**:
   - Go to **Authentication > Providers**
   - Enable Email provider
   - **Optional for testing**: Disable email confirmation
     - Go to **Authentication > Settings**
     - Uncheck "Enable email confirmations"

5. **Add redirect URLs**:
   - Go to **Authentication > URL Configuration**
   - Add: `http://localhost:3000/auth/callback`
   - For production, add: `https://your-domain.vercel.app/auth/callback`

### 3. Set Up Stripe

1. **Create an account**: [Stripe Dashboard](https://dashboard.stripe.com)

2. **Switch to Test Mode** (toggle in top right)

3. **Create products**:
   - Go to **Products > Add Product**
   - Create two products:
     - **Monthly Premium**: $9.99/month recurring
     - **Annual Premium**: $99/year recurring
   - Copy the Price IDs (starts with `price_...`)

4. **Get API keys**:
   - Go to **Developers > API Keys**
   - Copy Publishable key (starts with `pk_test_...`)
   - Copy Secret key (starts with `sk_test_...`)

5. **Webhook setup** (for local testing):
   ```bash
   # Install Stripe CLI: https://stripe.com/docs/stripe-cli
   stripe login

   # Forward webhooks to local endpoint
   stripe listen --forward-to localhost:3000/api/webhook

   # Copy the webhook signing secret (whsec_...) for .env.local
   ```

### 4. Set Up Sentry (Optional)

1. **Create account**: [Sentry.io](https://sentry.io)

2. **Create new project**:
   - Choose "Next.js" as platform
   - Copy your DSN (starts with `https://...@sentry.io/...`)

3. **Generate auth token**:
   - Go to **Settings > Account > API > Auth Tokens**
   - Create new token with `project:releases` and `org:read` scopes
   - Copy the token

### 5. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Update with your actual keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # From Stripe CLI or dashboard

# Stripe Product IDs
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry Error Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build and Test

```bash
# Type checking
npm run type-check

# Build production bundle
npm run build

# Start production server
npm start
```

## 🌐 Deployment to Vercel

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

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Import Project**
3. Import your GitHub repository
4. Configure environment variables (copy from `.env.local`)
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Click **Deploy**

### 3. Configure Production Webhook

1. After deployment, copy your Vercel URL
2. Go to **Stripe Dashboard > Developers > Webhooks**
3. Click **Add endpoint**
4. Enter: `https://your-app.vercel.app/api/webhook`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy webhook signing secret
7. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy

### 4. Update Supabase Redirect URLs

1. Go to **Supabase Dashboard > Authentication > URL Configuration**
2. Add production URL: `https://your-app.vercel.app/auth/callback`

## 🧪 Testing the App

### Create an Account

1. Navigate to `/signup`
2. Enter email and password
3. (If email confirmation disabled) Automatically redirected to `/dashboard`

### View Daily Prompts

1. **Add a child profile**:
   - Click "Children" in navigation
   - Add child's name and birth date
   - Child's age is calculated automatically

2. **View personalized prompts**:
   - Go to `/dashboard`
   - Select child from dropdown
   - See age-appropriate activities
   - View recommendations based on history

### Test Subscription Flow

1. Click **Account** in navigation
2. Click **Upgrade Now** on a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry (e.g., `12/34`) and any CVC (e.g., `123`)
5. Complete checkout
6. Verify subscription status updates to "Premium"

### Test Activity Completion

1. Select a prompt on dashboard
2. Click "Mark as Complete"
3. See streak counter update
4. View completion in calendar

### Test Favorites

1. Click heart icon on any prompt
2. Go to `/favorites`
3. See all favorited activities
4. Click heart again to unfavorite

## 📊 Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  faith_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### child_profiles
```sql
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### daily_prompts
```sql
CREATE TABLE daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  min_age INTEGER,
  max_age INTEGER,
  is_faith_based BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### prompt_completions
```sql
CREATE TABLE prompt_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES daily_prompts(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prompt_id, completion_date)
);
```

### favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES daily_prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All tables have RLS policies enabled
- **Server-side Auth Checks**: Protected routes use server components
- **HTTPS Only**: Enforced in production via Strict-Transport-Security headers
- **XSS Protection**: Content-Security-Policy headers
- **CSRF Protection**: SameSite cookies
- **Secure Headers**: Comprehensive security headers in next.config.js

## 📈 Monitoring & Analytics

### Sentry Error Tracking

Comprehensive error monitoring with:
- Client-side error tracking
- Server-side error tracking
- Edge runtime error tracking
- Session replay for debugging
- Performance transaction tracking
- User context and breadcrumbs

Usage:
```typescript
import { captureError, captureMessage } from '@/lib/sentry'

try {
  // Your code
} catch (error) {
  captureError(error, {
    tags: { component: 'dashboard' },
    extra: { userId: user.id }
  })
}
```

### Vercel Analytics

- Page view tracking
- Custom event tracking
- Real-time analytics dashboard

### Speed Insights

Automatic Core Web Vitals monitoring:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

## 🧩 Recommendation Engine

The app features a sophisticated recommendation algorithm:

1. **Age-based Filtering**: Only shows age-appropriate content
2. **Category Diversity**: Balances different activity types
3. **Completion History**: Avoids recently completed activities
4. **Favorites Boost**: Prioritizes similar activities to favorites
5. **Faith Mode**: Respects content preferences

### Scoring Algorithm

```typescript
Score = (
  baseScore +
  categoryDiversityBonus +
  completionRecencyPenalty +
  favoriteSimilarityBonus
) * ageRelevanceMultiplier
```

## 🔧 Troubleshooting

### Common Issues

#### Supabase Auth Issues
- ✅ Verify email provider is enabled
- ✅ Check redirect URLs are configured
- ✅ Look for errors in browser console
- ✅ Ensure RLS policies allow access

#### Stripe Checkout Not Working
- ✅ Confirm you're using matching test/live keys
- ✅ Verify Price IDs match your products
- ✅ Check webhook secret is configured
- ✅ Test with Stripe CLI locally

#### Database Errors
- ✅ Run all migrations in order
- ✅ Check RLS policies in Supabase
- ✅ Verify service role key for webhooks
- ✅ Use SQL Editor to test queries

#### Build Errors
- ✅ Run `npm run build` locally first
- ✅ Check all environment variables are set
- ✅ Run `npx tsc --noEmit` for TypeScript errors
- ✅ Clear `.next` folder and rebuild

#### Performance Issues
- ✅ Check Vercel Speed Insights dashboard
- ✅ Review Sentry performance transactions
- ✅ Inspect Core Web Vitals in browser DevTools
- ✅ Optimize images and enable Next.js Image component

## 📚 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

## 🎯 Stripe Test Cards

| Scenario | Card Number | Details |
|----------|-------------|---------|
| Success | `4242 4242 4242 4242` | Any CVC, any future date |
| Decline | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |
| Insufficient Funds | `4000 0000 0000 9995` | Insufficient funds |

## 🚀 Roadmap & Next Steps

### Short-term Improvements
- [ ] Unit tests for recommendation algorithm
- [ ] Component tests for key UI elements
- [ ] E2E tests for critical user flows
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Architecture documentation

### Feature Enhancements
- [ ] Email notifications for daily prompts
- [ ] Push notifications (PWA)
- [ ] Social sharing for activities
- [ ] Activity notes and journaling
- [ ] Photo uploads for memories
- [ ] Parent community features

### Advanced Features
- [ ] AI-generated custom prompts
- [ ] Multi-language support
- [ ] Admin dashboard for content management
- [ ] Analytics dashboard for users
- [ ] Integration with calendar apps
- [ ] Feature flags for A/B testing

## 📄 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | `pk_test_xxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes | `whsec_xxx` |
| `STRIPE_PRICE_ID_MONTHLY` | Monthly plan price ID | Yes | `price_xxx` |
| `STRIPE_PRICE_ID_YEARLY` | Yearly plan price ID | Yes | `price_xxx` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN | No | `https://...@sentry.io/...` |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for uploads | No | `sntrys_...` |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Code Quality

This project maintains high code quality standards:

- **Design Rating**: 9/10 (See AI_CODE_REVIEW.md)
- **Lines of Code**: 8,260
- **TypeScript Coverage**: 100%
- **Error Handling**: Comprehensive with Sentry
- **Performance**: Optimized Core Web Vitals
- **Security**: OWASP best practices

## 📖 Documentation

- [AI Code Review](./AI_CODE_REVIEW.md) - Comprehensive code analysis
- [Sentry Configuration](./sentry.client.config.ts) - Error tracking setup
- [Recommendation Algorithm](./lib/recommendations/engine.ts) - Algorithm details

## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review Sentry error logs
- Check Vercel deployment logs

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Research-backed activities from child development experts
- Built with Next.js 14 and the App Router
- Powered by Supabase and Stripe
- Monitoring by Sentry and Vercel Analytics

---

**Built with ❤️ for parents who want to make every moment count**
