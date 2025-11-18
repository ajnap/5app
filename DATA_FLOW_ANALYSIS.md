# Data Flow Analysis - The Next 5 Minutes Parenting App

**For Beginners on the Fast Track to World-Class Engineering**

This document traces the complete journey of data through "The Next 5 Minutes" parenting app - from the moment a user opens their browser to completing an activity and seeing personalized recommendations. Think of this as following a single drop of water through an entire river system.

---

## Table of Contents
1. [Initial App Load - The Welcome Mat](#1-initial-app-load)
2. [Main User Action - Start Activity Flow](#2-main-user-action)
3. [Authentication Flow - The Bouncer](#3-authentication)
4. [Payment Processing Flow - The Cash Register](#4-payment-processing)
5. [Database Storage - The Filing Cabinet](#5-database-storage)

---

## 1. Initial App Load - The Welcome Mat

### What happens when a user first loads the app?

Think of this like walking into a restaurant: first the host checks if you have a reservation (authentication), then they seat you at your table (dashboard), and finally they bring you the menu (personalized recommendations).

#### Step 1: Browser Request (The Knock on the Door)
```
User types: https://5app-d22y33qyj-alex-napierskis-projects.vercel.app
Browser makes HTTP request to Vercel server
```

#### Step 2: Server-Side Authentication Check (The Bouncer)
**File:** `/Users/alexnapierski/490R/parenting-app/app/dashboard/page.tsx` (line 26-34)

```typescript
const supabase = await createServerClient()
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  redirect(ROUTES.SIGNUP) // Send them to sign-up page
}
```

**What's happening:**
- The server creates a Supabase client that can read cookies
- It checks if the user has a valid JWT (JSON Web Token) stored in an httpOnly cookie
- If no valid session: redirect to `/signup`
- If valid session: continue to next steps

**Why server-side?** Security! The server checks authentication before sending ANY data to the browser. Client-side checks can be bypassed by hackers.

#### Step 3: Parallel Data Fetching (The Information Gathering)
**File:** `/Users/alexnapierski/490R/parenting-app/app/dashboard/page.tsx` (lines 36-111)

The server fetches 5 things AT THE SAME TIME (parallel queries for speed):

```typescript
// 1. Get user's subscription and settings
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status, subscription_tier, faith_mode')
  .eq('id', session.user.id)
  .single()

// 2. Get all children for this user
const { data: childrenData } = await supabase
  .from('child_profiles')
  .select('*')
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: true })

// 3. Get all available activities
const { data: promptsData } = await supabase
  .from('daily_prompts')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50)

// 4. Check if user completed today
const { data: completedTodayData } = await supabase
  .from('prompt_completions')
  .select('id')
  .eq('user_id', session.user.id)
  .eq('prompt_id', todaysPromptId)
  .eq('completion_date', localDateString)

// 5. Get user's streak count
const { data: streakData } = await supabase
  .rpc('get_current_streak', { p_user_id: session.user.id })
```

**How does Supabase work?**
- Each `.from('table_name')` creates a SQL query
- `.select('*')` means "get all columns"
- `.eq('column', value)` adds a WHERE clause: `WHERE column = value`
- Database enforces Row Level Security (RLS) - users can ONLY see their own data

**Database Tables Involved:**
- `profiles` - User account info (subscription, settings)
- `child_profiles` - Children's names, ages, interests
- `daily_prompts` - Library of 78 activities
- `prompt_completions` - History of completed activities

#### Step 4: Generate Personalized Recommendations (The Magic Algorithm)
**File:** `/Users/alexnapierski/490R/parenting-app/app/dashboard/page.tsx` (lines 124-163)

For EACH child, the server runs the recommendation engine:

```typescript
for (const child of children) {
  const recommendations = await generateRecommendations(
    {
      userId: session.user.id,
      childId: child.id,
      faithMode,
      limit: 5
    },
    supabase
  )
  recommendationsMap[child.id] = recommendations
}
```

**The Recommendation Engine Deep Dive:**
**File:** `/Users/alexnapierski/490R/parenting-app/lib/recommendations/engine.ts`

This is the app's secret sauce! Here's what happens:

**Step 4.1: Fetch Child's History** (lines 58-63)
```typescript
const [child, completionHistory, allPrompts, favorites] = await Promise.all([
  fetchChild(childId, supabase),           // Get child age
  fetchCompletionHistory(childId, supabase), // Last 100 activities
  fetchAllPrompts(supabase),                // All 78 prompts
  fetchFavorites(userId, supabase)          // User's favorite prompts
])
```

**Step 4.2: Analyze What They've Been Doing** (lines 86-89)
```typescript
const categoryDistribution = await analyzeCategoryDistribution(
  childId,
  completionHistory
)
```

This calculates:
- How many activities in each category (Connection: 40%, Learning: 20%, etc.)
- Which categories are UNDER-represented (need more)
- Which categories are OVER-represented (done too much)

**Step 4.3: Filter Out Ineligible Activities** (lines 139-167)
```typescript
const eligiblePrompts = allPrompts.filter(prompt => {
  // Age filter: Is this activity age-appropriate?
  if (!applyAgeFilter(prompt, child.age)) return false

  // Recency filter: Did they do this in last 14 days?
  if (!applyRecencyFilter(prompt, completionHistory, 14)) return false

  return true
})
```

**Step 4.4: Score Each Activity** (lines 210-230)
```typescript
const scoredPrompts = await Promise.all(
  eligiblePrompts.map(async (prompt) => {
    const scoreComponents = await calculatePromptScore(
      prompt,
      child,
      completionHistory,
      favorites,
      categoryDistribution
    )

    const finalScore = scoreComponents.totalScore * recencyMultiplier

    return { prompt, score: finalScore, reasons: scoreComponents.reasons }
  })
)
```

**Scoring Formula (70/20/10 weighting):**
```
Total Score = (Category Balance × 0.70) + (Engagement × 0.20) + (Filters × 0.10)

Category Balance (70%):
  - Underrepresented category: +100 points
  - Neutral category: +50 points
  - Overrepresented category: -50 points

Engagement (20%):
  - Is a favorite: +100 points
  - High engagement history: +80 points

Filters (10%):
  - Matches faith mode: +50 points
  - Age appropriate: +50 points
```

**Step 4.5: Select Top 5 with Diversity** (lines 362-401)
```typescript
function selectDiverseRecommendations(scoredPrompts, limit) {
  const selected = []
  const usedCategories = new Map()
  const usedPrimaryTags = new Map()

  for (const scored of scoredPrompts) {
    // Max 2 from same category
    const categoryCount = usedCategories.get(category) || 0
    if (categoryCount >= 2) continue

    // Max 2 with same primary tag
    const tagCount = usedPrimaryTags.get(primaryTag) || 0
    if (tagCount >= 2) continue

    selected.push(scored)
  }

  return selected
}
```

This ensures variety - not all 5 recommendations from "Learning" category!

#### Step 5: Render HTML on Server (The Kitchen Preparing Your Meal)
**File:** `/Users/alexnapierski/490R/parenting-app/app/dashboard/page.tsx` (lines 171-312)

The server generates the HTML with all the data embedded:

```typescript
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50...">
    <nav>...</nav>

    {/* Progress Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div>🔥 {currentStreak} Day Streak</div>
      <div>✅ {totalCompletions} Activities</div>
      <div>⏱️ {weeklyMinutes} Minutes This Week</div>
    </div>

    {/* Pass everything to client component */}
    <DashboardClient
      children={children}
      prompts={prompts}
      recommendationsMap={recommendationsMap}
      userId={session.user.id}
    />
  </div>
)
```

#### Step 6: Send to Browser (The Waiter Delivers Your Food)
```
Server → Browser:
- HTML with pre-rendered content
- JavaScript for interactivity
- CSS for styling
- Data embedded in props
```

The user sees:
- Their streak count (🔥 5 Day Streak)
- Total completions (✅ 23 Activities)
- Child cards with personalized recommendations

**Performance Note:** The user sees the page in ~500ms because:
1. Server-side rendering (SSR) - HTML is ready immediately
2. Parallel database queries - everything fetched at once
3. Smart caching - Vercel caches static parts

---

## 2. Main User Action - Start Activity Flow

### The Complete Journey: User clicks "Start Activity" → Completes it → Sees updated recommendations

This is like ordering food at a restaurant: you tell the waiter (client), they relay to the kitchen (server), the kitchen updates inventory (database), and you get confirmation.

#### Step 1: User Clicks "Start Activity" Button
**File:** `/Users/alexnapierski/490R/parenting-app/components/ChildCard.tsx` (lines 58-69)

```typescript
const handleStart = (e: React.MouseEvent) => {
  e.stopPropagation() // Don't trigger card click

  if (!currentPrompt || completedToday) return

  setIsStarting(true) // Show loading spinner
  onStartActivity(currentPrompt.id, child.id)

  setTimeout(() => setIsStarting(false), 1000)
}
```

**What happens:**
1. Button shows loading spinner
2. Calls parent component's `onStartActivity` function
3. Passes: `promptId` (which activity) and `childId` (which child)

#### Step 2: Trigger Celebrations and Open Modal
**File:** `/Users/alexnapierski/490R/parenting-app/components/DashboardClient.tsx` (lines 71-96)

```typescript
const handleStartActivity = (promptId: string, childId: string) => {
  setCompletingPromptId(promptId)
  setCompletingChildId(childId)

  // Show confetti animation
  setShowConfetti(true)

  // Check for milestones
  const isFirstCompletion = totalCompletions === 0
  const detectedMilestone = detectMilestone(currentStreak + 1, isFirstCompletion)

  if (detectedMilestone) {
    // Show milestone celebration modal
    setMilestone(detectedMilestone)
    setMilestoneOpen(true)

    // Delay reflection modal by 4.5 seconds
    setTimeout(() => setReflectionOpen(true), 4500)
  } else {
    // Open reflection modal immediately
    setReflectionOpen(true)
  }
}
```

**User sees:**
1. Confetti animation (visual celebration)
2. Milestone modal (if it's their 1st, 3rd, 7th, 30th, etc. completion)
3. Reflection modal (to capture notes)

#### Step 3: User Writes Reflection and Clicks "Save & Complete"
**File:** `/Users/alexnapierski/490R/parenting-app/components/ReflectionModal.tsx` (lines 62-105)

```typescript
const handleSubmit = async (includeNote: boolean) => {
  setIsSubmitting(true)

  try {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 2. Insert completion record
    const { error: insertError } = await supabase
      .from('prompt_completions')
      .insert({
        user_id: user.id,
        prompt_id: promptId,
        child_id: childId,
        completed_at: new Date().toISOString(),
        reflection_note: includeNote ? reflectionNote.trim() : null,
        duration_seconds: durationSeconds || null,
      })

    if (insertError) throw insertError

    // 3. Call parent completion handler
    await onComplete(reflectionNote)

    // 4. Show success toast
    toast.success('Activity completed! 🎉')

    // 5. Close modal
    onClose()
  } catch (err) {
    toast.error('Failed to save')
  }
}
```

**What happens:**
1. **Authentication Check:** Verify user is still logged in
2. **Database Insert:** Add new row to `prompt_completions` table
3. **UI Update:** Show success toast notification
4. **Modal Close:** Hide the reflection modal

#### Step 4: Database Insertion (What Actually Gets Saved)
**Database Table:** `prompt_completions`
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/002_prompt_completions.sql`

```sql
CREATE TABLE prompt_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,           -- Who completed it
  prompt_id UUID NOT NULL,          -- Which activity
  child_id UUID,                    -- Which child
  completed_at TIMESTAMP,           -- When (exact time)
  completion_date DATE,             -- Which day (for streak calculation)
  reflection_note TEXT,             -- User's notes (optional)
  duration_seconds INTEGER,         -- How long it took
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example row inserted:**
```json
{
  "id": "a1b2c3d4-...",
  "user_id": "user-uuid-here",
  "prompt_id": "prompt-xyz-123",
  "child_id": "child-abc-789",
  "completed_at": "2025-11-18T14:30:00Z",
  "completion_date": "2025-11-18",
  "reflection_note": "She loved this! We talked about her favorite animals.",
  "duration_seconds": 420,  // 7 minutes
  "created_at": "2025-11-18T14:30:00Z"
}
```

**Row Level Security (RLS) Check:**
Before insertion, PostgreSQL runs:
```sql
-- From migration file
CREATE POLICY "Users can insert own completions"
  ON prompt_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

This ensures:
- Users can ONLY insert completions for themselves
- Can't fake completions for other users
- Database enforces security (not application code)

#### Step 5: Refresh Dashboard to See Updated Data
**File:** `/Users/alexnapierski/490R/parenting-app/components/ReflectionModal.tsx` (line 88)
**File:** `/Users/alexnapierski/490R/parenting-app/components/DashboardClient.tsx` (lines 66-68)

```typescript
const handleReflectionComplete = async (notes?: string) => {
  router.refresh() // Trigger full page re-render
}
```

**What `router.refresh()` does:**
1. Tells Next.js to re-run the server component
2. Fetches fresh data from database (new streak, new completions count)
3. Re-generates recommendations (excluding the just-completed activity)
4. Sends updated HTML to browser
5. React replaces old content with new content

**The Circle Completes:**

```
User clicks "Start"
  → Celebration animations play
    → Reflection modal opens
      → User writes note, clicks "Save"
        → Database inserts completion record
          → Row Level Security enforces user can only save their own data
            → Page refreshes
              → Server re-fetches data
                → Recommendation engine recalculates
                  → User sees:
                    - Updated streak count (🔥 6 Day Streak!)
                    - Updated total (✅ 24 Activities!)
                    - New recommendations (excluding completed activity)
                    - That activity won't appear again for 14 days
```

#### Step 6: What Changed in the Database?

**Before completing activity:**
```sql
SELECT * FROM prompt_completions WHERE user_id = 'user-123';
-- Returns: 23 rows

SELECT get_current_streak('user-123');
-- Returns: 5
```

**After completing activity:**
```sql
SELECT * FROM prompt_completions WHERE user_id = 'user-123';
-- Returns: 24 rows (new completion added)

SELECT get_current_streak('user-123');
-- Returns: 6 (if completed today, streak increases)
```

**Streak Calculation (Database Function):**
The `get_current_streak` function counts consecutive days:

```sql
CREATE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Loop through days backwards
  LOOP
    -- Check if user completed an activity on current_date
    IF EXISTS (
      SELECT 1 FROM prompt_completions
      WHERE user_id = p_user_id
      AND completion_date = current_date
    ) THEN
      streak := streak + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT; -- Break loop if day without completion
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;
```

**Example:**
- User completed activities on: Nov 13, 14, 15, 16, 17, 18
- Current date: Nov 18
- Function checks: Nov 18 (✓), Nov 17 (✓), Nov 16 (✓), Nov 15 (✓), Nov 14 (✓), Nov 13 (✓), Nov 12 (✗)
- Returns: 6 day streak

---

## 3. Authentication Flow - The Bouncer

### How users sign up, sign in, and stay logged in

Think of authentication like a nightclub: you show your ID (email + password) to the bouncer (Supabase Auth), they give you a wristband (JWT token), and as long as you wear the wristband, you can come and go freely.

#### Step 1: User Visits Sign-Up Page
**File:** `/Users/alexnapierski/490R/parenting-app/app/signup/page.tsx`

**URL:** `https://app.com/signup`

#### Step 2: User Enters Email and Password
**File:** `/Users/alexnapierski/490R/parenting-app/app/signup/page.tsx` (lines 26-79)

```typescript
const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  if (isSignUp) {
    // SIGN UP FLOW
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) throw error

    if (data.user) {
      // Check if email already exists
      if (data.user.identities?.length === 0) {
        setError('This email is already registered')
      } else {
        // New user - redirect to onboarding
        router.push('/onboarding')
      }
    }
  } else {
    // SIGN IN FLOW
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Check if onboarding completed
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .single()

    if (profile?.onboarding_completed) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }
}
```

#### Step 3: Supabase Auth Creates User Account

**What happens in Supabase:**

1. **Hash the password** (bcrypt algorithm)
   ```
   Plain: "mypassword123"
   Hashed: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
   ```

2. **Insert into `auth.users` table** (Supabase's internal table)
   ```sql
   INSERT INTO auth.users (
     id,
     email,
     encrypted_password,
     email_confirmed_at,
     created_at
   ) VALUES (
     'generated-uuid',
     'user@example.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     NOW(), -- or NULL if email confirmation required
     NOW()
   );
   ```

3. **Trigger creates profile** (Database trigger)
   ```sql
   -- From migration file
   CREATE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email)
     VALUES (new.id, new.email);
     RETURN new;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

4. **Generate JWT token** (JSON Web Token)
   ```javascript
   {
     "aud": "authenticated",
     "exp": 1732000000,  // Expiration timestamp (7 days)
     "sub": "user-uuid-here",
     "email": "user@example.com",
     "role": "authenticated"
   }
   ```

5. **Set httpOnly cookie**
   ```
   Set-Cookie: sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
               HttpOnly;
               Secure;
               SameSite=Lax;
               Max-Age=604800
   ```

**Why httpOnly cookie?**
- JavaScript CANNOT access it (prevents XSS attacks)
- Automatically sent with every request
- Can't be stolen by malicious scripts

#### Step 4: User is Redirected to Dashboard

```
Sign Up Success
  → JWT stored in cookie
    → Redirect to /dashboard
      → Dashboard page runs (Step 2 from Initial Load)
        → Checks session from cookie
          → Session valid → Show dashboard
```

#### Step 5: How Sessions Persist (Staying Logged In)

**Every request includes:**
```
GET /dashboard HTTP/1.1
Host: app.com
Cookie: sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Server checks token:**
```typescript
// In every protected page
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  redirect('/signup')
}
```

**Token validation:**
1. Extract JWT from cookie
2. Verify signature (ensures not tampered)
3. Check expiration (tokens expire after 7 days)
4. If valid → user stays logged in
5. If expired → redirect to login

#### Step 6: Sign Out Flow

**File:** `/Users/alexnapierski/490R/parenting-app/components/SignOutButton.tsx`

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/signup')
}
```

**What happens:**
1. Supabase deletes the session from database
2. Clears the cookie
3. Redirects to sign-up page
4. Any future requests fail auth check

---

## 4. Payment Processing Flow - The Cash Register

### How users upgrade to premium subscriptions

Think of Stripe like a vending machine: you insert money (payment details), it talks to your bank, confirms you have funds, and dispenses the product (premium access).

#### Step 1: User Clicks "Upgrade to Premium"
**File:** `/Users/alexnapierski/490R/parenting-app/app/account/page.tsx`

User sees pricing:
- Monthly: $4.99/month
- Yearly: $49.99/year (save 17%)

#### Step 2: User Selects Tier and Clicks "Subscribe"
**File:** `/Users/alexnapierski/490R/parenting-app/components/CheckoutButton.tsx`

```typescript
const handleCheckout = async () => {
  setLoading(true)

  // Call API to create checkout session
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'monthly' }) // or 'yearly'
  })

  const { url } = await response.json()

  // Redirect to Stripe Checkout page
  window.location.href = url
}
```

#### Step 3: API Creates Stripe Checkout Session
**File:** `/Users/alexnapierski/490R/parenting-app/app/api/checkout/route.ts` (lines 9-66)

```typescript
export async function POST(request: Request) {
  // 1. Parse and validate request
  const body = await request.json()
  const validation = checkoutSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const { tier } = validation.data // 'monthly' or 'yearly'

  // 2. Check authentication
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    session.user.email,
    session.user.id
  )

  // 4. Update profile with Stripe customer ID
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', session.user.id)

  // 5. Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: SUBSCRIPTION_TIERS[tier].priceId, // price_xxx from Stripe
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?canceled=true`,
    metadata: {
      user_id: session.user.id,
      tier,
    },
  })

  // 6. Return checkout URL
  return NextResponse.json({ url: checkoutSession.url })
}
```

**What's a Stripe Customer ID?**
- Stripe's internal ID for tracking a person
- Links all their payments together
- Stored in our database: `profiles.stripe_customer_id`

**What's a Price ID?**
```javascript
const SUBSCRIPTION_TIERS = {
  monthly: {
    priceId: 'price_1234abcd', // From Stripe Dashboard
    amount: 499, // $4.99 in cents
  },
  yearly: {
    priceId: 'price_5678efgh',
    amount: 4999, // $49.99 in cents
  }
}
```

#### Step 4: User Redirected to Stripe Checkout Page

```
Your App → Stripe's Website
https://app.com/account → https://checkout.stripe.com/c/pay/cs_test_xyz123
```

User sees:
- Beautiful Stripe-hosted payment form
- Credit card fields
- Billing address
- "Subscribe" button

**Why redirect to Stripe?**
- PCI compliance (we don't touch credit cards)
- Stripe handles all security
- Stripe updates UI automatically (Apple Pay, Google Pay, etc.)

#### Step 5: User Enters Card Details and Clicks "Subscribe"

**What happens inside Stripe:**

1. **Validate card** (is it real?)
2. **Check for fraud** (ML models analyze risk)
3. **Tokenize card** (convert to secure token)
4. **Charge card** ($4.99 or $49.99)
5. **Create subscription** (recurring charge)
6. **Send webhook event** to our app

#### Step 6: Stripe Sends Webhook to Our Server
**File:** `/Users/alexnapierski/490R/parenting-app/app/api/webhook/route.ts`

**What's a webhook?**
Stripe calls our API to say "Hey, payment succeeded!" Think of it like a callback function, but over HTTP.

```
Stripe → Our API
POST https://app.com/api/webhook
Headers:
  stripe-signature: t=1731966000,v1=abc123...
Body:
  {
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "customer": "cus_xyz",
        "subscription": "sub_123",
        "metadata": {
          "user_id": "user-uuid",
          "tier": "monthly"
        }
      }
    }
  }
```

**Webhook Handler:**
```typescript
export async function POST(request: Request) {
  // 1. Verify signature (CRITICAL SECURITY)
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )

  // If signature invalid, reject immediately
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Payment succeeded - activate subscription
      const session = event.data.object

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_tier: session.metadata.tier,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
        })
        .eq('id', session.metadata.user_id)

      break

    case 'customer.subscription.deleted':
      // User cancelled - deactivate
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_tier: 'free',
        })
        .eq('stripe_subscription_id', subscription.id)

      break

    case 'invoice.payment_failed':
      // Payment failed - mark inactive
      await supabase
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('stripe_subscription_id', invoice.subscription)

      break
  }

  return NextResponse.json({ received: true })
}
```

**Why verify signature?**
Without verification, hackers could fake webhooks:
```
Hacker → Our API
POST /api/webhook
Body: { "type": "checkout.session.completed", "user_id": "victim-uuid" }
Result: Free premium for hacker!
```

Signature verification ensures:
- Event came from Stripe
- Event hasn't been tampered with
- Event is fresh (prevents replay attacks)

#### Step 7: User Redirected Back to Our App

```
Stripe → Our App
https://checkout.stripe.com/success → https://app.com/account?success=true
```

User sees:
- Success message
- Premium badge
- Unlimited access

#### Step 8: Database State After Payment

**Before payment:**
```sql
SELECT * FROM profiles WHERE id = 'user-123';

{
  "id": "user-123",
  "email": "user@example.com",
  "subscription_status": "inactive",
  "subscription_tier": "free",
  "stripe_customer_id": null,
  "stripe_subscription_id": null
}
```

**After payment:**
```sql
SELECT * FROM profiles WHERE id = 'user-123';

{
  "id": "user-123",
  "email": "user@example.com",
  "subscription_status": "active",
  "subscription_tier": "monthly",
  "stripe_customer_id": "cus_xyz123",
  "stripe_subscription_id": "sub_abc456"
}
```

**How does this unlock premium features?**

In every protected page:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status')
  .single()

const isPremium = profile?.subscription_status === 'active'

if (!isPremium) {
  // Show upgrade banner
  // Limit to 1 prompt per day
}
```

#### Step 9: Recurring Payments (How Monthly Billing Works)

**Stripe automatically:**
1. Charges card every month on subscription anniversary
2. Sends `invoice.payment_succeeded` webhook (if successful)
3. Sends `invoice.payment_failed` webhook (if failed)
4. Retries failed payments automatically (Smart Retries)

**Our webhook keeps database in sync:**
```typescript
case 'invoice.payment_succeeded':
  // Keep subscription active
  await supabase
    .from('profiles')
    .update({ subscription_status: 'active' })
    .eq('stripe_subscription_id', invoice.subscription)
  break

case 'invoice.payment_failed':
  // Mark inactive after 3 failed retries
  await supabase
    .from('profiles')
    .update({ subscription_status: 'inactive' })
    .eq('stripe_subscription_id', invoice.subscription)
  break
```

---

## 5. Database Storage - The Filing Cabinet

### What data is stored and why?

Think of the database like a smart filing cabinet with security guards. Each drawer (table) stores specific types of information, and the guards (Row Level Security) ensure you can only access your own files.

#### Database Architecture Overview

```
PostgreSQL Database (Hosted by Supabase)
├── auth.users (Supabase internal - don't touch)
├── profiles (our custom table)
├── child_profiles (our custom table)
├── daily_prompts (our custom table)
└── prompt_completions (our custom table)
```

#### Table 1: `profiles` - User Accounts
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/001_initial_schema.sql`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  faith_mode BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**What each column stores:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `id` | UUID | Links to Supabase auth.users | `a1b2c3d4-...` |
| `email` | TEXT | User's email | `parent@gmail.com` |
| `subscription_status` | TEXT | Payment status | `'active'` / `'inactive'` / `'cancelled'` |
| `subscription_tier` | TEXT | Plan type | `'free'` / `'monthly'` / `'yearly'` |
| `stripe_customer_id` | TEXT | Stripe's customer ID | `cus_xyz123` |
| `stripe_subscription_id` | TEXT | Stripe's subscription ID | `sub_abc456` |
| `faith_mode` | BOOLEAN | Show faith-based prompts? | `true` / `false` |
| `onboarding_completed` | BOOLEAN | Finished setup? | `true` / `false` |

**Why store this?**
- `subscription_status`: Controls access to premium features
- `stripe_customer_id`: Links user to Stripe for billing
- `faith_mode`: Personalizes recommendations (faith-based vs secular)
- `onboarding_completed`: Prevents showing welcome flow twice

**Security (Row Level Security):**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

Translation: "Users can ONLY see their own profile row"

**How it works:**
```sql
-- Alice (id: user-123) tries to query
SELECT * FROM profiles;

-- PostgreSQL automatically adds WHERE clause:
SELECT * FROM profiles WHERE id = 'user-123';

-- Result: Alice only sees her own profile
```

#### Table 2: `child_profiles` - Children Information
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/003_child_profiles.sql`

```sql
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  interests TEXT[],
  personality_traits TEXT[],
  current_challenges TEXT[],
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Example row:**
```json
{
  "id": "child-abc-789",
  "user_id": "user-123",
  "name": "Emma",
  "birth_date": "2018-05-15",
  "interests": ["art", "dinosaurs", "reading"],
  "personality_traits": ["creative", "shy", "curious"],
  "current_challenges": ["bedtime_resistance", "screen_time"],
  "photo_url": "https://storage.supabase.co/...",
  "notes": "Loves purple. Afraid of loud noises."
}
```

**Why store this?**
- `name` + `birth_date`: Calculate age for recommendations
- `interests`: Personalize activity suggestions (e.g., art-focused prompts)
- `personality_traits`: Tailor activity difficulty (shy kids get gentler prompts)
- `current_challenges`: Prioritize relevant categories (bedtime_resistance → more bedtime prompts)

**Age calculation (happens in code):**
```typescript
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Emma born 2018-05-15, today is 2025-11-18
calculateAge("2018-05-15") // Returns: 7
```

**Security:**
```sql
CREATE POLICY "Users can view own children profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id);
```

Translation: "Parents can only see their own children's profiles"

#### Table 3: `daily_prompts` - Activity Library
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/004_prompt_categories_and_content.sql`

```sql
CREATE TABLE daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  age_categories TEXT[],
  tags TEXT[],
  estimated_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example row:**
```json
{
  "id": "prompt-xyz-123",
  "title": "Story Time Silly Voices",
  "description": "Read a favorite book using different silly voices for each character",
  "activity": "Pick a book you both love. Assign a silly voice to each character. Take turns reading and acting out the story.",
  "category": "connection",
  "age_categories": ["toddler", "elementary"],
  "tags": ["reading", "creativity", "low-energy"],
  "estimated_minutes": 10,
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Why store this?**
- `category`: Group activities (connection, learning, bedtime, etc.)
- `age_categories`: Filter out inappropriate activities (no "teen" prompts for toddlers)
- `tags`: Additional filtering (faith-based, outdoor, high-energy, etc.)
- `estimated_minutes`: Set parent expectations

**How recommendations filter by age:**
```typescript
// Child age: 7 (elementary category)
const ageAppropriate = allPrompts.filter(prompt =>
  prompt.age_categories.includes('elementary') ||
  prompt.age_categories.includes('all')
)
```

**Security:**
```sql
CREATE POLICY "Authenticated users can view prompts"
  ON daily_prompts FOR SELECT
  TO authenticated
  USING (true);
```

Translation: "Any logged-in user can see all prompts" (they're public content)

#### Table 4: `prompt_completions` - Activity History
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/002_prompt_completions.sql`

```sql
CREATE TABLE prompt_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  prompt_id UUID NOT NULL REFERENCES daily_prompts(id),
  child_id UUID REFERENCES child_profiles(id),
  completed_at TIMESTAMP NOT NULL,
  completion_date DATE NOT NULL,
  reflection_note TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example row:**
```json
{
  "id": "completion-def-456",
  "user_id": "user-123",
  "prompt_id": "prompt-xyz-123",
  "child_id": "child-abc-789",
  "completed_at": "2025-11-18T19:30:00Z",
  "completion_date": "2025-11-18",
  "reflection_note": "Emma loved this! She gave the dragon a British accent.",
  "duration_seconds": 720,
  "created_at": "2025-11-18T19:42:00Z"
}
```

**Why store this?**
- `completed_at`: Exact timestamp (for sorting history)
- `completion_date`: Day only (for streak calculation)
- `reflection_note`: Capture memories and insights
- `duration_seconds`: Track actual time spent (vs estimated)

**This table powers:**
1. **Streak calculation** - Count consecutive `completion_date` days
2. **Recommendation engine** - Avoid recently completed prompts
3. **Category balance** - "You've done 10 learning, only 2 creative - here's art!"
4. **Engagement signals** - Prompts with long duration or notes = user loved it

**Security:**
```sql
CREATE POLICY "Users can view own completions"
  ON prompt_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON prompt_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Translation: "You can only see/create your own completion records"

#### Database Indexes (Speed Boosters)

**What's an index?** Like a book's index - helps find data fast without scanning every row.

**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/015_recommendation_indexes.sql`

```sql
CREATE INDEX idx_completions_child_id
  ON prompt_completions(child_id);

CREATE INDEX idx_completions_user_id
  ON prompt_completions(user_id);

CREATE INDEX idx_completions_date
  ON prompt_completions(completion_date);

CREATE INDEX idx_prompts_category
  ON daily_prompts(category);
```

**Speed improvement:**
```sql
-- Without index: Scans all 10,000 rows (slow!)
SELECT * FROM prompt_completions WHERE child_id = 'child-abc-789';
-- Execution time: 450ms

-- With index: Jumps directly to matching rows (fast!)
SELECT * FROM prompt_completions WHERE child_id = 'child-abc-789';
-- Execution time: 12ms
```

#### Database Functions (Stored Procedures)

**Example: Calculate Streak**
**File:** `/Users/alexnapierski/490R/parenting-app/supabase/migrations/010_demo_mvp_enhancements.sql`

```sql
CREATE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  LOOP
    -- Check if user completed anything on check_date
    IF EXISTS (
      SELECT 1
      FROM prompt_completions
      WHERE user_id = p_user_id
        AND completion_date = check_date
    ) THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT; -- Break loop
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;
```

**Why use database function instead of application code?**
- **Performance**: Runs inside database (no network round-trips)
- **Accuracy**: Guaranteed correct (can't have race conditions)
- **Reusability**: Call from any query

**Usage:**
```sql
SELECT get_current_streak('user-123');
-- Returns: 7 (user has 7-day streak)
```

---

## Key Takeaways for Beginners

### 1. Server Components vs Client Components

**Server Components** (default in Next.js):
- Run on server
- Can access database directly
- No JavaScript sent to browser
- Faster initial page load

**Client Components** (`'use client'` directive):
- Run in browser
- Handle user interactions
- Use React hooks (useState, useEffect)
- Create forms, buttons, animations

**Golden Rule:** Use Server Components by default. Only use Client Components when you need interactivity.

### 2. Data Flow Patterns

**Pattern 1: Server → Client (Props)**
```typescript
// Server Component (page.tsx)
const data = await fetchFromDatabase()
return <ClientComponent data={data} />

// Client Component (ClientComponent.tsx)
'use client'
function ClientComponent({ data }) {
  // Use data for interactivity
}
```

**Pattern 2: Client → Server → Database (API Routes)**
```typescript
// Client Component
const response = await fetch('/api/complete-prompt', {
  method: 'POST',
  body: JSON.stringify({ promptId, childId })
})

// API Route (route.ts)
export async function POST(request) {
  const body = await request.json()
  await supabase.from('prompt_completions').insert(body)
  return NextResponse.json({ success: true })
}
```

**Pattern 3: Server → Database (Direct Queries)**
```typescript
// Server Component
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
```

### 3. Security Layers

**Layer 1: Authentication (Who are you?)**
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/signup')
```

**Layer 2: Row Level Security (What can you access?)**
```sql
CREATE POLICY "Users view own data"
  ON table FOR SELECT
  USING (auth.uid() = user_id);
```

**Layer 3: Input Validation (Is this data safe?)**
```typescript
const validation = schema.safeParse(body)
if (!validation.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```

**Layer 4: Webhook Signatures (Is this request legitimate?)**
```typescript
const event = stripe.webhooks.constructEvent(body, signature, secret)
// Throws error if signature invalid
```

### 4. Database Design Principles

**Normalization:** Store each piece of data once
```sql
-- ❌ Bad: Duplicate user email in every completion
prompt_completions:
  user_email: "parent@gmail.com"
  user_email: "parent@gmail.com"  -- duplicated!

-- ✅ Good: Store user_id, join with profiles table
prompt_completions:
  user_id: "user-123"

profiles:
  id: "user-123"
  email: "parent@gmail.com"  -- single source of truth
```

**Foreign Keys:** Enforce relationships
```sql
CREATE TABLE prompt_completions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
-- If user deleted, all their completions auto-delete
```

**Indexes:** Speed up queries
```sql
CREATE INDEX idx_completions_child_id ON prompt_completions(child_id);
-- Makes filtering by child 50x faster
```

### 5. Performance Optimization Strategies

**Strategy 1: Parallel Queries**
```typescript
// ❌ Slow: Sequential (3 seconds total)
const users = await fetchUsers()      // 1 second
const children = await fetchChildren() // 1 second
const prompts = await fetchPrompts()  // 1 second

// ✅ Fast: Parallel (1 second total)
const [users, children, prompts] = await Promise.all([
  fetchUsers(),
  fetchChildren(),
  fetchPrompts()
])
```

**Strategy 2: Database Indexing**
```sql
-- Before index: Full table scan (slow)
SELECT * FROM prompt_completions WHERE child_id = 'abc';
-- Scans 100,000 rows → 500ms

-- After index: Direct lookup (fast)
CREATE INDEX idx_child ON prompt_completions(child_id);
SELECT * FROM prompt_completions WHERE child_id = 'abc';
-- Jumps to 50 matching rows → 8ms
```

**Strategy 3: Limit Results**
```typescript
// ❌ Bad: Fetch all 10,000 prompts
const { data } = await supabase.from('daily_prompts').select('*')

// ✅ Good: Fetch only what you need
const { data } = await supabase
  .from('daily_prompts')
  .select('*')
  .limit(50)
```

---

## Conclusion

You've just traced the complete journey of data through a production Next.js app:

1. **Initial Load**: Server authenticates user → fetches data → generates recommendations → sends HTML
2. **User Action**: Click button → show modal → save to database → refresh page → see updates
3. **Authentication**: Email/password → hash → JWT token → httpOnly cookie → session persistence
4. **Payments**: Select plan → create checkout → Stripe processes → webhook updates database → premium unlocked
5. **Database**: 4 tables with Row Level Security → indexes for speed → foreign keys for integrity

**Remember:**
- **Security first** - Authenticate, validate, verify
- **Server Components** - Default for data fetching
- **Client Components** - Only for interactivity
- **Database** - Single source of truth with RLS
- **Parallel queries** - Speed matters

Now you understand not just WHAT the code does, but WHY it's structured this way. You're on your way to becoming a world-class engineer!

---

**File created:** `/Users/alexnapierski/490R/parenting-app/DATA_FLOW_ANALYSIS.md`
**Last updated:** 2025-11-18
