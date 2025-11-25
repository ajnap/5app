# Enhanced Profile Cards with AI Insights - Implementation Tasks

## Task Execution Guidelines

**IMPORTANT**: Execute tasks in order. Each task builds on previous work. Mark tasks complete as you finish them.

**Budget Reminder**: $4/month OpenAI limit. All cost tracking must be implemented before AI generation.

---

## Phase 1: Database Setup & Migrations

- [ ] 1. Create database migration for AI insights and cost tracking
  - Create migration file `019_ai_insights_and_cost_tracking.sql`
  - Add `ai_insights_cache` table with all columns, indexes, and RLS policies
  - Add `openai_cost_tracking` table with indexes and RLS policies
  - Add `daily_reminders` table with unique constraint on date
  - Add `curated_reminders_library` table with indexes
  - Create database functions: `get_monthly_openai_cost()`, `can_generate_ai_insight()`, `delete_expired_insights()`
  - Test migration locally with `psql`
  - Verify all indexes created correctly
  - _Requirements: 2, 5, 6_

- [ ] 2. Seed curated reminders library
  - Create seed data file `supabase/seeds/curated_reminders.sql`
  - Write 100+ high-quality reminders across all 12 monthly themes
  - Include expanded guidance (2-3 paragraphs) for each
  - Map related activity categories
  - Assign seasonal tags where applicable
  - Test seed script locally
  - Verify reminders load correctly with proper formatting
  - _Requirements: 3, 6_

- [ ] 3. Apply database migrations to development environment
  - Run migration on local Supabase instance
  - Verify all tables exist with correct schema
  - Test RLS policies by querying as different users
  - Run seed script for curated reminders
  - Verify 100+ reminders inserted successfully
  - Check database functions work correctly
  - _Requirements: 2, 5, 6_

---

## Phase 2: Cost Tracking & Budget Management

- [ ] 4. Build OpenAI cost tracking service
  - Create `lib/openai-cost-tracker.ts` with TypeScript types
  - Implement `trackCost()` function to insert into `openai_cost_tracking` table
  - Implement `getMonthlySpend()` function that queries current month total
  - Implement `canGenerateInsight()` function that checks $4 budget limit
  - Add error handling for database failures
  - Write unit tests for cost calculation logic
  - Test with mock data to verify budget enforcement
  - _Requirements: 5_

- [ ] 5. Create admin cost monitoring API
  - Create API route `app/api/admin/openai-costs/route.ts`
  - Implement GET handler that returns monthly summary
  - Include: currentMonthSpend, budgetLimit, remainingBudget, requestCount, avgCostPerRequest
  - Add authentication check (admin users only)
  - Add error handling with Sentry integration
  - Test with Postman/Insomnia
  - Write integration test for API route
  - _Requirements: 5_

- [ ] 6. Build admin cost monitoring page
  - Create page `app/admin/openai-costs/page.tsx`
  - Fetch cost data from API route
  - Display monthly spend with progress bar
  - Show daily spend trend chart (last 30 days)
  - Add alert styling if approaching $4 limit (75%, 90%)
  - Show request count and average cost per request
  - Make responsive for mobile
  - Test with real cost data
  - _Requirements: 5_

---

## Phase 3: AI Service Layer

- [ ] 7. Build AI insights service (preparation)
  - Create `lib/ai-insights.ts` with TypeScript interfaces
  - Define `InsightGenerationContext` type with all required fields
  - Define `AIInsight` type matching database JSONB structure
  - Create `INSIGHT_SYSTEM_PROMPT` constant with detailed instructions
  - Implement `buildInsightPrompt()` function to format child context
  - Implement `parseInsightResponse()` function to parse OpenAI JSON response
  - Implement `calculateCost()` function for GPT-3.5-turbo pricing
  - Write unit tests for prompt building and cost calculation
  - _Requirements: 2, 5_

