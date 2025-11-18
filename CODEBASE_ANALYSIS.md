# Codebase Analysis: The Next 5 Minutes Parenting App

## Overview
This is a comprehensive breakdown of your parenting app's codebase. Think of this as your map to understanding where everything lives and why. By the end of this document, you'll know exactly where to look when you want to modify features, add new functionality, or debug issues.

**Total Lines of Code**: ~19,174 lines (excluding dependencies)
**Total TypeScript/JavaScript Files**: 114 files
**Tech Stack**: Next.js 16, React 18, TypeScript, Supabase (PostgreSQL), Stripe, Sentry

---

## Directory Structure: The Big Picture

Your app is organized into several main folders. Here's what each one does:

```
parenting-app/
├── app/              # Frontend pages and backend API routes (Next.js App Router)
├── components/       # Reusable UI building blocks
├── lib/              # Business logic and utilities (the "brain" of your app)
├── supabase/         # Database schema and migrations
├── e2e/              # End-to-end tests (simulating real user interactions)
├── __tests__/        # Unit and integration tests
├── public/           # Static files (images, icons, etc.)
└── [config files]    # Settings for various tools
```

---

## 1. The `app/` Directory - Your Frontend & Backend Home

The `app/` directory uses Next.js 14's App Router. This is the **most important** directory because it contains:
- **Pages** (what users see in their browser)
- **API Routes** (backend endpoints for handling data)

### 1.1 Frontend Pages (`app/*/page.tsx`)

These are the actual web pages users visit. Each `page.tsx` file creates a route:

| File Path | URL | Purpose | Type |
|-----------|-----|---------|------|
| `app/page.tsx` | `/` | Landing page - First thing visitors see | Server Component |
| `app/signup/page.tsx` | `/signup` | User registration and login | Server Component |
| `app/dashboard/page.tsx` | `/dashboard` | Main app hub - Shows daily prompts, recommendations | Server Component |
| `app/children/page.tsx` | `/children` | List of all child profiles | Server Component |
| `app/children/new/page.tsx` | `/children/new` | Create new child profile | Server Component |
| `app/children/[id]/page.tsx` | `/children/123` | View specific child's details (dynamic route) | Server Component |
| `app/children/[id]/profile/page.tsx` | `/children/123/profile` | Edit child profile information | Server Component |
| `app/favorites/page.tsx` | `/favorites` | Saved favorite activities | Server Component |
| `app/prompts/page.tsx` | `/prompts` | Browse all available prompts/activities | Server Component |
| `app/account/page.tsx` | `/account` | Subscription management | Server Component |
| `app/onboarding/page.tsx` | `/onboarding` | First-time user setup wizard | Server Component |

**Key Concept**: Most pages are **Server Components** (they run on the server first). This means:
- Faster initial load (HTML is pre-rendered)
- Better SEO (search engines can read the content)
- Direct database access (no API calls needed)
- Smaller JavaScript bundles sent to browser

### 1.2 Backend API Routes (`app/api/*/route.ts`)

These handle data mutations (create, update, delete) and external service integrations:

| File Path | Endpoint | Purpose | What It Does |
|-----------|----------|---------|--------------|
| **Authentication** |
| `app/api/auth/[...nextauth]/route.ts` | `/api/auth/*` | NextAuth.js handler | Manages Google OAuth login flow |
| `app/api/auth/callback/route.ts` | `/api/auth/callback` | OAuth redirect handler | Processes Google login responses |
| **Payments** |
| `app/api/checkout/route.ts` | `/api/checkout` | Stripe checkout | Creates payment session for subscription |
| `app/api/portal/route.ts` | `/api/portal` | Stripe customer portal | Opens self-service subscription management |
| `app/api/webhook/route.ts` | `/api/webhook` | Stripe webhook receiver | Listens for payment events (subscription created, cancelled, etc.) |
| **Calendar Integration** |
| `app/api/calendar/status/route.ts` | `/api/calendar/status` | Google Calendar status | Check if user connected calendar |
| `app/api/calendar/create-event/route.ts` | `/api/calendar/create-event` | Add calendar event | Creates activity reminder in Google Calendar |
| `app/api/calendar/upcoming-events/route.ts` | `/api/calendar/upcoming-events` | Fetch upcoming events | Retrieves user's calendar events |
| `app/api/calendar/disconnect/route.ts` | `/api/calendar/disconnect` | Disconnect calendar | Revokes Google Calendar access |
| **AI Features** |
| `app/api/personalize-prompt/route.ts` | `/api/personalize-prompt` | AI prompt customization | Uses OpenAI to personalize activities |

**Security Pattern**: Every API route follows this structure:
1. **Validate Input** (using Zod schemas) - Reject malformed data
2. **Authenticate** (check session) - Ensure user is logged in
3. **Authorize** (verify permissions) - Ensure user can access this resource
4. **Execute Logic** - Do the actual work
5. **Handle Errors** (with Sentry) - Log failures for debugging

