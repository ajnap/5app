# Dependency Mapping - The Next 5 Minutes

This document provides a comprehensive overview of all external services, libraries, API endpoints, database tables, and third-party integrations used in the parenting app. For each dependency, we explain its purpose and the impact (blast radius) if it fails.

---

## Table of Contents

1. [External Services (Infrastructure)](#1-external-services-infrastructure)
2. [Major Libraries & Packages](#2-major-libraries--packages)
3. [API Endpoints](#3-api-endpoints)
4. [Database Schema](#4-database-schema)
5. [Third-Party Integrations](#5-third-party-integrations)
6. [Environment Variables](#6-environment-variables)

---

## 1. External Services (Infrastructure)

### 1.1 Vercel (Hosting & Deployment)

**Purpose**:
- Hosts the Next.js application
- Provides serverless functions for API routes
- Handles automatic deployments from Git
- Manages environment variables
- Provides analytics and monitoring

**Blast Radius if Failed**:
- **CRITICAL - Total App Unavailable**: Entire application goes offline
- No user access to website or features
- All API endpoints become unreachable
- Cannot deploy updates or fixes
- Loss of all web traffic and analytics

**Mitigation**: Keep deployment logs, use Vercel status page for outage info, maintain local development environment

---

### 1.2 Supabase (Database & Authentication)

**Purpose**:
- PostgreSQL database for all application data
- User authentication (email/password)
- Row Level Security (RLS) policies
- Real-time subscriptions (not currently used)
- Database migrations and backups

**Blast Radius if Failed**:
- **CRITICAL - Complete App Failure**:
  - Users cannot log in or sign up
  - Cannot fetch any data (prompts, children, completions)
  - All mutations fail (saving favorites, completing activities)
  - Recommendation engine cannot access data
  - Subscription status checks fail
  - Database-backed features completely broken

**Mitigation**:
- Supabase has built-in database backups
- Point-in-time recovery available
- Consider read replicas for high availability
- Monitor Supabase status page

---

### 1.3 Stripe (Payment Processing)

**Purpose**:
- Subscription checkout sessions
- Payment processing for monthly/yearly tiers
- Customer portal for subscription management
- Webhook events for subscription lifecycle
- Revenue tracking and analytics

**Blast Radius if Failed**:
- **HIGH - Payment Features Down**:
  - New users cannot subscribe
  - Existing users cannot manage subscriptions (upgrade/downgrade/cancel)
  - Webhook events not received → subscription status out of sync
  - Cannot process refunds or handle payment failures
  - No new revenue generation
- **Existing subscriptions continue working** (free tier users unaffected)

**Mitigation**:
- Stripe has 99.99% uptime SLA
- Webhook events are retried automatically
- Customer portal is Stripe-hosted (separate from app)
- Monitor Stripe Dashboard for payment failures

---

### 1.4 Sentry (Error Tracking & Monitoring)

**Purpose**:
- Captures and reports application errors
- Performance monitoring (page load, API response times)
- User session replay
- Breadcrumb tracking for debugging
- Source map uploads for stack traces
- Alerts for critical errors

**Blast Radius if Failed**:
- **LOW - App Still Functions**:
  - Loss of error visibility (blind to bugs)
  - Cannot monitor performance regressions
  - Debugging production issues becomes harder
  - No alerts for critical failures
  - Miss opportunities to proactively fix issues
- **User experience unchanged**

**Mitigation**:
- Errors still logged to console in development
- Server logs available in Vercel
- Sentry has generous free tier
- Fallback to manual error reporting

---

### 1.5 OpenAI (AI Personalization)

**Purpose**:
- Personalizes activity prompts based on child profiles
- Uses GPT-3.5-turbo model
- Generates context-aware, child-specific activity text
- Applies parenting expertise and faith-centered values

**Blast Radius if Failed**:
- **MEDIUM - Degraded Experience**:
  - Personalization API (`/api/personalize-prompt`) returns original prompts
  - Users see generic activities instead of customized ones
  - Core app functionality continues (completions, favorites, streaks)
  - Recommendation engine unaffected
  - Users can still complete activities
- **Graceful fallback**: Code returns base prompt if AI fails

**Mitigation**:
- Built-in error handling with fallback to original text
- OpenAI has high reliability (99.9% uptime)
- Consider caching personalized prompts
- Monitor API usage and rate limits

---

### 1.6 Google Cloud Platform (Calendar Integration)

**Purpose**:
- Google Calendar API for creating events
- OAuth 2.0 authentication for calendar access
- Token refresh mechanism
- Calendar event management (create, list)

**Blast Radius if Failed**:
- **LOW - Optional Feature Only**:
  - Cannot create calendar events for activities
  - Cannot view upcoming connection events
  - OAuth flow fails (cannot connect calendar)
  - Token refresh fails → calendar disconnection
  - Core app features unaffected (activities, streaks, recommendations)

**Mitigation**:
- Calendar integration is optional feature
- Refresh tokens stored in database for auto-reconnection
- Error messages guide users to reconnect
- App fully functional without calendar

---

## 2. Major Libraries & Packages

### 2.1 Core Framework

#### Next.js (v16.0.0)
**Purpose**: React framework with App Router, server components, API routes
**Why Needed**: Foundation of entire application
**Blast Radius**: Complete app rebuild required if removed
**Used In**: All pages, components, API routes

#### React (v18) & React DOM
**Purpose**: UI library for component-based interface
**Why Needed**: Entire frontend built with React
**Blast Radius**: Total app rewrite required
**Used In**: All components, pages, client interactions

---

### 2.2 Authentication & Authorization

#### @supabase/supabase-js (v2.39.3)
**Purpose**: Supabase client for database queries and auth
**Why Needed**: All data access and user authentication
**Blast Radius**: Cannot fetch/mutate data, auth completely broken
**Used In**: All server components, API routes, data fetching

#### @supabase/ssr (v0.7.0)
**Purpose**: Server-side rendering support for Supabase
**Why Needed**: Secure cookie handling, session management
**Blast Radius**: Auth state lost, cannot maintain user sessions
**Used In**: Server components, middleware, auth flows

#### next-auth (v4.24.13)
**Purpose**: OAuth integration for Google Calendar
**Why Needed**: Handles Google OAuth flow, token management
**Blast Radius**: Calendar feature breaks, OAuth flow fails
**Used In**: `/api/auth/[...nextauth]`, Google Calendar integration

---

### 2.3 Payment Processing

#### stripe (v14.14.0)
**Purpose**: Server-side Stripe API for payments
**Why Needed**: Checkout sessions, webhooks, customer portal
**Blast Radius**: Cannot process payments or manage subscriptions
**Used In**: `/api/checkout`, `/api/webhook`, `/api/portal`

#### @stripe/stripe-js (v2.4.0)
**Purpose**: Client-side Stripe.js for secure payment forms
**Why Needed**: PCI-compliant payment collection
**Blast Radius**: Checkout flow breaks, cannot collect payment info
**Used In**: Checkout components, payment forms

---

### 2.4 AI & External APIs

#### openai (v6.8.1)
**Purpose**: OpenAI API client for GPT models
**Why Needed**: Activity personalization based on child profiles
**Blast Radius**: Personalization feature fails, falls back to generic prompts
**Used In**: `/api/personalize-prompt`, `lib/ai.ts`

#### googleapis (v166.0.0)
**Purpose**: Google APIs client (Calendar, OAuth)
**Why Needed**: Calendar event creation, OAuth token management
**Blast Radius**: Calendar integration completely broken
**Used In**: `lib/google-calendar.ts`, calendar API routes

---

### 2.5 Error Monitoring

#### @sentry/nextjs (v10.22.0)
**Purpose**: Error tracking, performance monitoring, session replay
**Why Needed**: Production debugging, error alerts, performance insights
**Blast Radius**: Loss of error visibility, harder debugging
**Used In**: All pages (instrumented), API routes, error boundaries

---

### 2.6 Utilities & Validation

#### zod (v4.1.12)
**Purpose**: Runtime schema validation for API requests
**Why Needed**: Prevents invalid data, type safety at runtime
**Blast Radius**: API routes vulnerable to malformed requests
**Used In**: All API routes, form validation, data parsing

#### date-fns (v4.1.0)
**Purpose**: Date manipulation and formatting
**Why Needed**: Streak calculations, date comparisons, calendar logic
**Blast Radius**: Date features broken (streaks, completion tracking)
**Used In**: Dashboard, recommendation engine, calendar

---

### 2.7 UI & User Experience

#### sonner (v2.0.7)
**Purpose**: Toast notifications for user feedback
**Why Needed**: Success/error messages, user action confirmation
**Blast Radius**: No visual feedback for actions, worse UX
**Used In**: All interactive components, form submissions

#### canvas-confetti (v1.9.3)
**Purpose**: Celebration animations for completed activities
**Why Needed**: Positive reinforcement, gamification
**Blast Radius**: No celebration effects, less engaging UX
**Used In**: Prompt completion flow

---

### 2.8 Monitoring & Analytics

#### @vercel/analytics (v1.5.0)
**Purpose**: Vercel-native web analytics (page views, events)
**Why Needed**: Track user behavior, feature usage
**Blast Radius**: Loss of usage analytics, no traffic data
**Used In**: Root layout, tracking wrapper

#### @vercel/speed-insights (v1.2.0)
**Purpose**: Real User Monitoring (RUM) for performance
**Why Needed**: Monitor page load times, Core Web Vitals
**Blast Radius**: No performance visibility
**Used In**: Root layout

#### web-vitals (v5.1.0)
**Purpose**: Measure Core Web Vitals (LCP, FID, CLS)
**Why Needed**: Performance monitoring, SEO insights
**Blast Radius**: Cannot track performance metrics
**Used In**: `lib/webVitals.ts`

---

### 2.9 Development & Testing

#### TypeScript (v5)
**Purpose**: Static type checking, improved DX
**Why Needed**: Catch bugs at compile time, better IDE support
**Blast Radius**: More runtime errors, harder to refactor
**Used In**: Entire codebase

#### Jest (v30.2.0)
**Purpose**: Unit and integration testing framework
**Why Needed**: Test recommendation algorithm, API routes
**Blast Radius**: No automated testing, higher bug risk
**Used In**: `__tests__/`, `lib/recommendations/__tests__/`

#### @playwright/test (v1.56.1)
**Purpose**: End-to-end testing in real browsers
**Why Needed**: Test critical user flows (auth, checkout, navigation)
**Blast Radius**: No E2E coverage, manual testing required
**Used In**: `e2e/` tests

#### ESLint (v8)
**Purpose**: Code linting, enforce style guide
**Why Needed**: Consistent code quality, catch common bugs
**Blast Radius**: Lower code quality, more bugs slip through
**Used In**: All `.ts/.tsx` files

---

## 3. API Endpoints

### 3.1 Authentication

#### `GET/POST /api/auth/[...nextauth]`
**Purpose**: NextAuth.js OAuth handler for Google Calendar
**Dependencies**: next-auth, Google OAuth, Supabase
**Failure Impact**: Cannot connect Google Calendar, OAuth flow breaks
**Data Flow**:
1. User clicks "Connect Calendar"
2. Redirects to Google OAuth consent
3. Receives access/refresh tokens
4. Stores tokens in `google_oauth_tokens` table

---

#### `GET /api/auth/callback`
**Purpose**: OAuth callback handler (legacy, may be unused)
**Dependencies**: Supabase
**Failure Impact**: Minimal (redirects handled by NextAuth)

---

### 3.2 Payments

#### `POST /api/checkout`
**Purpose**: Create Stripe checkout session for subscription
**Request**: `{ tier: 'monthly' | 'yearly' }`
**Response**: `{ url: string }` (Stripe checkout URL)
**Dependencies**: Stripe, Supabase (auth, customer lookup)
**Failure Impact**: Users cannot subscribe, no new revenue
**Data Flow**:
1. Validate tier with Zod
2. Authenticate user (session check)
3. Get/create Stripe customer
4. Create checkout session
5. Return redirect URL

---

#### `POST /api/webhook`
**Purpose**: Stripe webhook handler for subscription events
**Events Handled**:
- `checkout.session.completed` → Activate subscription
- `customer.subscription.updated` → Update status (active/inactive)
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_failed` → Mark inactive

**Dependencies**: Stripe, Supabase (admin client)
**Failure Impact**:
- Subscription status out of sync
- Users charged but not granted access
- Critical for revenue integrity

**Security**: Verifies Stripe signature before processing

---

#### `POST /api/portal`
**Purpose**: Create Stripe customer portal session
**Response**: `{ url: string }` (portal URL)
**Dependencies**: Stripe, Supabase (customer ID lookup)
**Failure Impact**: Users cannot manage subscriptions (cancel, update payment)
**Data Flow**:
1. Authenticate user
2. Fetch Stripe customer ID from profile
3. Create portal session
4. Return redirect URL

---

### 3.3 AI Features

#### `POST /api/personalize-prompt`
**Purpose**: Personalize activity with OpenAI based on child profile
**Request**: `{ promptId: string, childId: string }`
**Response**: `{ original: string, personalized: string, childName: string }`
**Dependencies**: OpenAI API, Supabase (prompts, child profiles)
**Failure Impact**: Falls back to original prompt, feature degrades gracefully
**Data Flow**:
1. Authenticate user
2. Fetch prompt and child profile
3. Build context from child data (interests, personality, age)
4. Call OpenAI GPT-3.5-turbo
5. Return personalized text

**Cost**: ~$0.0015 per personalization (150 tokens @ $0.001/1K)

---

### 3.4 Calendar Integration

#### `GET /api/calendar/status`
**Purpose**: Check if user has connected Google Calendar
**Response**: `{ connected: boolean }`
**Dependencies**: Supabase (token lookup)
**Failure Impact**: UI shows incorrect connection status
**Data Flow**:
1. Authenticate user
2. Query `google_oauth_tokens` table
3. Return connection status

---

#### `POST /api/calendar/create-event`
**Purpose**: Create Google Calendar event for activity
**Request**:
```json
{
  "childName": "Emma",
  "activityTitle": "Share a Gratitude",
  "activityDescription": "Ask your child what made them smile today",
  "scheduledTime": "2025-11-18T14:00:00Z",
  "estimatedMinutes": 5,
  "recurrence": {
    "frequency": "DAILY",
    "count": 7
  }
}
```
**Response**: `{ success: true, event: { id, htmlLink, summary, start, end } }`
**Dependencies**: Google Calendar API, Supabase (token refresh)
**Failure Impact**: Cannot schedule activities, manual calendar entry required
**Data Flow**:
1. Validate request with Zod
2. Get authenticated calendar client
3. Refresh token if expired
4. Create event with reminders
5. Return event details

---

#### `GET /api/calendar/upcoming-events`
**Purpose**: Fetch upcoming calendar events (for dashboard widget)
**Response**: Array of calendar events
**Dependencies**: Google Calendar API, Supabase
**Failure Impact**: Dashboard widget empty, no event visibility

---

#### `POST /api/calendar/disconnect`
**Purpose**: Remove Google Calendar connection (delete OAuth tokens)
**Response**: `{ success: true }`
**Dependencies**: Supabase
**Failure Impact**: Cannot disconnect, tokens persist

---

## 4. Database Schema

All tables use Row Level Security (RLS) to ensure users can only access their own data.

### 4.1 User & Profile Management

#### `profiles`
**Purpose**: User account data and subscription status
**Columns**:
- `id` (UUID, FK to auth.users) - Supabase auth user ID
- `email` (TEXT) - User email
- `subscription_status` (TEXT) - 'active', 'inactive', 'cancelled'
- `subscription_tier` (TEXT) - 'free', 'monthly', 'yearly'
- `stripe_customer_id` (TEXT) - Stripe customer ID
- `stripe_subscription_id` (TEXT) - Stripe subscription ID
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Dependencies**: Stripe (customer/subscription IDs), Supabase Auth (user ID)
**Failure Impact**: Cannot determine subscription access, auth breaks
**Relationships**: One-to-many with child_profiles, prompt_completions, favorites

**RLS Policies**: Users can only view/update own profile

---

#### `child_profiles`
**Purpose**: Store child information for personalization
**Columns**:
- `id` (UUID) - Primary key
- `user_id` (UUID, FK) - Parent user ID
- `name` (TEXT) - Child's name
- `birth_date` (DATE) - For age calculation
- `interests` (TEXT[]) - Array of interests (sports, reading, art)
- `personality_traits` (TEXT[]) - Shy, energetic, curious
- `strengths` (TEXT[]) - Creative, athletic, analytical
- `challenges_weaknesses` (TEXT[]) - Tantrums, screen time, homework
- `communication_style` (TEXT[]) - Words of affirmation, quality time
- `learning_style` (TEXT) - Visual, auditory, kinesthetic
- `favorite_activities` (TEXT[]) - Drawing, soccer, reading
- `motivators` (TEXT[]) - Praise, rewards, competition
- `best_time_of_day` (TEXT) - Morning, evening, after school
- `current_focus_areas` (TEXT[]) - Confidence, empathy, responsibility
- `connection_insights` (TEXT) - Free-form notes
- `developmental_goals` (TEXT[]) - Reading skills, social skills
- `social_preferences` (TEXT) - Introverted, extroverted
- `sensory_preferences` (TEXT) - Quiet spaces, active play
- `triggers_stressors` (TEXT[]) - Loud noises, transitions
- `special_considerations` (TEXT) - Allergies, medical conditions
- `photo_url` (TEXT) - Profile photo
- `notes` (TEXT) - Additional context

**Dependencies**: None (standalone profile data)
**Failure Impact**: Cannot personalize recommendations or AI prompts
**Relationships**: One user has many children

**Database Functions**:
- `calculate_age(birth_date)` → INTEGER
- `get_age_category(birth_date)` → 'infant', 'toddler', 'elementary', 'teen', 'young_adult'

---

### 4.2 Activity Content

#### `daily_prompts`
**Purpose**: Library of 5-minute connection activities
**Columns**:
- `id` (UUID) - Primary key
- `title` (TEXT) - Activity title (e.g., "Share a Gratitude")
- `description` (TEXT) - Why this activity matters
- `activity` (TEXT) - What to do (the prompt)
- `category` (TEXT) - Category for balance (Gratitude, Play, Learning)
- `age_categories` (TEXT[]) - Suitable ages ('all', 'toddler', 'elementary')
- `tags` (TEXT[]) - Primary/secondary tags for diversity
- `estimated_minutes` (INTEGER) - Default 5
- `date` (DATE) - Legacy, not actively used
- `created_at` (TIMESTAMPTZ)

**Dependencies**: None (static content, seeded in migrations)
**Failure Impact**: No activities to recommend, app unusable
**Relationships**: Many-to-many with users via completions/favorites

**RLS Policies**: All authenticated users can read prompts

**Current Count**: 78 research-backed prompts

---

### 4.3 User Activity Tracking

#### `prompt_completions`
**Purpose**: Track when users complete activities
**Columns**:
- `id` (UUID) - Primary key
- `user_id` (UUID, FK) - User who completed
- `child_id` (UUID, FK) - Child involved (nullable)
- `prompt_id` (UUID, FK) - Activity completed
- `completion_date` (DATE) - Date completed
- `completed_at` (TIMESTAMPTZ) - Exact timestamp
- `duration_minutes` (INTEGER) - How long it took (nullable)
- `notes` (TEXT) - Reflection notes (nullable)
- `created_at` (TIMESTAMPTZ)

**Dependencies**: daily_prompts, child_profiles, auth.users
**Failure Impact**: Cannot track progress, streaks, or history
**Relationships**: Belongs to user, child, prompt

**Database Functions**:
- `get_current_streak(user_id)` → INTEGER (consecutive days)
- `get_total_completions(user_id)` → INTEGER (unique dates)

**Indexes**: `user_id`, `child_id`, `completion_date`, `completed_at` for fast queries

**Note**: Multiple completions per day allowed (removed unique constraint)

---

#### `prompt_favorites`
**Purpose**: Bookmark activities that work well for family
**Columns**:
- `id` (UUID) - Primary key
- `user_id` (UUID, FK) - User who favorited
- `prompt_id` (UUID, FK) - Favorited prompt
- `created_at` (TIMESTAMPTZ)

**Dependencies**: daily_prompts, auth.users
**Failure Impact**: Cannot save favorites, lose "greatest hits" tracking
**Relationships**: Many-to-many user-prompt relationship

**Database Functions**:
- `is_favorited(user_id, prompt_id)` → BOOLEAN
- `get_favorite_count(prompt_id)` → INTEGER

**Indexes**: `user_id`, `prompt_id` for fast lookups

**Constraint**: UNIQUE(user_id, prompt_id) - prevent duplicates

---

### 4.4 Third-Party Integrations

#### `google_oauth_tokens`
**Purpose**: Store Google OAuth tokens for Calendar API
**Columns**:
- `id` (UUID) - Primary key
- `user_id` (UUID, FK) - Token owner
- `access_token` (TEXT) - Short-lived access token
- `refresh_token` (TEXT) - Long-lived refresh token
- `token_type` (TEXT) - 'Bearer'
- `expires_at` (BIGINT) - Token expiry timestamp (seconds)
- `scope` (TEXT) - Granted scopes (calendar.events)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Dependencies**: Google OAuth, next-auth
**Failure Impact**: Calendar integration stops working, cannot refresh tokens
**Relationships**: One-to-one with users

**Security**: RLS ensures users only access own tokens

**Token Refresh**: Automatic when expired, updates `access_token` and `expires_at`

---

### 4.5 Database Indexes (Performance)

Critical indexes for recommendation engine performance:

```sql
idx_completions_user_id         ON prompt_completions(user_id)
idx_completions_child_id        ON prompt_completions(child_id)
idx_completions_date            ON prompt_completions(completion_date)
idx_child_profiles_user_id      ON child_profiles(user_id)
idx_prompts_category            ON daily_prompts(category)
idx_favorites_user_id           ON prompt_favorites(user_id)
idx_favorites_prompt_id         ON prompt_favorites(prompt_id)
idx_oauth_tokens_user_id        ON google_oauth_tokens(user_id)
```

**Why Needed**:
- Recommendation engine queries 100+ rows per request
- Dashboard loads multiple tables simultaneously
- Without indexes: queries take 500ms+
- With indexes: queries take 50-100ms

**Blast Radius if Missing**:
- Slow page loads (2-3 seconds)
- Poor user experience
- Higher database CPU usage
- Potential timeouts on large datasets

---

## 5. Third-Party Integrations

### 5.1 Stripe Integration

**Components**:
1. **Checkout Flow**: `/api/checkout` → Stripe Checkout → `/account?success=true`
2. **Webhook Listener**: Stripe sends events to `/api/webhook`
3. **Customer Portal**: `/api/portal` → Stripe-hosted portal

**Data Sync**:
- Customer ID stored in `profiles.stripe_customer_id`
- Subscription ID in `profiles.stripe_subscription_id`
- Subscription status synced via webhooks

**Security**:
- Webhook signature verification (prevents spoofing)
- Idempotency handling (prevents duplicate processing)

**Failure Modes**:
- Webhook signature mismatch → Event rejected (prevents fraud)
- Webhook retry exhausted → Manual reconciliation needed
- Portal session expired → User creates new session

---

### 5.2 OpenAI Integration

**API**: OpenAI Chat Completions API (GPT-3.5-turbo)
**Usage**: Personalize activity prompts based on child profiles

**Prompt Engineering**:
- System prompt: Parenting expert with faith-centered values
- User prompt: Original activity + child context (interests, personality, age)
- Temperature: 0.9 (high creativity for variety)
- Max tokens: 150 (2-3 sentences)

**Cost Management**:
- Average tokens per request: 300 (input) + 100 (output) = 400 tokens
- Cost per request: ~$0.0004 (GPT-3.5-turbo @ $0.001/1K tokens)
- Monthly estimate (100 users, 10 personalizations/user): $4

**Error Handling**:
- Fallback to original prompt if API fails
- No retries (graceful degradation)
- Errors logged to Sentry

---

### 5.3 Google Calendar Integration

**APIs Used**:
- Google OAuth 2.0 (authorization)
- Google Calendar API v3 (event management)

**OAuth Scopes**:
- `openid email profile` (basic user info)
- `https://www.googleapis.com/auth/calendar.events` (create/read events)

**Token Management**:
- Access token: 1-hour expiry
- Refresh token: Long-lived (until revoked)
- Automatic refresh in `getCalendarClient()`

**Features**:
- Create events with 10-minute popup reminders
- Support recurring events (RRULE)
- Timezone-aware (currently hardcoded to America/Denver)

**Failure Modes**:
- Token expired + no refresh token → User must reconnect
- API quota exceeded → Rate limiting errors
- Calendar not found → Permission error

---

### 5.4 Sentry Integration

**Configuration**: `next.config.js` with `withSentryConfig()`

**Instrumentation**:
- Client-side: Browser errors, React errors
- Server-side: API route errors, SSR errors
- Edge: Middleware errors

**Features**:
- Source maps uploaded for readable stack traces
- React component annotations for debugging
- Session replay for error reproduction
- Performance monitoring (slow queries, API calls)
- Breadcrumbs (user actions leading to error)

**Privacy**:
- Source maps hidden from client bundles
- Sensitive data scrubbed (passwords, tokens)
- User IP anonymized

---

### 5.5 Vercel Analytics & Speed Insights

**Analytics**:
- Page views tracked automatically
- Custom events via `track()` function
- Privacy-friendly (no cookies)
- GDPR compliant

**Speed Insights**:
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Performance scores per page
- Alerts for regressions

**Why Important**:
- Understand feature usage
- Track conversion funnels (signup → subscription)
- Monitor performance impact of changes
- SEO insights (Core Web Vitals affect rankings)

---

## 6. Environment Variables

### 6.1 Required Variables (App Breaks Without These)

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Public anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY          # Admin key (server-only, for webhooks)
```
**Blast Radius**: Total app failure, no auth, no data access

---

#### Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # Client-side Stripe.js
STRIPE_SECRET_KEY                  # Server-side API calls
STRIPE_WEBHOOK_SECRET              # Webhook signature verification
STRIPE_PRICE_ID_MONTHLY            # Monthly subscription product
STRIPE_PRICE_ID_YEARLY             # Yearly subscription product
```
**Blast Radius**: Cannot process payments, webhooks fail (critical for revenue)

---

#### Google OAuth
```env
GOOGLE_CLIENT_ID                   # OAuth client ID
GOOGLE_CLIENT_SECRET               # OAuth secret
```
**Blast Radius**: Calendar integration completely broken

---

#### OpenAI
```env
OPENAI_API_KEY                     # API key for GPT models
```
**Blast Radius**: Personalization feature fails, degrades gracefully

---

#### Application
```env
NEXT_PUBLIC_APP_URL                # Base URL (for redirects, webhooks)
```
**Blast Radius**: Redirects fail, OAuth callbacks broken

---

### 6.2 Optional Variables (Nice to Have)

#### Sentry
```env
NEXT_PUBLIC_SENTRY_DSN             # Sentry project DSN
SENTRY_AUTH_TOKEN                  # For uploading source maps
```
**Blast Radius**: No error tracking, harder debugging (app still works)

---

### 6.3 Naming Convention

**`NEXT_PUBLIC_*`**: Exposed to browser (safe for client-side code)
- Examples: API URLs, public keys, feature flags

**No prefix**: Server-only (never exposed to client)
- Examples: Secret keys, admin tokens, service role keys

**Security Note**: Never use secret keys in client-side code. Next.js strips non-public env vars from browser bundles.

---

## Critical Dependencies Summary

### If Vercel Goes Down:
- **Impact**: 100% app unavailable
- **Users Affected**: All users
- **Revenue Impact**: Total loss during outage
- **Recovery Time**: Depends on Vercel (typically <1 hour)

### If Supabase Goes Down:
- **Impact**: 100% app unusable (auth + data)
- **Users Affected**: All users
- **Revenue Impact**: High (cannot onboard new subscribers)
- **Recovery Time**: Depends on Supabase (SLA: 99.9% uptime)

### If Stripe Goes Down:
- **Impact**: Payment features only
- **Users Affected**: New subscribers, subscription changes
- **Revenue Impact**: High (no new revenue)
- **Recovery Time**: Depends on Stripe (SLA: 99.99% uptime)

### If OpenAI Goes Down:
- **Impact**: Degraded personalization
- **Users Affected**: Users personalizing prompts
- **Revenue Impact**: Low (feature degrades gracefully)
- **Recovery Time**: Automatic when service restored

### If Google Calendar Goes Down:
- **Impact**: Optional feature only
- **Users Affected**: Users with calendar connected
- **Revenue Impact**: None (core app unaffected)
- **Recovery Time**: Automatic when service restored

### If Sentry Goes Down:
- **Impact**: No error tracking
- **Users Affected**: None (developers lose visibility)
- **Revenue Impact**: None (app fully functional)
- **Recovery Time**: No user impact

---

## Dependency Health Monitoring

### Recommended Monitoring

1. **Uptime Checks**: Ping endpoints every 5 minutes
   - `GET /` (homepage)
   - `GET /api/health` (add health check endpoint)

2. **Error Rate**: Alert if error rate >5% (Sentry)

3. **API Latency**: Alert if p95 latency >2 seconds (Vercel Analytics)

4. **Payment Success Rate**: Monitor webhook processing (Stripe Dashboard)

5. **Database Connections**: Monitor active connections (Supabase Dashboard)

### Status Pages to Monitor

- Vercel Status: https://www.vercel-status.com/
- Supabase Status: https://status.supabase.com/
- Stripe Status: https://status.stripe.com/
- OpenAI Status: https://status.openai.com/
- Google Cloud Status: https://status.cloud.google.com/

---

## Conclusion

This app has a well-designed dependency structure with graceful degradation:

- **Critical path**: Vercel + Supabase (auth + data)
- **Revenue path**: Stripe (must stay healthy)
- **Enhanced features**: OpenAI (personalizes), Google Calendar (schedules)
- **Observability**: Sentry (debugging), Vercel Analytics (insights)

All third-party services have >99.9% uptime SLAs, and the app gracefully handles failures where possible (OpenAI fallback, calendar as optional feature).

**Key Risk**: Database (Supabase) is single point of failure. Consider:
- Point-in-time recovery setup
- Regular database backups
- Read replicas for high availability (if scaling)

**Recommendation**: Add health check endpoint (`/api/health`) to verify Supabase and Stripe connectivity for proactive monitoring.
