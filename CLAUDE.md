# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Next 5 Minutes** is a parenting connection app delivering personalized 5-minute activities to strengthen parent-child relationships. Built with Next.js 14 (App Router), Supabase (PostgreSQL + Auth), Stripe (payments), and Sentry (monitoring).

**Live App**: https://5app-d22y33qyj-alex-napierskis-projects.vercel.app

---

## Development Commands

### Running the App
```bash
npm run dev           # Start development server (localhost:3000)
npm run build         # Production build
npm start             # Start production server
```

### Testing
```bash
# Unit Tests (Jest)
npm test                    # Run all unit tests (45 tests)
npm run test:watch          # Watch mode for TDD
npm run test:coverage       # Coverage report

# E2E Tests (Playwright)
npm run test:e2e            # Run E2E tests (21 tests)
npm run test:e2e:ui         # Interactive UI mode
npm run test:e2e:headed     # Run with visible browser
npx playwright show-report  # View last test report

# Run specific tests
npm test -- score-calculator           # Unit test file
npm test -- __tests__/api/checkout     # Integration test
npx playwright test landing            # E2E test file
```

### Code Quality
```bash
npm run lint          # ESLint check
npm run type-check    # TypeScript validation (no emit)
```

### Local Stripe Testing
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook
# Copy webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET
```

---

## Architecture Patterns

### 1. Server Components First (Default)
Pages and components are **Server Components** by default. Use `'use client'` directive **only** when needed for:
- Interactive elements (buttons, forms, event handlers)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window)

**Server Component Example** (app/dashboard/page.tsx):
```typescript
export default async function DashboardPage() {
  // Direct database access on server
  const { data: children } = await supabase
    .from('child_profiles')
    .select('*')

  // Pass data to client component
  return <DashboardClient children={children} />
}
```

**Client Component Example** (components/DashboardClient.tsx):
```typescript
'use client'

export default function DashboardClient({ children }) {
  const [selected, setSelected] = useState(children[0])
  // ... interactive logic
}
```

### 2. API Routes for Mutations
All data mutations and external API calls go through Next.js API routes (`app/api/*/route.ts`):

**Standard API Route Pattern**:
```typescript
export async function POST(request: Request) {
  // 1. Parse and validate with Zod
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(formatZodError(validation.error), { status: 400 })
  }

  // 2. Authenticate (server-side session check)
  const session = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Business logic
  const result = await performOperation()

  // 4. Error handling with Sentry
  try {
    // ... operation
  } catch (error) {
    captureError(error, { tags: { component: 'api-name' } })
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  return NextResponse.json(result)
}
```

### 3. Protected Routes
Use server-side auth checks in Server Components (not middleware):
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  redirect(ROUTES.SIGNUP)
}
```

### 4. Database Access Patterns

**Supabase Client Creation**:
```typescript
// Server Component
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
    },
  }
)
```

**Row Level Security (RLS)**: All tables have RLS policies. The database enforces that users can only access their own data.

---

## Core Systems

### Recommendation Engine (lib/recommendations/)

**Location**: `lib/recommendations/engine.ts`

The recommendation system is the app's core feature. It generates personalized activity suggestions based on:
- Child's age (age categories filter)
- Completion history (category balance, recency)
- User preferences (favorites, faith mode)
- Engagement signals (reflection notes, duration)

**Algorithm Flow**:
1. Parallel data fetch (child, completions, prompts, favorites)
2. Category distribution analysis
3. Score calculation (70% category balance, 20% engagement, 10% filters)
4. Recency filtering (exclude if completed within 14 days)
5. Diversity selection (max 2 per category, max 2 per primary tag)

**Special Cases**:
- **New users** (< 3 completions): Starter recommendations (5-min "quick wins", diverse categories)
- **All prompts exhausted**: Greatest hits (favorites + high engagement)

**Scoring Weights**:
```typescript
totalScore = (categoryScore * 0.70) + (engagementScore * 0.20) + (filterScore * 0.10)
```

**Key Functions**:
- `generateRecommendations(request, supabase)` - Main entry point
- `analyzeCategoryDistribution(childId, completions)` - Find over/under-represented categories
- `calculatePromptScore(prompt, child, history, favorites, distribution)` - Score individual prompts
- `selectDiverseRecommendations(scoredPrompts, limit)` - Ensure variety

### Stripe Payment Flow

**Checkout** (app/api/checkout/route.ts):
1. Validate tier (monthly/yearly)
2. Get/create Stripe customer
3. Create checkout session
4. Return checkout URL

**Webhook** (app/api/webhook/route.ts):
- **CRITICAL**: Always verify Stripe signature before processing
- Handle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Use idempotency to prevent duplicate processing

**Customer Portal** (app/api/portal/route.ts):
- Self-service subscription management
- Stripe handles all UI and payment updates

### Authentication & Authorization

**Supabase Auth**:
- Email/password (bcrypt hashing automatic)
- JWT stored in httpOnly cookies (XSS protection)
- Session timeout: 7 days (configurable)

**Authorization**:
- Database-level security with Row Level Security (RLS)
- No authorization logic in application code
- Server-side auth checks in every protected route

### Error Handling & Monitoring

**Sentry Integration** (lib/sentry.ts):
```typescript
import { captureError, captureMessage, startSpan } from '@/lib/sentry'

try {
  await operation()
} catch (error) {
  captureError(error, {
    tags: { component: 'dashboard', operation: 'generate-recommendations' },
    extra: { childId, userId },
    user: { id: userId, email: user.email }
  })
  // Fallback behavior
}
```

**Performance Tracking**:
```typescript
const span = startSpan('generate-recommendations', 'function')
try {
  const result = await generateRecommendations(params)
  return result
} finally {
  span?.finish()
}
```

---

## Database Schema

**Key Tables**:
- `profiles` - User accounts (linked to auth.users)
- `child_profiles` - Child data (name, birth_date, interests, challenges)
- `daily_prompts` - Activity library (78 prompts)
- `prompt_completions` - Completion tracking (with streak calculation)
- `prompt_favorites` - Saved activities

**Database Functions**:
- `get_current_streak(p_user_id)` - Calculate consecutive completion days
- `get_total_completions(p_user_id)` - Count unique completion dates

**Indexes** (for query performance):
- `idx_completions_child_id` on `prompt_completions(child_id)`
- `idx_completions_user_id` on `prompt_completions(user_id)`
- `idx_completions_date` on `prompt_completions(completion_date)`
- `idx_prompts_category` on `daily_prompts(category)`

---

## Testing Strategy

### Test Pyramid (96 total tests)
```
         /\
        /E2\      E2E: 21 tests (Playwright)
       /----\     Integration: 37 tests (API routes with mocked Stripe/Supabase)
      /------\    Unit: 45 tests (Recommendation algorithm)
     /--------\
```

### Unit Tests (Jest)
**Location**: `lib/recommendations/__tests__/`

**Focus**: Recommendation algorithm logic in isolation

**Example**:
```typescript
describe('calculatePromptScore', () => {
  it('should boost underrepresented categories', async () => {
    const categoryDistribution = {
      stats: [{ category: 'Creativity', percentage: 0.05 }] // < 10%
    }
    const { categoryScore } = await calculatePromptScore(/* ... */)
    expect(categoryScore).toBe(100) // Boost
  })
})
```

### Integration Tests (Jest + MSW)
**Location**: `__tests__/api/`

**Focus**: API routes with mocked external services

**Pattern**:
```typescript
import { POST } from '@/app/api/checkout/route'
import { createMocks } from 'node-mocks-http'