### 1.3 Special Files in `app/`

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout wrapper - Defines site-wide HTML structure, fonts, metadata |
| `app/globals.css` | Global styles - Tailwind CSS base styles and custom CSS variables |
| `app/dashboard/loading.tsx` | Loading UI - Shows skeleton while dashboard data loads |
| `app/icon.tsx` | App icon (favicon) - Generates PNG icon for browser tabs |
| `app/apple-icon.tsx` | Apple touch icon - iOS home screen icon |
| `app/actions/completions.ts` | Server Actions - Marks prompts as complete (Next.js 14 feature) |

---

## 2. The `components/` Directory - Reusable UI Building Blocks

Components are like LEGO blocks - small, reusable pieces that combine to build pages. All 40 components are **Client Components** (marked with `'use client'`) because they need interactivity (buttons, forms, animations).

### 2.1 Component Organization (by Feature)

**Dashboard Components** (Main app interface):
- `DashboardClient.tsx` - Main dashboard orchestrator (manages child selection, recommendations)
- `RecommendationSection.tsx` - Display personalized activity suggestions
- `RecommendedPromptCard.tsx` - Individual recommendation card
- `TodaysPromptCard.tsx` - Featured daily prompt
- `StreakEncouragement.tsx` - Motivational streak tracker

**Child Profile Management**:
- `ChildProfileCard.tsx` - Display child info card
- `ChildForm.tsx` - Form for creating/editing child profiles
- `ChildCard.tsx` - Compact child card in grid
- `ChildCardGrid.tsx` - Grid layout for multiple children
- `ChildSelector.tsx` - Dropdown to switch between children
- `AddChildButton.tsx` - Call-to-action button
- `ChildDetailClient.tsx` - Child detail page wrapper
- `ChildGrowthStats.tsx` - Shows child's milestone progress

**Activity Completion**:
- `MarkCompleteButton.tsx` - Button to mark activity as done
- `ReflectionModal.tsx` - Post-activity reflection prompt
- `ActivityTimer.tsx` - Tracks activity duration
- `CompletionCalendar.tsx` - Visual calendar of completed activities
- `ActivityHistory.tsx` - List view of past completions

**Favorites & Library**:
- `FavoriteButton.tsx` - Heart icon to save favorites
- `FavoritesClient.tsx` - Favorites page wrapper
- `PromptsLibraryClient.tsx` - Browse all prompts interface

**Memory Features**:
- `MemoryModal.tsx` - Capture memorable moments
- `QuickMemoryButton.tsx` - Quick capture button
- `MemoryTimeline.tsx` - Chronological memory display

**Calendar Integration**:
- `CalendarConnection.tsx` - Google Calendar connect UI
- `UpcomingEvents.tsx` - Calendar widget showing upcoming events
- `AddEventModal.tsx` - Modal for creating calendar events

**Gamification**:
- `ConfettiCelebration.tsx` - Celebration animation (using canvas-confetti)
- `MilestoneCelebration.tsx` - Special milestone achievements

**Insights & Personalization**:
- `ConnectionInsights.tsx` - Analytics about parent-child connection
- `PersonalizedTips.tsx` - AI-generated parenting tips

**Payments**:
- `CheckoutButton.tsx` - Stripe checkout trigger
- `ManageSubscriptionButton.tsx` - Opens customer portal

**Onboarding**:
- `OnboardingFlow.tsx` - Multi-step first-time user guide

**Utility Components**:
- `LoadingSkeleton.tsx` - Generic loading placeholder
- `SkeletonPromptCard.tsx` - Prompt card skeleton
- `SkeletonChildProfile.tsx` - Child profile skeleton
- `EmptyState.tsx` - "No data" placeholder
- `ErrorBoundary.tsx` - Catches React errors gracefully
- `SignOutButton.tsx` - Logout button
- `AdminResetButton.tsx` - Admin tool (dev only)

### 2.2 Component Architecture Patterns

**Server-to-Client Data Flow**:
```
Server Component (page.tsx)
    ↓ Fetches data from database
    ↓ Passes as props
Client Component (ComponentName.tsx)
    ↓ Handles user interactions
    ↓ Makes API calls for mutations
```

**Example**:
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const children = await supabase.from('child_profiles').select('*')
  return <DashboardClient children={children} /> // Pass data down
}

