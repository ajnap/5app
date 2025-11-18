# The Next 5 Minutes - Architecture Diagram

## Overview

This document contains the complete architecture diagram for The Next 5 Minutes parenting app, showing how all components, services, and data flows work together.

## System Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph "User's Browser"
        UI[React UI Components]
        SC[Server Components]
        CC[Client Components]
    end

    subgraph "Vercel Edge Network"
        Edge[Edge Runtime]
        Middleware[Middleware - Cookie Refresh]
    end

    subgraph "Next.js Application - Vercel"
        subgraph "Pages - Server Side Rendering"
            Landing[Landing Page /]
            Dashboard[Dashboard /dashboard]
            ChildProfile[Child Profile /children/id/profile]
            ChildManage[Child Management /children]
            Account[Account /account]
            Signup[Sign Up /signup]
        end

        subgraph "API Routes - Backend Logic"
            AuthAPI[/api/auth - OAuth Callbacks]
            CheckoutAPI[/api/checkout - Create Sessions]
            WebhookAPI[/api/webhook - Stripe Events]
            PortalAPI[/api/portal - Customer Portal]
            PersonalizeAPI[/api/personalize-prompt - AI]
            CalendarAPI[/api/calendar/* - Google Cal]
        end

        subgraph "Business Logic - lib/"
            RecEngine[Recommendation Engine<br/>engine.ts]
            ScoreCalc[Score Calculator<br/>70/20/10 algorithm]
            Insights[Insights Calculator<br/>stats & analytics]
            TipsGen[Tips Generator<br/>personalized advice]
            StripeLib[Stripe Utilities]
            CalendarLib[Google Calendar Utils]
        end

        subgraph "UI Components - components/"
            ChildCard[ChildCard - Displays child]
            ReflectionModal[ReflectionModal - Capture notes]
            ChildCardGrid[ChildCardGrid - Grid layout]
            ConnectionInsights[ConnectionInsights - Stats]
            ActivityHistory[ActivityHistory - Timeline]
            PersonalizedTips[PersonalizedTips - Advice]
        end
    end

    subgraph "Supabase - Backend as a Service"
        subgraph "Authentication"
            SupaAuth[Supabase Auth<br/>JWT + httpOnly cookies]
        end

        subgraph "PostgreSQL Database"
            ProfilesTable[(profiles<br/>user accounts + subscriptions)]
            ChildrenTable[(child_profiles<br/>children data)]
            PromptsTable[(daily_prompts<br/>78 activities)]
            CompletionsTable[(prompt_completions<br/>activity history)]
            FavoritesTable[(prompt_favorites<br/>saved activities)]
            TokensTable[(google_oauth_tokens<br/>calendar access)]
        end

        subgraph "Row Level Security"
            RLS[RLS Policies<br/>user_id = auth.uid]
        end

        subgraph "Database Functions"
            StreakFunc[get_current_streak<br/>calculates consecutive days]
            CompletionFunc[get_total_completions<br/>counts unique dates]
        end
    end

    subgraph "External Services"
        Stripe[Stripe<br/>Payment Processing]
        OpenAI[OpenAI API<br/>AI Personalization]
        GoogleCal[Google Calendar API<br/>Event Integration]
        Sentry[Sentry<br/>Error Tracking]
        VercelAnalytics[Vercel Analytics<br/>Performance]
    end

    %% User Interactions
    UI -->|SSR Request| Edge
    Edge -->|Route| Middleware
    Middleware -->|Auth Check| Landing
    Middleware -->|Auth Check| Dashboard

    %% Dashboard Flow
    Dashboard -->|Fetch Data| SupaAuth
    Dashboard -->|Query Children| ChildrenTable
    Dashboard -->|Generate Recs| RecEngine
    RecEngine -->|Score Prompts| ScoreCalc
    RecEngine -->|Analyze History| CompletionsTable
    RecEngine -->|Check Favorites| FavoritesTable
    RecEngine -->|Return Top 5| Dashboard
    Dashboard -->|Calculate Stats| Insights
    Dashboard -->|Generate Tips| TipsGen
    Dashboard -->|Render| ChildCardGrid
    ChildCardGrid -->|Display Each| ChildCard

    %% Activity Completion Flow
    ChildCard -->|Start Activity| CC
    CC -->|Show Modal| ReflectionModal
    ReflectionModal -->|Submit| CompletionsTable
    CompletionsTable -->|Trigger| StreakFunc
    CompletionsTable -->|Update| Dashboard

    %% Child Profile Flow
    ChildProfile -->|Fetch Child| ChildrenTable
    ChildProfile -->|Get Insights| Insights
    Insights -->|Query Stats| CompletionsTable
    ChildProfile -->|Get Tips| TipsGen
    ChildProfile -->|Get Recs| RecEngine
    ChildProfile -->|Display| ConnectionInsights
    ChildProfile -->|Display| PersonalizedTips
    ChildProfile -->|Display| ActivityHistory

    %% Authentication Flow
    Signup -->|Sign Up| SupaAuth
    SupaAuth -->|Hash Password| ProfilesTable
    SupaAuth -->|Generate JWT| UI
    SupaAuth -->|Set Cookie| Edge

    %% Payment Flow
    Account -->|Upgrade Click| CheckoutAPI
    CheckoutAPI -->|Get/Create Customer| ProfilesTable
    CheckoutAPI -->|Create Session| Stripe
    Stripe -->|Redirect| UI
    Stripe -->|Payment Success| WebhookAPI
    WebhookAPI -->|Verify Signature| Stripe
    WebhookAPI -->|Update Status| ProfilesTable

    %% AI Personalization Flow
    Dashboard -->|Request Custom| PersonalizeAPI
    PersonalizeAPI -->|Send Prompt| OpenAI
    OpenAI -->|Return Custom| PersonalizeAPI
    PersonalizeAPI -->|Display| UI

    %% Calendar Integration Flow
    Dashboard -->|Connect Cal| CalendarAPI
    CalendarAPI -->|OAuth Flow| GoogleCal
    GoogleCal -->|Return Token| TokensTable
    CalendarAPI -->|Create Event| GoogleCal

    %% Error Tracking
    Dashboard -->|Capture Errors| Sentry
    CheckoutAPI -->|Log Issues| Sentry
    RecEngine -->|Track Performance| Sentry

    %% Security Layer
    RLS -->|Enforce| ProfilesTable
    RLS -->|Enforce| ChildrenTable
    RLS -->|Enforce| CompletionsTable
    RLS -->|Enforce| FavoritesTable
    RLS -->|Enforce| TokensTable

    %% Database Relationships
    ProfilesTable -.->|user_id| ChildrenTable
    ProfilesTable -.->|user_id| CompletionsTable
    ChildrenTable -.->|child_id| CompletionsTable
    PromptsTable -.->|prompt_id| CompletionsTable
    PromptsTable -.->|prompt_id| FavoritesTable

    style UI fill:#e1f5ff
    style SC fill:#e1f5ff
    style CC fill:#e1f5ff
    style RecEngine fill:#fff3cd
    style ScoreCalc fill:#fff3cd
    style Insights fill:#fff3cd
    style TipsGen fill:#fff3cd
    style SupaAuth fill:#d4edda
    style RLS fill:#d4edda
    style Stripe fill:#f8d7da
    style OpenAI fill:#f8d7da
    style GoogleCal fill:#f8d7da
    style Sentry fill:#f8d7da
```

## Key Data Flows

### 1. Initial Page Load
```
User Browser → Vercel Edge → Middleware (auth check) → Dashboard Page (SSR)
  → Supabase Auth (verify JWT)
  → Database Queries (parallel):
    - Get children
    - Get prompts
    - Get completions
    - Get streak
    - Get stats
  → Recommendation Engine (generate top 5 per child)
  → Render HTML → Send to Browser
```

### 2. Start Activity Flow
```
User clicks "Start Activity" on ChildCard
  → Client Component state update
  → Show ReflectionModal
  → User enters notes
  → Submit to Database
  → Insert into prompt_completions table
  → RLS verifies user_id
  → Database function updates streak
  → Page refresh (router.refresh())
  → Re-fetch all data
  → Recommendation engine recalculates
  → New recommendations displayed (excludes completed)
```

### 3. Payment Flow
```
User clicks "Upgrade" → /api/checkout
  → Get/Create Stripe customer
  → Create checkout session
  → Redirect to Stripe
  → User completes payment on Stripe
  → Stripe calls /api/webhook
  → Verify webhook signature
  → Update subscription_status in profiles table
  → User redirected back with success
```

### 4. Authentication Flow
```
User signs up → Supabase Auth
  → Hash password (bcrypt)
  → Store in auth.users
  → Generate JWT token
  → Set httpOnly cookie
  → Database trigger creates profile row
  → Redirect to /onboarding
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State**: React hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js (Vercel serverless)
- **API**: Next.js API Routes
- **Auth**: Supabase Auth (JWT)
- **Validation**: Zod schemas

### Database
- **Service**: Supabase (PostgreSQL)
- **Security**: Row Level Security (RLS)
- **Functions**: SQL stored procedures
- **Indexes**: B-tree on user_id, child_id, dates

### External Services
- **Hosting**: Vercel (Edge Network + Serverless)
- **Payments**: Stripe (SaaS billing)
- **AI**: OpenAI GPT-4
- **Calendar**: Google Calendar API
- **Monitoring**: Sentry + Vercel Analytics

## Security Layers

1. **Edge**: Middleware validates sessions via cookies
2. **Application**: Server-side auth checks before data access
3. **Database**: Row Level Security enforces user_id = auth.uid()
4. **API**: Webhook signature verification (Stripe)
5. **Input**: Zod validation on all user inputs

## Performance Optimizations

1. **Parallel Queries**: 5 database queries in Promise.all()
2. **Database Indexes**: Fast lookups on user_id, child_id
3. **Server Components**: Zero JavaScript for static content
4. **Edge Caching**: Static pages cached at CDN
5. **React.memo**: Prevent re-renders of ChildCard

## Scalability Considerations

- **Current**: Handles 100s of concurrent users
- **Bottleneck**: Recommendation engine (350ms avg)
- **Future**: Add Redis caching for recommendations
- **Database**: PostgreSQL can scale to 10,000+ users

## Deployment Architecture

```
GitHub (push) → Vercel (CI/CD) → Build → Deploy to Edge
  ↓
Environment Variables loaded
  ↓
Supabase connection established
  ↓
Stripe webhooks configured
  ↓
Sentry monitoring activated
  ↓
Production live at 5app-*.vercel.app
```

---

## How to Use This Diagram

1. **For Technical Interviews**: Walk through the complete flow from browser to database
2. **For Feature Planning**: Identify which components need changes
3. **For Debugging**: Trace the path of data to find issues
4. **For Onboarding**: Help new team members understand the system

## Rendering the Diagram

### Option 1: Mermaid Live Editor
1. Go to https://mermaid.live/
2. Copy the Mermaid code above
3. Paste into the editor
4. Export as PNG or SVG

### Option 2: VS Code Extension
1. Install "Markdown Preview Mermaid Support"
2. Open this file in VS Code
3. Click "Preview" button
4. Right-click diagram → Save as image

### Option 3: GitHub
1. Push this file to GitHub
2. View in GitHub (automatically renders Mermaid)
3. Take screenshot for presentations