- [ ] 8. Implement AI insight generation with OpenAI
  - Add OpenAI SDK to `lib/ai-insights.ts`
  - Implement `generateAIInsights()` async function
  - Call `canGenerateInsight()` before OpenAI request
  - Throw `BUDGET_EXCEEDED` error if budget limit reached
  - Call OpenAI API with GPT-3.5-turbo model
  - Set temperature: 0.7, max_tokens: 300
  - Parse response and validate format
  - Calculate cost from usage tokens
  - Call `trackCost()` to log to database
  - Return insights with cost and token metadata
  - Add comprehensive error handling (try/catch)
  - Write integration test with mocked OpenAI responses
  - _Requirements: 2, 5_

- [ ] 9. Build rule-based insight fallback generator
  - Create `lib/rule-based-insights.ts` with fallback logic
  - Implement `generateRuleBasedInsights()` function
  - Use existing tips-generator logic as base
  - Generate 2-3 insights based on completion patterns
  - Match AI insight format (type, message, priority)
  - Ensure no cost incurred (pure algorithmic)
  - Test with various child profiles and completion histories
  - _Requirements: 2_

- [ ] 10. Create insight data aggregation utility
  - Create `lib/insight-data-aggregator.ts`
  - Implement `aggregateChildData()` function
  - Fetch last 30 days of completions for child
  - Calculate category distribution percentages
  - Calculate average duration and reflection rate
  - Detect consistency patterns (time of day, day of week)
  - Return formatted `InsightGenerationContext`
  - Write unit tests with mock completion data
  - _Requirements: 2_

---

## Phase 4: AI Insights API Route

- [ ] 11. Create AI insights API route
  - Create `app/api/ai-insights/[childId]/route.ts`
  - Implement GET handler with childId param
  - Add authentication check (user must own child)
  - Check if child has 10+ completions (eligibility)
  - If not eligible, return rule-based insights immediately
  - Query `ai_insights_cache` for non-expired insights (<7 days)
  - If cache hit, return cached insights with source='cache'
  - Add query param support for `forceRefresh` (respects 7-day minimum)
  - _Requirements: 2, 5_

- [ ] 11.1 Implement cache miss handling
  - When cache miss, aggregate child data with `aggregateChildData()`
  - Check budget with `canGenerateInsight()`
  - If budget exceeded, return rule-based insights with source='fallback'
  - Call `generateAIInsights()` with aggregated context
  - Handle `BUDGET_EXCEEDED` error gracefully
  - Insert insights into `ai_insights_cache` with 7-day expiration
  - Return insights with source='ai_generated', cost, timestamps
  - _Requirements: 2, 5_

- [ ] 11.2 Add comprehensive error handling
  - Catch OpenAI API errors and return rule-based fallback
  - Catch database errors and log to Sentry
  - Never show AI failure to users (silent fallback)
  - Return appropriate HTTP status codes
  - Log all errors with context (childId, userId, operation)
  - Test error scenarios: API timeout, invalid response, DB failure
  - _Requirements: 2_

- [ ] 12. Write integration tests for insights API
  - Test cache hit scenario (return cached insights)
  - Test cache miss scenario (generate new insights)
  - Test eligibility check (return fallback for <10 completions)
  - Test budget exceeded (return rule-based insights)
  - Test force refresh (only works after 7 days)
  - Test authentication (reject unauthorized requests)
  - Mock OpenAI API responses
  - Verify cost tracking inserts
  - _Requirements: 2, 5_

---

## Phase 5: Daily Reminder System

- [ ] 13. Build daily reminder selector service
  - Create `lib/daily-reminder-selector.ts`
  - Implement `selectDailyReminder()` function
  - Get current month to determine theme
  - Query `curated_reminders_library` filtered by theme
  - Exclude reminders used in last 30 days
  - Apply seasonal filters if applicable (spring, summer, etc)
  - Randomly select from filtered reminders
  - Return selected reminder with metadata
  - Write unit tests for selection logic
  - _Requirements: 3, 6_

- [ ] 14. Create daily reminder API route
  - Create `app/api/daily-reminder/route.ts`
  - Implement GET handler
  - Check if reminder exists for today in `daily_reminders` table
  - If exists, return it immediately (cache hit)
  - If not, call `selectDailyReminder()` to pick one
  - Insert selected reminder into `daily_reminders` table
  - Update `last_used_date` in `curated_reminders_library`
  - Fetch 3-5 suggested activities from related categories
  - Return reminder + suggested activities
  - Add error handling for database failures
  - _Requirements: 3, 6_