// components/DashboardClient.tsx (Client Component)
'use client'
export default function DashboardClient({ children }) {
  const [selected, setSelected] = useState(children[0]) // Interactive state
  // ...
}
```

**Total Component Lines**: ~9,500 lines across 40 files

---

## 3. The `lib/` Directory - Business Logic Brain

This is where the "magic" happens. Think of `lib/` as the engine room - it contains all the core algorithms, utilities, and integrations.

### 3.1 Core Business Logic

**Recommendation System** (`lib/recommendations/`):
The app's most complex feature - generates personalized activity suggestions.

- `engine.ts` (Main orchestrator)
  - **What it does**: Combines all recommendation logic
  - **Key function**: `generateRecommendations(request, supabase)`
  - **How it works**:
    1. Fetch child data, completion history, all prompts, favorites
    2. Analyze which activity categories are over/under-represented
    3. Score each prompt based on multiple factors
    4. Select diverse top recommendations
  - **Lines**: ~300

- `score-calculator.ts` (Scoring algorithm)
  - **What it does**: Assigns numeric scores to each activity
  - **Scoring formula**:
    - 70% Category Balance (prefers under-represented categories)
    - 20% Engagement Score (prefers high-quality past interactions)
    - 10% Filter Score (age-appropriate, faith mode, recency)
  - **Key functions**: `calculatePromptScore()`, `applyAgeFilter()`, `applyRecencyFilter()`
  - **Lines**: ~250

- `category-analyzer.ts` (Category distribution)
  - **What it does**: Analyzes completion history to find patterns
  - **Prevents**: Recommendation fatigue by ensuring variety
  - **Key function**: `analyzeCategoryDistribution(childId, completions)`
  - **Lines**: ~150

- `types.ts` (TypeScript interfaces)
  - **What it does**: Type definitions for recommendation system
  - **Why it matters**: Ensures type safety across recommendation logic
  - **Lines**: ~100

**Insights & Analytics** (`lib/insights-calculator.ts`):
- Calculates connection metrics (average duration, favorite categories, consistency score)
- Powers the "Connection Insights" dashboard widget
- **Lines**: ~200

**AI Integration** (`lib/ai.ts`, `lib/tips-generator.ts`):
- `ai.ts`: OpenAI client configuration
- `tips-generator.ts`: Generates personalized parenting tips using GPT-4
- **Lines**: ~150 combined

### 3.2 External Service Integrations

**Payment Processing** (`lib/stripe.ts`):
- Stripe client initialization
- Customer management (`getOrCreateStripeCustomer()`)
- Subscription tier definitions (monthly: $4.99, yearly: $49.99)
- **Lines**: ~200

**Database Access** (`lib/supabase*.ts`):
- `supabase.ts`: Client-side Supabase client
- `supabase-server.ts`: Server-side Supabase client (for Server Components)
- `supabase-server-api.ts`: Server-side client for API routes
- **Why multiple files?**: Different environments require different cookie handling
- **Lines**: ~300 combined

**Google Calendar** (`lib/google-calendar.ts`, `lib/calendar.ts`):
- OAuth token management
- Calendar event creation/retrieval
- **Lines**: ~400 combined

**Error Tracking** (`lib/sentry.ts`):
- Sentry integration helpers
- Error capture with context (`captureError()`, `captureMessage()`)
- Performance monitoring (`startSpan()`)
- **Lines**: ~100

### 3.3 Utilities & Helpers

**Authentication** (`lib/auth.ts`):
- NextAuth.js configuration
- Google OAuth provider setup
- Session management
- **Lines**: ~150

**Validation** (`lib/validation.ts`):
- Zod schemas for API input validation
- Error formatting helpers
- **Critical for security**: Prevents malformed data from reaching database
- **Lines**: ~200

**Constants** (`lib/constants.ts`):
- App-wide constants (routes, subscription statuses, age ranges)
- Single source of truth for magic numbers
- **Lines**: ~100

**Custom Hooks** (`lib/hooks/usePromptRefresher.ts`):
- React hooks for common patterns (prompt refresh logic)
- **Lines**: ~50

**Performance Monitoring** (`lib/webVitals.ts`):
- Web Vitals tracking (Largest Contentful Paint, First Input Delay, etc.)
- Sends metrics to analytics
- **Lines**: ~50

**Event Types** (`lib/event-types.ts`):
- TypeScript types for calendar events
- **Lines**: ~50

**Total Library Code**: ~3,000 lines of pure business logic

---

## 4. The `supabase/` Directory - Database Schema

This directory defines your data structure. Think of it as the blueprint for your database.

### 4.1 Migration Files (`supabase/migrations/*.sql`)

Migrations are versioned database changes. Each file is numbered to show the order they were applied:

| File | What It Does | Key Tables Created |
|------|--------------|-------------------|
| `001_initial_schema.sql` | Foundation - Users, profiles, subscriptions | `profiles` |
| `002_prompt_completions.sql` | Track completed activities | `prompt_completions` |
| `003_child_profiles.sql` | Store child information | `child_profiles` |
| `004_prompt_categories_and_content.sql` | Activity library structure | `daily_prompts` (categories, tags) |
| `005_additional_realistic_prompts.sql` | More activity content | (data only) |
| `006_expert_research_based_prompts.sql` | 78 expert-designed prompts | (data only) |
| `007_prompt_completions.sql` | Completion tracking improvements | (schema updates) |
| `008_fix_prompt_completions_columns.sql` | Add reflection notes | `prompt_completions.reflection_notes` |
| `009_favorites.sql` | Favorite prompts feature | `prompt_favorites` |
| `010_demo_mvp_enhancements.sql` | Streak tracking, demo mode | Database functions |
| `011_activity_duration_tracking.sql` | Track how long activities take | `prompt_completions.duration_minutes` |
| `012_allow_multiple_daily_completions.sql` | Remove unique constraints | (constraint changes) |
| `013_check_and_remove_constraints.sql` | Clean up constraints | (constraint changes) |
| `014_remove_unique_constraints_safely.sql` | Safe constraint removal | (constraint changes) |
| `015_recommendation_indexes.sql` | Performance optimization | (indexes on foreign keys) |
| `016_memory_enhancements.sql` | Memory capture feature | `prompt_completions.memory_*` columns |
| `017_enhanced_child_profiles.sql` | Child interests, challenges | `child_profiles.interests`, `challenges` |
| `018_google_oauth_tokens.sql` | Calendar integration | `google_oauth_tokens` |

**Total Database Code**: ~2,000 lines of SQL

### 4.2 Key Database Tables

**Core Tables**:
1. **`profiles`** - User accounts (linked to Supabase Auth)
   - Columns: id, email, subscription_status, subscription_tier, stripe_customer_id, faith_mode

2. **`child_profiles`** - Children information
   - Columns: id, user_id, name, birth_date, interests, challenges, photo_url

3. **`daily_prompts`** - Activity library (78 prompts)
   - Columns: id, title, description, category, age_min, age_max, duration_minutes, tags, faith_based

4. **`prompt_completions`** - Completion tracking
   - Columns: id, user_id, child_id, prompt_id, completion_date, reflection_notes, duration_minutes, memory_text, memory_photo_url

5. **`prompt_favorites`** - Saved favorites
   - Columns: id, user_id, prompt_id, created_at

6. **`google_oauth_tokens`** - Calendar integration tokens
   - Columns: user_id, access_token, refresh_token, expiry_date

**Database Functions**:
- `get_current_streak(user_id)` - Calculate consecutive completion days
- `get_total_completions(user_id)` - Count unique completion dates

**Security**: All tables have Row Level Security (RLS) policies - users can only access their own data.

### 4.3 Other SQL Files

- `seed_prompts.sql` - Initial prompt data for testing
- `add_todays_prompt.sql` - Legacy helper script

---

## 5. The `__tests__/` Directory - Quality Assurance

Tests ensure your code works correctly. You have **96 total tests** across three types:

### 5.1 Unit Tests (45 tests) - Testing Individual Functions

Located in `lib/recommendations/__tests__/` and `lib/__tests__/`:

**Recommendation Engine Tests**:
- `score-calculator.test.ts` (25 tests)
  - Tests scoring algorithm in isolation
  - Examples: "Should boost underrepresented categories", "Should filter age-inappropriate prompts"

- `category-analyzer.test.ts` (15 tests)
  - Tests category distribution analysis
  - Examples: "Should detect overrepresented categories", "Should handle empty history"

**Insights Tests**:
- `insights-calculator.test.ts` (3 tests)
  - Tests analytics calculations

**Tips Generator Tests**:
- `tips-generator.test.ts` (2 tests)
  - Tests AI tip generation logic

**How to run**: `npm test` or `npm run test:watch` (auto-rerun on file changes)

### 5.2 Integration Tests (37 tests) - Testing API Routes

Located in `__tests__/api/`:

These test API routes with mocked external services (Stripe, Supabase):

- `checkout.test.ts` (15 tests)
  - Examples: "Should create checkout session", "Should reject unauthenticated users"

- `portal.test.ts` (10 tests)
  - Examples: "Should create portal session", "Should require authentication"

- `webhook.test.ts` (12 tests)
  - Examples: "Should handle subscription created", "Should verify webhook signature"

**Key Tool**: MSW (Mock Service Worker) - Intercepts HTTP requests for testing

**How to run**: `npm test` (same command as unit tests)

### 5.3 End-to-End Tests (21 tests) - Simulating Real Users

Located in `e2e/`:

Uses Playwright to control a real browser and test user flows:

- `landing-and-navigation.spec.ts` (5 tests)
  - Tests: Homepage loads, navigation works, CTA buttons present

- `authentication.spec.ts` (7 tests)
  - Tests: Login flow, signup flow, protected routes redirect

- `accessibility.spec.ts` (9 tests)
  - Tests: Keyboard navigation, screen reader support, WCAG compliance, mobile responsiveness

**How to run**:
- `npm run test:e2e` (headless)
- `npm run test:e2e:ui` (interactive debug mode)
- `npm run test:e2e:headed` (see browser)

**Total Test Code**: ~2,500 lines

---

## 6. Configuration Files - How Everything Fits Together

These files configure the tools your app uses:

### 6.1 TypeScript & JavaScript Configuration

**`tsconfig.json`** - TypeScript compiler settings
- Enables strict type checking (catches bugs at compile time)
- Configures path aliases (`@/` maps to project root)
- **Lines**: ~30

**`next.config.js`** - Next.js configuration
- Sentry plugin integration
- Image optimization settings
- Environment variable validation
- **Lines**: ~100

### 6.2 Testing Configuration

**`jest.config.js`** - Jest test runner settings
- Test environment: jsdom (simulates browser)
- Module path mapping (so `@/` works in tests)
- Coverage thresholds (minimum test coverage required)
- **Lines**: ~50

**`jest.setup.js`** - Jest setup file
- Testing Library matchers
- Global test utilities
- **Lines**: ~10

**`playwright.config.ts`** - Playwright E2E test settings
- Browser targets: Chromium, Firefox, WebKit
- Viewport sizes (desktop, mobile)
- Auto-start dev server before tests
- **Lines**: ~100

### 6.3 Styling Configuration

**`tailwind.config.ts`** - Tailwind CSS customization
- Custom color palette (primary, secondary, accent)
- Font family (Inter from Google Fonts)
- Custom animations
- **Lines**: ~150

**`postcss.config.js`** - PostCSS plugins
- Autoprefixer (adds browser-specific CSS prefixes)
- **Lines**: ~10

**`app/globals.css`** - Global CSS
- Tailwind base imports
- Custom CSS variables (colors, animations)
- Utility classes
- **Lines**: ~200

### 6.4 Code Quality Configuration

**`.prettierrc.json`** - Code formatting rules
- Consistent code style (semi-colons, quotes, indentation)
- **Lines**: ~10

**`eslint.config.js`** (or `.eslintrc.json`) - Linting rules
- Next.js recommended rules
- TypeScript best practices
- **Lines**: ~20

### 6.5 Monitoring Configuration

**`sentry.client.config.ts`** - Sentry browser monitoring
- Error tracking for frontend
- **Lines**: ~20

**`sentry.server.config.ts`** - Sentry server monitoring
- Error tracking for API routes
- **Lines**: ~20

**`sentry.edge.config.ts`** - Sentry edge monitoring
- Error tracking for edge functions
- **Lines**: ~20

**`instrumentation.ts`** - Sentry initialization
- Node.js instrumentation
- **Lines**: ~30

**`instrumentation-client.ts`** - Client-side instrumentation
- Browser instrumentation
- **Lines**: ~30

### 6.6 Environment Configuration

**`.env.local`** - Environment variables (NOT committed to git)
- Supabase keys
- Stripe keys
- OpenAI API key
- Google OAuth credentials
- Sentry DSN

**`.env.example`** / **`.env.local.example`** - Template for required env vars
- Safe to commit (no real keys)

**`.gitignore`** - Files excluded from git
- `node_modules/`, `.next/`, `.env.local`, coverage reports

### 6.7 Deployment Configuration

**`vercel.json`** (if exists) - Vercel deployment settings
- Build commands
- Environment variable settings

---

## 7. Documentation Files

Your project includes extensive documentation:

| File | Purpose | Who It's For |
|------|---------|--------------|
| `README.md` | Quick start guide | New developers joining project |
| `CLAUDE.md` | AI assistant instructions | Claude Code (this AI) |
| `ARCHITECTURE.md` | Deep technical architecture | Senior developers, system design discussions |
| `DEPLOYMENT.md` | Deployment guide | DevOps, production setup |
| `ROADMAP.md` | Feature planning | Product managers, stakeholders |
| `PRODUCT_ROADMAP.md` | Product strategy | Business team |
| `COMPLETE_FEATURE_ROADMAP.md` | Detailed feature specs | Development team |
| `VALIDATED_PRODUCT_STRATEGY.md` | Business validation | Founders, investors |
| `FEATURE_1_CHILD_PROFILES.md` | Child profiles spec | Feature development team |
| `MEMORY_FEATURES_GUIDE.md` | Memory feature docs | Developers working on memories |
| `CODE_REVIEW.md` | Code review findings | Quality assurance |
| `AI_CODE_REVIEW.md` | AI-generated review | Automated quality checks |
| `PROGRESS_REPORT.md` | Development progress | Project managers |
| `DEMO_PROGRESS.md` | Demo readiness | Sales/marketing |
| `WORK_SUMMARY.md` | Work log | Historical reference |
| `MIGRATION_VERIFICATION.md` | Database migration logs | Database administrators |
| `VERCEL_SETUP.md` | Vercel deployment guide | DevOps |
| `UPGRADE_SUMMARY.md` | Upgrade history | Maintenance team |

**Total Documentation**: ~18 files, ~5,000 lines

---

## 8. File Type Breakdown

Let's categorize every file in your project:

### 8.1 Frontend Files (User-Facing)

**Pages** (11 files):
- Landing, Signup, Dashboard, Children management, Favorites, Prompts library, Account, Onboarding

**Components** (40 files):
- All `.tsx` files in `components/` directory

**Styles** (1 file):
- `app/globals.css`

**Icons** (2 files):
- `app/icon.tsx`, `app/apple-icon.tsx`

**Total Frontend**: ~54 files, ~11,000 lines

### 8.2 Backend Files (Server-Side)

**API Routes** (10 files):
- Checkout, Portal, Webhook, Auth (2 files), Calendar (4 files), Personalize Prompt

**Server Actions** (1 file):
- `app/actions/completions.ts`

**Server Utilities** (2 files):
- `lib/supabase-server.ts`, `lib/supabase-server-api.ts`

**Total Backend**: ~13 files, ~2,000 lines

### 8.3 Business Logic Files (Domain Layer)

**Recommendation Engine** (4 files):
- `lib/recommendations/engine.ts`, `score-calculator.ts`, `category-analyzer.ts`, `types.ts`

**Insights & Analytics** (2 files):
- `lib/insights-calculator.ts`, `lib/tips-generator.ts`

**External Integrations** (4 files):
- `lib/stripe.ts`, `lib/google-calendar.ts`, `lib/calendar.ts`, `lib/ai.ts`

**Utilities** (5 files):
- `lib/auth.ts`, `lib/validation.ts`, `lib/constants.ts`, `lib/sentry.ts`, `lib/webVitals.ts`

**Total Business Logic**: ~15 files, ~3,000 lines

### 8.4 Database Files

**Migrations** (18 files):
- `supabase/migrations/*.sql`

**Seed Data** (2 files):
- `seed_prompts.sql`, `add_todays_prompt.sql`

**Total Database**: ~20 files, ~2,000 lines

### 8.5 Test Files

**Unit Tests** (4 files):
- Recommendation tests, insights tests, tips tests

**Integration Tests** (3 files):
- API route tests

**E2E Tests** (3 files):
- User flow tests

**Total Tests**: ~10 files, ~2,500 lines

### 8.6 Configuration Files

**Build Tools** (5 files):
- `next.config.js`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts`, `package.json`

**Testing** (3 files):
- `jest.config.js`, `jest.setup.js`, `playwright.config.ts`

**Code Quality** (2 files):
- `.prettierrc.json`, ESLint config

**Monitoring** (5 files):
- Sentry configs (3), instrumentation files (2)

**Environment** (3 files):
- `.env.example`, `.env.local.example`, `.gitignore`

**Total Configuration**: ~18 files, ~700 lines

### 8.7 Documentation Files

**Total**: 18 markdown files, ~5,000 lines

---

## 9. Code Architecture Patterns Explained

### 9.1 The Server Component Pattern

**What it is**: Next.js 14's default rendering strategy. Components run on the server first.

**When to use Server Components**:
- Fetching data from database
- Accessing environment variables
- Heavy computations (keeps client bundle small)

**Example**:
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('child_profiles').select('*')

  return <DashboardClient children={data} />
}
```

**When to use Client Components** (`'use client'` directive):
- User interactions (clicks, form inputs)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window, document)

**Example**:
```typescript
// components/FavoriteButton.tsx
'use client'

export default function FavoriteButton({ promptId }) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite)
    await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ promptId }) })
  }

  return <button onClick={toggleFavorite}>❤️</button>
}
```

### 9.2 The API Route Pattern

**Standard Flow**:
```typescript
export async function POST(request: Request) {
  // 1. Validate input
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // 2. Authenticate
  const session = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Execute business logic
  const result = await performOperation()

  // 4. Return response
  return NextResponse.json(result)
}
```

### 9.3 The Database Access Pattern

**Row Level Security (RLS)**:
- Database enforces security policies (not application code)
- Users automatically can only see their own data
- Prevents accidental data leaks

**Example Query**:
```typescript
// No manual filtering needed - RLS handles it
const { data } = await supabase
  .from('child_profiles')
  .select('*')
// Only returns children belonging to authenticated user
```

### 9.4 The Recommendation Engine Pattern

**Multi-Stage Algorithm**:
```
1. Parallel Data Fetch
   ├── Child info
   ├── Completion history
   ├── All prompts
   └── Favorites

2. Category Analysis
   └── Find over/under-represented categories

3. Scoring (per prompt)
   ├── Category Score (70%)
   ├── Engagement Score (20%)
   └── Filter Score (10%)

4. Diversity Selection
   ├── Max 2 per category
   ├── Max 2 per primary tag
   └── Exclude recent completions (14 days)

5. Return Top N
   └── Default: 5 recommendations
```

**Why this pattern?**:
- **Personalization**: Adapts to each child's history
- **Variety**: Prevents repetition fatigue
- **Quality**: Prioritizes high-engagement activities
- **Performance**: Parallel fetching reduces latency

---

## 10. How Data Flows Through the App

Let's trace a typical user interaction from click to database:

### Example: Marking a Prompt as Complete

**Step 1: User clicks "Mark Complete" button**
```typescript
// components/MarkCompleteButton.tsx (Client Component)
'use client'
export default function MarkCompleteButton({ promptId }) {
  const handleComplete = async () => {
    const response = await fetch('/api/complete-prompt', {
      method: 'POST',
      body: JSON.stringify({ promptId, childId })
    })
    // Show success message
  }

  return <button onClick={handleComplete}>✓ Complete</button>
}
```

**Step 2: Request hits API route**
```typescript
// app/api/complete-prompt/route.ts (API Route)
export async function POST(request: Request) {
  // Validate input
  const { promptId, childId } = await request.json()

  // Authenticate
  const session = await supabase.auth.getSession()

  // Insert completion
  await supabase.from('prompt_completions').insert({
    user_id: session.user.id,
    prompt_id: promptId,
    child_id: childId,
    completion_date: new Date()
  })

  return NextResponse.json({ success: true })
}
```

**Step 3: Database stores completion**
```sql
-- Supabase inserts row into prompt_completions table
INSERT INTO prompt_completions (user_id, prompt_id, child_id, completion_date)
VALUES ('user-123', 'prompt-456', 'child-789', '2025-11-18');

-- Row Level Security policy checks:
-- ✓ user_id matches authenticated user
```

**Step 4: Database function updates streak**
```sql
-- get_current_streak() function calculates consecutive days
SELECT get_current_streak('user-123'); -- Returns: 7
```

**Step 5: Frontend updates UI**
```typescript
// components/StreakEncouragement.tsx re-renders with new streak
<div>🔥 7-day streak!</div>
```

---

## 11. Key Metrics & Statistics

### Codebase Size
- **Total Lines**: ~19,174 (excluding dependencies)
- **TypeScript/JavaScript Files**: 114 files
- **SQL Files**: 20 files
- **Test Files**: 10 files (96 tests)
- **Documentation Files**: 18 markdown files

### File Breakdown by Type
- **Frontend Code**: ~11,000 lines (57%)
- **Business Logic**: ~3,000 lines (16%)
- **Tests**: ~2,500 lines (13%)
- **Database**: ~2,000 lines (10%)
- **Configuration**: ~700 lines (4%)

### Component Statistics
- **Pages**: 11 user-facing routes
- **API Routes**: 10 backend endpoints
- **React Components**: 40 reusable UI components
- **Database Tables**: 6 core tables
- **Migrations**: 18 database migrations

### Test Coverage
- **Unit Tests**: 45 tests (recommendation engine, insights)
- **Integration Tests**: 37 tests (API routes)
- **E2E Tests**: 21 tests (user flows)
- **Total**: 96 tests

### External Dependencies (package.json)
- **Production Dependencies**: 18 packages
  - React/Next.js ecosystem (5)
  - Database/Auth (3): Supabase, NextAuth
  - Payments (2): Stripe
  - AI (1): OpenAI
  - Monitoring (3): Sentry, Vercel Analytics
  - Utilities (4): Zod, date-fns, canvas-confetti, sonner

- **Development Dependencies**: 20 packages
  - Testing (7): Jest, Playwright, Testing Library
  - TypeScript (4): TypeScript, type definitions
  - Build Tools (5): Tailwind, PostCSS, Autoprefixer
  - Code Quality (4): ESLint, Prettier, MSW

---

## 12. Development Workflow: Where to Make Changes

### Scenario 1: "I want to add a new page"
1. Create `app/my-page/page.tsx` (Server Component)
2. Add route constant to `lib/constants.ts`
3. Create client component in `components/MyPageClient.tsx` if interactivity needed
4. Add navigation link in `app/layout.tsx` or relevant page
5. Write E2E test in `e2e/my-page.spec.ts`

### Scenario 2: "I want to add a new API endpoint"
1. Create `app/api/my-endpoint/route.ts`
2. Add Zod validation schema in `lib/validation.ts`
3. Add error constants to `lib/constants.ts`
4. Write integration test in `__tests__/api/my-endpoint.test.ts`
5. Call endpoint from client component using `fetch()`

### Scenario 3: "I want to modify the recommendation algorithm"
1. Edit `lib/recommendations/score-calculator.ts`
2. Update tests in `lib/recommendations/__tests__/score-calculator.test.ts`
3. Run `npm run test:watch` to verify tests pass
4. Document changes in `ARCHITECTURE.md`

### Scenario 4: "I want to add a database column"
1. Create new migration file `supabase/migrations/019_add_column.sql`
2. Write SQL: `ALTER TABLE table_name ADD COLUMN column_name type;`
3. Update RLS policies if needed
4. Run migration in Supabase SQL Editor
5. Update TypeScript types in relevant `lib/**/types.ts` files

### Scenario 5: "I want to create a new component"
1. Create `components/MyComponent.tsx`
2. Add `'use client'` directive if interactive
3. Import and use in parent page/component
4. Add unit test if complex logic (optional)
5. Test accessibility with E2E test

---

## 13. Common Beginner Questions Answered

### Q: "Why are there three Supabase client files?"
**A**: Different environments require different cookie handling:
- `lib/supabase.ts` - Client-side (browser)
- `lib/supabase-server.ts` - Server Components (pages)
- `lib/supabase-server-api.ts` - API routes

### Q: "What's the difference between a page and a component?"
**A**:
- **Page** (`app/*/page.tsx`) - Creates a URL route, entry point for users
- **Component** (`components/*.tsx`) - Reusable piece, used inside pages

### Q: "When should I use an API route vs a Server Component?"
**A**:
- **Server Component** - Reading data (GET requests)
- **API Route** - Mutating data (POST, PUT, DELETE requests), external API calls

### Q: "Why do some files have `.ts` and others `.tsx`?"
**A**:
- `.tsx` - Contains JSX/React components (HTML-like syntax)
- `.ts` - Pure TypeScript (no JSX)

### Q: "What is Row Level Security (RLS)?"
**A**: Database-level security that automatically filters queries based on authenticated user. You don't write `WHERE user_id = current_user` - the database does it for you.

### Q: "How do I know if a component should be Server or Client?"
**A**: Start with Server Component (default). Add `'use client'` only if you need:
- `useState`, `useEffect`, other React hooks
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

### Q: "What is a migration?"
**A**: A versioned database change. Like Git commits for your database schema. Never edit old migrations - always create new ones.

### Q: "Why are tests important?"
**A**:
- **Catch bugs** before users do
- **Document behavior** (tests are living documentation)
- **Enable refactoring** (change code safely)
- **Improve design** (hard-to-test code is often poorly designed)

---

## 14. Next Steps: Becoming a World-Class Engineer

### Beginner Level (Weeks 1-4)
1. **Read every file in this order**:
   - `app/page.tsx` (landing page)
   - `components/DashboardClient.tsx` (main app)
   - `app/api/checkout/route.ts` (simple API route)
   - `lib/constants.ts` (app constants)

2. **Modify existing features**:
   - Change button text
   - Add a new category to `daily_prompts`
   - Customize colors in `tailwind.config.ts`

3. **Write your first test**:
   - Start with E2E test (easiest to understand)
   - Copy `e2e/landing-and-navigation.spec.ts` pattern

### Intermediate Level (Months 2-3)
1. **Build small features**:
   - Add new API endpoint for custom feature
   - Create new page with database integration
   - Implement new component with state management

2. **Understand architecture patterns**:
   - Study recommendation engine (`lib/recommendations/`)
   - Learn API route patterns (validation → auth → logic)
   - Master Server vs Client component decisions

3. **Optimize performance**:
   - Add database indexes
   - Implement parallel data fetching
   - Use React profiler to find slow renders

### Advanced Level (Months 4-6)
1. **Design new systems**:
   - Architect notification system
   - Design real-time collaboration features
   - Build admin dashboard

2. **Improve existing systems**:
   - Optimize recommendation algorithm
   - Add caching layer (Redis)
   - Implement A/B testing framework

3. **Lead technical decisions**:
   - Choose new technologies (evaluate trade-offs)
   - Design database schema for new features
   - Establish coding standards for team

### Expert Level (Years 1-2)
1. **Scale the application**:
   - Handle 10,000+ concurrent users
   - Implement microservices where beneficial
   - Design multi-region deployment

2. **Mentor others**:
   - Code review rigorously
   - Write documentation for complex systems
   - Teach best practices to junior engineers

3. **Innovate**:
   - Research new patterns (Server Components, Suspense)
   - Contribute to open-source projects
   - Speak at conferences about your learnings

---

## 15. Resources for Learning

### Official Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs

### Testing
- **Jest**: https://jestjs.io/docs
- **Playwright**: https://playwright.dev
- **Testing Library**: https://testing-library.com

### Code Quality
- **ESLint**: https://eslint.org/docs
- **Prettier**: https://prettier.io/docs

### Advanced Topics
- **Database Design**: "Designing Data-Intensive Applications" (book)
- **System Design**: https://github.com/donnemartin/system-design-primer
- **React Performance**: https://react.dev/learn/render-and-commit

---

## Conclusion

You now have a complete map of your codebase. Here's the TL;DR:

**Frontend** (What users see):
- 11 pages in `app/*/page.tsx`
- 40 components in `components/`
- Styled with Tailwind CSS in `app/globals.css`

**Backend** (Server-side logic):
- 10 API routes in `app/api/*/route.ts`
- Business logic in `lib/`
- Database schema in `supabase/migrations/`

**Testing** (Quality assurance):
- 45 unit tests (algorithms)
- 37 integration tests (API routes)
- 21 E2E tests (user flows)

**Configuration** (Tools setup):
- Next.js, TypeScript, Tailwind, Jest, Playwright configs
- Sentry monitoring, Stripe payments, Supabase database

**Documentation** (Knowledge base):
- 18 markdown files covering architecture, deployment, features

**Total Codebase**: ~19,174 lines across 114 files

Start by reading files in small chunks. Run the app locally. Make tiny changes. Write tests. Read documentation. Ask questions. Repeat. In 6 months, you'll be building features confidently. In 2 years, you'll be designing systems. Keep learning!