jest.mock('@/lib/stripe')

describe('/api/checkout', () => {
  it('should create checkout session for authenticated user', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { tier: 'monthly' }
    })

    jest.spyOn(stripe.stripe.checkout.sessions, 'create').mockResolvedValue({
      url: 'https://checkout.stripe.com/session_123'
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests (Playwright)
**Location**: `e2e/`

**Focus**: Critical user flows in real browser

**Files**:
- `landing-and-navigation.spec.ts` - Landing page, navigation (5 tests)
- `authentication.spec.ts` - Auth flows, protected routes (7 tests)
- `accessibility.spec.ts` - A11y, responsive design (9 tests)

**Configuration**: `playwright.config.ts` auto-starts dev server

---

## Code Organization

### Directory Structure
```
app/
├── api/               # API routes (mutations only)
│   ├── checkout/      # Stripe checkout session
│   ├── webhook/       # Stripe webhooks
│   ├── portal/        # Customer portal
│   └── complete-prompt/
├── dashboard/         # Main app (Server Component)
├── children/          # Child profile management
├── account/           # Subscription management
└── signup/            # Authentication

components/            # Client Components ('use client')
├── DashboardClient.tsx
├── PromptCard.tsx
├── CompletionCalendar.tsx
└── CheckoutButton.tsx

lib/
├── recommendations/   # Core algorithm (domain-driven)
│   ├── engine.ts
│   ├── score-calculator.ts
│   ├── category-analyzer.ts
│   └── types.ts
├── stripe.ts          # Stripe utilities
├── supabase.ts        # Supabase client helpers
├── sentry.ts          # Error tracking
├── validation.ts      # Zod schemas
└── constants.ts       # App constants

supabase/migrations/   # Database schema
```

### Import Paths
Use `@/` alias for absolute imports:
```typescript
import { generateRecommendations } from '@/lib/recommendations/engine'
import DashboardClient from '@/components/DashboardClient'
```

---

## Environment Variables

**Required for Development**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

**Naming Convention**:
- `NEXT_PUBLIC_*` = Exposed to browser (safe to use client-side)
- Everything else = Server-only (never exposed)

---

## Common Workflows

### Adding a New Feature

1. **Database Changes**:
   - Create migration file: `supabase/migrations/00X_feature_name.sql`
   - Add RLS policies for security
   - Run migration in Supabase SQL Editor

2. **API Route** (if mutation needed):
   - Create `app/api/feature-name/route.ts`
   - Follow standard pattern (validate → auth → logic → response)
   - Add Zod schema to `lib/validation.ts`

3. **Server Component** (page):
   - Create `app/feature-name/page.tsx`
   - Fetch data server-side with Supabase
   - Pass to client component for interactivity

4. **Client Component**:
   - Create `components/FeatureClient.tsx`
   - Add `'use client'` directive
   - Handle user interactions

5. **Testing**:
   - Unit tests for business logic (`lib/**/__tests__/`)
   - Integration tests for API routes (`__tests__/api/`)
   - E2E tests for user flows (`e2e/`)

### Modifying Recommendation Algorithm

**Files to Update**:
- `lib/recommendations/engine.ts` - Main orchestration
- `lib/recommendations/score-calculator.ts` - Scoring logic
- `lib/recommendations/category-analyzer.ts` - Distribution analysis
- `lib/recommendations/types.ts` - TypeScript types

**Testing**:
```bash
npm run test:watch -- score-calculator
```

**Key Considerations**:
- Maintain 70/20/10 scoring weight balance (category/engagement/filters)
- Preserve diversity selection (max 2 per category)
- Handle special cases (new users, exhausted prompts)
- Update tests to match new behavior

### Debugging Stripe Webhooks

**Local Testing**:
1. Terminal 1: `npm run dev`
2. Terminal 2: `stripe listen --forward-to localhost:3000/api/webhook`
3. Copy webhook secret to `.env.local`
4. Trigger test events: `stripe trigger checkout.session.completed`

**Production Issues**:
- Check Sentry for webhook errors
- Verify signature in `app/api/webhook/route.ts`
- Check Stripe Dashboard → Developers → Webhooks for failed events

---

## Performance Considerations

### Server Components Benefits
- **No JavaScript shipped** for data fetching
- **Reduced bundle size** by 85% vs pure client-side
- **Faster initial page load** with SSR

### Optimization Techniques
1. **Parallel Queries**: Use `Promise.all()` for independent data fetches
2. **Database Indexes**: Ensure proper indexes on frequently queried columns
3. **Code Splitting**: Use `dynamic()` for heavy client components
4. **Edge Caching**: Vercel automatically caches static pages

### Future Optimizations
- **Redis Caching**: Cache recommendation results (TTL: 1 hour)
- **Materialized Views**: Pre-compute category distributions
- **Edge Functions**: Move recommendation engine to edge

---

## Common Pitfalls

### 1. Server vs Client Components
**Problem**: Using hooks in Server Component
```typescript
// ❌ Wrong - Server Component cannot use hooks
export default function Page() {
  const [state, setState] = useState(0) // Error!
}

// ✅ Correct - Add 'use client'
'use client'
export default function Page() {
  const [state, setState] = useState(0)
}
```

### 2. Authentication in Middleware
**Problem**: Using middleware for auth (performance overhead)
```typescript
// ❌ Avoid - Runs on every request
export function middleware(request: NextRequest) {
  const session = await getSession()
  if (!session) redirect('/signup')
}

// ✅ Correct - Server-side check in page
export default async function Page() {
  const session = await supabase.auth.getSession()
  if (!session.data.session) redirect('/signup')
}
```

### 3. API Routes Without Validation
**Problem**: Missing input validation
```typescript
// ❌ Wrong - No validation
export async function POST(request: Request) {
  const { tier } = await request.json() // Unsafe!
}

// ✅ Correct - Zod validation
export async function POST(request: Request) {
  const body = await request.json()
  const validation = checkoutSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(formatZodError(validation.error), { status: 400 })
  }
  const { tier } = validation.data
}
```

### 4. Stripe Webhook Security
**Problem**: Not verifying signature
```typescript
// ❌ CRITICAL - Never skip signature verification
const event = request.body // Unsafe!

// ✅ Correct - Always verify
const sig = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
```

---

## Additional Documentation

- **README.md** - Setup instructions, deployment guide, troubleshooting
- **ARCHITECTURE.md** - Deep technical architecture, data flow diagrams, design decisions
- **supabase/migrations/** - Database schema evolution

---

## Support

- **Sentry Dashboard**: Error tracking and performance monitoring
- **Vercel Dashboard**: Deployment logs, analytics, environment variables
- **Stripe Dashboard**: Payment events, webhooks, customer management
- **Supabase Dashboard**: Database queries, auth logs, RLS policies