- [ ] 15. Write integration tests for reminder API
  - Test reminder exists (return cached)
  - Test no reminder exists (create new)
  - Test uniqueness constraint (one per day)
  - Test theme-based filtering works correctly
  - Test seasonal filtering
  - Test related activities fetch
  - Verify last_used_date updates correctly
  - _Requirements: 3, 6_

---

## Phase 6: Enhanced Completion Tracking

- [ ] 16. Update complete-activity API to track daily counts
  - Modify `app/api/complete-activity/route.ts` (or create if doesn't exist)
  - After inserting completion record, count today's completions for child
  - Query `prompt_completions` where `child_id` = X AND `completion_date` = today
  - Return `todayActivityCount` in response
  - Check if completion is a milestone (10th, 20th, 30th total)
  - If milestone, mark insights cache for regeneration (update `expires_at` to NOW())
  - Return `shouldCelebrate` boolean if count >= 3
  - _Requirements: 1, 2_

- [ ] 17. Remove daily completion limit
  - Review existing code for "one per day" restrictions
  - Remove any checks that prevent multiple completions per child per day
  - Update `completedToday` logic to track completed prompt IDs, not boolean
  - Change to `completedPromptIds` array (exclude for 2 hours, not entire day)
  - Update recommendation engine to exclude prompts completed <2 hours ago
  - Test completing multiple activities in rapid succession
  - Verify no errors occur with 5+ activities in one day
  - _Requirements: 1_

- [ ] 18. Write tests for unlimited activities
  - Test completing 5 activities with same child in one day
  - Test activity count increments correctly
  - Test milestone detection (10th completion triggers insight invalidation)
  - Test recommendation exclusion (only <2 hours, not entire day)
  - Test celebration trigger at 3+ activities
  - _Requirements: 1_

---

## Phase 7: Frontend Components

- [ ] 19. Create EnhancedChildCard component
  - Create `components/EnhancedChildCard.tsx` as client component
  - Accept props: child, recommendations, todayActivityCount, weeklyCount, monthlyMinutes, streak, aiInsightTeaser
  - Display activity count badge with color coding (0=gray, 1=blue, 2=purple, 3+=gold)
  - Show "X activities today" text with emoji
  - Add celebration animation when todayActivityCount >= 3 (confetti or sparkles)
  - Display AI insight teaser (first 15 words + "Read more")
  - Implement hover expansion for insight teaser
  - Show quick stats footer (weekly activities, monthly minutes, streak)
  - Keep existing Start/Refresh buttons
  - Make responsive (works on mobile)
  - _Requirements: 1, 2, 4_

- [ ] 20. Create AIInsightsSection component
  - Create `components/AIInsightsSection.tsx` as client component
  - Accept props: childId, insights, isLoading, error, eligibleForAI, canRefresh
  - Display "AI-Powered Insights" header with sparkle icon
  - Render 2-3 insight cards with type icons and messages
  - Show loading skeleton while fetching (non-blocking)
  - Display empty state for non-eligible children (<10 completions)
  - Show encouraging message: "Complete 10 activities to unlock AI insights!"
  - Add "Refresh Insights" button (disabled if <7 days since last generation)
  - Show tooltip on disabled refresh button explaining 7-day wait
  - Fallback to rule-based tips if AI fails (seamless transition)
  - Style with gradient backgrounds per insight type
  - _Requirements: 2, 4_

- [ ] 21. Create DailyReminderCard component
  - Create `components/DailyReminderCard.tsx` as client component
  - Accept props: reminder, onHelpClick, onDismiss
  - Display prominent card with gradient background
  - Show theme icon (emoji) and main message
  - Add "Help me with this" button (primary CTA)
  - Add dismiss button (X in corner)
  - Implement dismiss logic (store in localStorage for 24 hours)
  - Animate entrance (fade in + slide down)
  - Make responsive (full width on mobile)
  - _Requirements: 3, 4_

- [ ] 22. Create ReminderGuidanceModal component
  - Create `components/ReminderGuidanceModal.tsx` as client component
  - Accept props: reminder, isOpen, onClose, suggestedActivities
  - Display modal with backdrop blur
  - Show expanded guidance (2-3 paragraphs)
  - Render actionable steps as bullet list
  - Display 3-5 suggested activities with "Try this" buttons
  - Add "Add to Calendar" button (optional, future enhancement)
  - Implement focus trap for accessibility
  - Support Escape key to close
  - Animate entrance (scale + fade)
  - _Requirements: 3_

---

## Phase 8: Frontend Integration

- [ ] 23. Update Dashboard page to fetch daily reminder
  - Modify `app/dashboard/page.tsx` server component
  - Add fetch for daily reminder from `/api/daily-reminder`
  - Pass reminder data to DashboardClient component
  - Handle fetch errors gracefully (don't block dashboard load)
  - Add Sentry error tracking if reminder fetch fails
  - _Requirements: 3_

- [ ] 24. Update DashboardClient to show reminder card
  - Modify `components/DashboardClient.tsx`
  - Add state for reminder modal (isOpen, selectedReminder)
  - Render DailyReminderCard at top of dashboard
  - Implement "Help me with this" handler (open modal)
  - Implement dismiss handler (store in localStorage)
  - Render ReminderGuidanceModal
  - Fetch suggested activities when modal opens
  - Test reminder card displays correctly
  - _Requirements: 3_

- [ ] 25. Replace ChildCard with EnhancedChildCard
  - Update `components/DashboardClient.tsx` imports
  - Calculate todayActivityCount for each child (query completions where completion_date = today)
  - Calculate weeklyActivityCount (last 7 days)
  - Fetch monthly minutes from existing stats
  - Fetch AI insight teaser from cache (if available)
  - Pass all props to EnhancedChildCard
  - Remove old ChildCard component (or keep as backup)
  - Test that all child cards render correctly
  - _Requirements: 1, 4_

- [ ] 26. Update Child Profile page to show AI insights
  - Modify `app/children/[id]/profile/page.tsx`
  - Add fetch for AI insights from `/api/ai-insights/[childId]`
  - Check child completion count for eligibility
  - Pass insights to ChildDetailClient component
  - Add error boundary for insights section
  - Test profile page with and without cached insights
  - _Requirements: 2, 4_

- [ ] 27. Update ChildDetailClient to render AI insights
  - Modify `components/ChildDetailClient.tsx`
  - Add AIInsightsSection component to layout
  - Position after ConnectionInsights, before PersonalizedTips
  - Implement refresh handler (calls API with forceRefresh)
  - Show loading state while generating (non-blocking)
  - Handle errors silently (show fallback tips)
  - Test insight display and refresh functionality
  - _Requirements: 2, 4_

---

## Phase 9: Dashboard Activity Count Integration

- [ ] 28. Fetch today's activity counts on dashboard load
  - Modify `app/dashboard/page.tsx` server component
  - For each child, query prompt_completions where completion_date = today
  - Create `todayActivityCountMap: Record<childId, number>`
  - Query last 7 days for weeklyActivityCountMap
  - Pass both maps to DashboardClient
  - Optimize with single query using GROUP BY
  - _Requirements: 1_

- [ ] 29. Update completion handler to refresh activity counts
  - Modify completion handler in DashboardClient
  - After successful completion, increment local todayActivityCount
  - Show celebration animation if new count >= 3
  - Update EnhancedChildCard with new count (optimistic update)
  - Refresh page data to get accurate count from server
  - _Requirements: 1_

- [ ] 30. Implement recently completed exclusion logic
  - Modify recommendation engine or dashboard logic
  - Track completed prompt IDs with timestamps (last 2 hours)
  - Exclude these from available recommendations
  - Allow same prompt again after 2 hours (not entire day)
  - Test with rapid completions (5 within 10 minutes)
  - Verify recommendations refresh correctly
  - _Requirements: 1_

---

## Phase 10: Testing & Quality Assurance

- [ ] 31. Write unit tests for AI service layer
  - Test `buildInsightPrompt()` with various child profiles
  - Test `parseInsightResponse()` with different AI outputs
  - Test `calculateCost()` accuracy
  - Test `canGenerateInsight()` budget enforcement
  - Test fallback logic when budget exceeded
  - Run all tests: `npm test -- lib/ai-insights.test.ts`
  - _Requirements: 2, 5_

- [ ] 32. Write integration tests for API routes
  - Test `/api/ai-insights/[childId]` with cache scenarios
  - Test `/api/daily-reminder` with date scenarios
  - Test `/api/complete-activity` with activity counting
  - Test `/api/admin/openai-costs` with cost data
  - Mock OpenAI API responses
  - Mock Supabase queries
  - Run all API tests: `npm test -- __tests__/api/`
  - _Requirements: 1, 2, 3, 5_

- [ ] 33. Write E2E tests for critical flows
  - Test: Complete 3 activities in one day, see celebration
  - Test: Navigate to child profile, see AI insights section
  - Test: View daily reminder, click "Help me with this", see modal
  - Test: Complete 10th activity, insights become available
  - Test: Refresh insights (mock 7 days passing)
  - Run E2E tests: `npm run test:e2e`
  - _Requirements: 1, 2, 3_

- [ ] 34. Cost testing with mock scenarios
  - Create test script to simulate 100 insight generations
  - Verify total cost < $0.15
  - Test cache hit rate calculation
  - Verify budget cutoff prevents spending >$4
  - Test monthly cost tracking accuracy
  - Document cost efficiency in test report
  - _Requirements: 5_

- [ ] 35. Manual QA testing checklist
  - Test unlimited activities: Complete 5+ in one day
  - Test AI insights: Verify insights display on eligible children
  - Test cache behavior: Check insights cached for 7 days
  - Test budget limit: Simulate budget exceeded scenario
  - Test daily reminder: Verify new reminder each day
  - Test fallback logic: Disable OpenAI, verify rule-based tips work
  - Test mobile responsive: All components work on 320px width
  - Test accessibility: Tab navigation, screen reader labels
  - _Requirements: All_

---

## Phase 11: Performance Optimization

- [ ] 36. Optimize database queries
  - Review all queries in new API routes
  - Add database indexes if missing
  - Use parallel queries with Promise.all() where applicable
  - Test query performance with large datasets (100+ completions)
  - Profile with Supabase dashboard
  - Target: All queries < 100ms
  - _Requirements: Performance_

- [ ] 37. Implement optimistic UI updates
  - Update completion handler to show new activity count immediately
  - Update insights section to show cached insights during refresh
  - Add non-blocking loading states (don't block page load)
  - Test user experience with slow connections (throttle network)
  - _Requirements: Performance_

- [ ] 38. Add React.memo to new components
  - Apply React.memo to EnhancedChildCard
  - Apply React.memo to AIInsightsSection
  - Apply React.memo to DailyReminderCard
  - Profile with React DevTools Profiler
  - Verify re-render reduction
  - _Requirements: Performance_

---

## Phase 12: Monitoring & Alerts

- [ ] 39. Set up Sentry error tracking for AI features
  - Add error tracking to all AI-related functions
  - Include context: childId, userId, operation, cost
  - Set up alerts for high error rates (>5% of requests)
  - Test Sentry integration with sample errors
  - _Requirements: 5_

- [ ] 40. Implement cost monitoring alerts
  - Create database trigger or cron job to check monthly spend
  - Send alert when spend reaches 75% of budget ($3.00)
  - Send alert when spend reaches 90% of budget ($3.60)
  - Send alert if daily spend exceeds $0.20 (abnormal)
  - Test alerts with mock cost data
  - _Requirements: 5_

- [ ] 41. Add cache hit rate monitoring
  - Create metric to track cache hits vs misses
  - Log to Vercel Analytics or custom dashboard
  - Target: 85%+ cache hit rate
  - Alert if drops below 70%
  - _Requirements: 5_

---

## Phase 13: Documentation & Deployment

- [ ] 42. Update CLAUDE.md with AI insights system
  - Document new API routes and usage
  - Explain cost management strategy
  - Provide examples of AI insight prompts
  - Document troubleshooting steps
  - _Requirements: All_

- [ ] 43. Create admin documentation for cost monitoring
  - Write guide for accessing `/admin/openai-costs` page
  - Explain how to interpret cost metrics
  - Document budget alert thresholds
  - Provide runbook for budget exceeded scenario
  - _Requirements: 5_

- [ ] 44. Apply database migrations to production
  - Review migration file one more time
  - Apply migration to production Supabase
  - Run seed script for curated reminders
  - Verify all tables and functions created
  - Test RLS policies in production
  - _Requirements: All_

- [ ] 45. Deploy backend changes to production
  - Push all API routes and services to main branch
  - Trigger Vercel deployment
  - Monitor build logs for errors
  - Verify environment variables set (OPENAI_API_KEY)
  - Test API routes in production with Postman
  - _Requirements: All_

- [ ] 46. Deploy frontend changes to production
  - Push all component changes to main branch
  - Verify build succeeds
  - Monitor Vercel deployment
  - Test dashboard loads correctly
  - Test child profile page with AI insights
  - Test daily reminder displays
  - _Requirements: All_

- [ ] 47. Post-deployment verification
  - Complete one full user flow: signup ’ onboard ’ complete 3 activities ’ see celebration
  - Complete 10 activities ’ navigate to profile ’ see AI insights
  - Verify daily reminder shows on dashboard
  - Check admin cost monitoring page
  - Monitor Sentry for errors
  - Watch OpenAI cost tracking (first 24 hours)
  - _Requirements: All_

---

## Phase 14: Monitoring & Iteration

- [ ] 48. Monitor costs for first week
  - Check daily spend in admin dashboard
  - Verify cache hit rate meets target (85%+)
  - Track total unique children receiving AI insights
  - Ensure monthly spend stays under $4
  - Adjust cache duration if needed
  - _Requirements: 5_

- [ ] 49. Collect user feedback
  - Add feedback button to AI insights section
  - Track insight view rate and engagement
  - Monitor daily reminder click-through rate
  - Survey users about AI insight quality
  - Identify any issues or confusion
  - _Requirements: All_

- [ ] 50. Optimize prompts based on feedback
  - Review AI-generated insights for quality
  - Adjust system prompt if insights are generic
  - Test different temperature settings (0.6 vs 0.8)
  - A/B test prompt variations (future)
  - Document any prompt improvements
  - _Requirements: 2_

---

## Post-Launch Enhancements (Future)

- [ ] 51. Implement batch insight generation
  - Generate insights for multiple children in one API call
  - Reduce per-child cost by batching
  - Schedule during off-peak hours
  - _Out of scope for v1_

- [ ] 52. Add insight quality feedback
  - Let users rate insights (helpful / not helpful)
  - Use feedback to improve prompts
  - Track quality metrics over time
  - _Out of scope for v1_

- [ ] 53. Create insight history timeline
  - Store historical insights (not just latest)
  - Show "3 months ago" insights for comparison
  - Visualize progress over time
  - _Out of scope for v1_

---

## Success Criteria

 All database migrations applied successfully
 AI insights generate for eligible children (10+ completions)
 Monthly OpenAI cost stays under $4
 Cache hit rate >= 85%
 Daily reminders display every day without AI generation
 Users can complete unlimited activities per day
 Activity count badge updates correctly
 All tests pass (unit, integration, E2E)
 No critical errors in Sentry
 Mobile responsive and accessible (WCAG AA)

---

## Notes

**Testing Approach**:
- Unit test all pure functions (cost calculation, prompt building)
- Integration test all API routes with mocked external services
- E2E test critical user flows
- Manual QA for edge cases

**Cost Safety**:
- Implement cost tracking FIRST before enabling AI generation
- Test budget cutoff with small limit ($0.50) before production
- Monitor costs daily for first week

**Rollback Plan**:
- If costs exceed $3 in first week, immediately disable AI generation
- Fallback to rule-based tips only (already built)
- Investigate and optimize before re-enabling
