# Child-Centric Dashboard Redesign - Implementation Plan

## Task Execution Guidelines

**IMPORTANT**: Execute tasks in order. Each task builds on previous work. Mark tasks complete as you finish them.

## Implementation Tasks

- [ ] 1. Create ConnectionInsights utility and types
  - Write TypeScript interface for `ConnectionInsights` in `lib/recommendations/types.ts`
  - Create `lib/insights-calculator.ts` with `calculateInsights()` function
  - Implement parallel queries for weekly/monthly stats, completions, category distribution
  - Add error handling with Sentry integration
  - Write unit tests for `calculateInsights()` with mock data
  - _Requirements: 4, 5, 6_

- [ ] 2. Create PersonalizedTips generator utility
  - Write TypeScript interface for `PersonalizedTip` in `lib/recommendations/types.ts`
  - Create `lib/tips-generator.ts` with `generatePersonalizedTips()` function
  - Implement age-based developmental tips (mapping ages 0-18)
  - Implement category balance detection and tip generation
  - Implement engagement pattern recognition tips
  - Implement streak encouragement tips
  - Implement re-engagement tips for inactive users
  - Add priority scoring logic (re-engagement: 100, developmental: 90, etc.)
  - Return top 5 tips sorted by priority
  - Write unit tests for all tip generation rules
  - _Requirements: 5_

- [ ] 3. Create ChildCard component
  - Create `components/ChildCard.tsx` as client component with 'use client' directive
  - Define `ChildCardProps` interface with child, recommendations, onStartActivity, completedToday
  - Add state for currentIndex (track which recommendation is displayed)
  - Add state for isRefreshing and isStarting (loading states)
  - Implement click handler for card body (navigate to `/children/{id}`)
  - Implement refresh button click handler (cycle through recommendations with animation)
  - Implement start activity button click handler (call onStartActivity callback)
  - Add gradient background styling: `from-blue-50 via-purple-50 to-pink-50`
  - Add border with hover effects and shadows
  - Display child name, age, category emoji, estimated time
  - Show truncated prompt title and description
  - Disable actions if completedToday is true
  - Add loading spinners for isRefreshing and isStarting states
  - Make component responsive (full width mobile, grid on desktop)
  - _Requirements: 1, 2, 3_

- [ ] 4. Create ChildCardGrid component
  - Create `components/ChildCardGrid.tsx` as client component
  - Define `ChildCardGridProps` interface with children, recommendationsMap, completedTodayMap, onStartActivity
  - Implement CSS Grid layout with responsive breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Set gap-6 and auto-rows-fr for equal height cards
  - Map over children array and render ChildCard for each
  - Add AddChildCard as last item in grid
  - Handle empty state (no children) with EmptyState component
  - _Requirements: 1_

- [ ] 5. Create AddChildCard component
  - Create `components/AddChildCard.tsx` as simple client component
  - Display "Add Child" text with plus icon
  - Link to `/children/new` route
  - Use dashed border styling to differentiate from regular child cards
  - Match height of regular ChildCard for grid consistency
  - _Requirements: 1_

- [ ] 6. Update Dashboard page to use ChildCardGrid
  - Modify `app/dashboard/page.tsx` to remove ChildSelector component import
  - Remove TodaysPromptCard component from dashboard
  - Import and use ChildCardGrid component
  - Pass children, recommendationsMap to ChildCardGrid
  - Calculate completedTodayMap for each child (check if today's prompt completed)
  - Keep all existing logic for stats, streak, completion calendar
  - Pass handleStartActivity callback to ChildCardGrid
  - Ensure ReflectionModal still works with child card interactions
  - Test that dashboard loads without errors
  - _Requirements: 1, 2, 7_

- [ ] 7. Create ConnectionInsights component
  - Create `components/ConnectionInsights.tsx` as client component
  - Define `ConnectionInsightsProps` interface with insights and childName
  - Create stats grid layout with 3 columns: weekly minutes, monthly minutes, total completions
  - Display current streak if > 0 with fire emoji
  - Display top 3 favorite categories with counts and emojis
  - Show "Just Getting Started!" message if totalCompletions < 5
  - Show "Start this week" encouragement if weeklyMinutes === 0
  - Add gradient styling for each stat card
  - Make responsive (stack on mobile)
  - _Requirements: 4_

- [ ] 8. Create PersonalizedTips component
  - Create `components/PersonalizedTips.tsx` as client component
  - Define `PersonalizedTipsProps` interface with tips array and childName
  - Map over tips array and render TipCard for each
  - Color-code cards by tip type (developmental: blue, category_balance: orange, etc.)
  - Display tip icon and message
  - Limit display to 5 tips maximum
  - Handle empty tips array (hide section entirely)
  - Add staggered animation for tip cards appearing
  - _Requirements: 5_

- [ ] 9. Create ActivityHistory component
  - Create `components/ActivityHistory.tsx` as client component
  - Define `ActivityHistoryProps` interface with completions, childName, showViewAll
  - Map over completions and render ActivityHistoryItem for each
  - Format dates with relative time ("Today", "Yesterday", "Nov 10")
  - Display prompt title, category emoji, duration in minutes
  - Add expand/collapse for reflection notes if present
  - Show "Start your first activity with {childName}!" empty state if no completions
  - Add "View All History" link if showViewAll is true
  - Limit to 7 items on detail page
  - _Requirements: 6_

- [ ] 10. Create ChildDetailClient component
  - Create `components/ChildDetailClient.tsx` as client component
  - Define `ChildDetailClientProps` interface with child, recommendations, recentCompletions, insights, tips, faithMode, userId
  - Add state for currentPromptIndex (track which recommendation is displayed)
  - Add state for reflectionOpen and completingPromptId
  - Render back navigation button to `/dashboard`
  - Render child header with name and age
  - Render TodaysPromptSection with large prompt card, refresh button, favorite button
  - Render ConnectionInsights component with insights data
  - Render PersonalizedTips component with tips array
  - Render ActivityHistory component with recent completions
  - Render MoreIdeas section with recommendation grid (skip first recommendation, show next 4-6)
  - Implement refresh button handler for today's prompt
  - Implement start activity handler
  - Implement ReflectionModal integration
  - _Requirements: 4_

- [ ] 11. Create enhanced Child Detail page
  - Modify `app/children/[id]/page.tsx` server component
  - Add parallel data fetching with Promise.all for: child profile, recommendations (limit: 10), recent completions (limit: 7), insights
  - Call `calculateInsights(childId, supabase)` to get connection stats
  - Call `generatePersonalizedTips(child, insights, completions)` to get tips
  - Pass all data to ChildDetailClient component
  - Add error handling for child not found (redirect to /children)
  - Add error handling for failed data fetches (use fallback empty data)
  - Add Sentry error tracking for all data fetch failures
  - Test page loads correctly with all sections visible
  - _Requirements: 4, 5, 6_

- [ ] 12. Update DashboardClient for child card compatibility
  - Modify `components/DashboardClient.tsx` to support handleStartActivity from ChildCardGrid
  - Ensure handleStartActivity correctly sets completingChildId state
  - Update ReflectionModal integration to work with child cards
  - Remove conditional rendering of ChildSelector (replaced by ChildCardGrid)
  - Keep all celebration logic (confetti, milestones)
  - Keep ReflectionModal, QuickMemoryButton, UpcomingEvents components
  - Test that starting activity from child card triggers reflection modal correctly
  - _Requirements: 2, 7_

- [ ] 13. Add usePromptRefresher custom hook
  - Create `lib/hooks/usePromptRefresher.ts` custom hook
  - Implement state for currentIndex and isRefreshing
  - Implement refresh() function to cycle through recommendations array
  - Add loop-back logic (return to index 0 after last recommendation)
  - Add 300ms animation delay using setTimeout
  - Return currentPrompt, refresh function, isRefreshing state, hasMore boolean
  - Export hook for use in ChildCard and ChildDetailClient
  - Write unit tests for hook logic
  - _Requirements: 3_

- [ ] 14. Integrate usePromptRefresher into ChildCard
  - Import usePromptRefresher hook in ChildCard component
  - Replace currentIndex state with hook
  - Use hook's refresh function for refresh button
  - Use hook's currentPrompt for display
  - Use hook's isRefreshing for button disabled state
  - Use hook's hasMore to conditionally show refresh button
  - Add fade/slide animation during refresh using CSS transitions
  - Test refresh button cycles through all recommendations
  - _Requirements: 3_

- [ ] 15. Integrate usePromptRefresher into ChildDetailClient
  - Import usePromptRefresher hook in ChildDetailClient component
  - Use hook for today's prompt section
  - Connect refresh button to hook's refresh function
  - Display currentPrompt in large prompt card
  - Show loading state during refresh
  - Test that refresh works on detail page
  - _Requirements: 3_

- [ ] 16. Add completedToday calculation per child
  - Modify `app/dashboard/page.tsx` to calculate completedToday for each child
  - Query prompt_completions with today's date and child_id
  - Create completedTodayMap: `Record<string, boolean>`
  - Pass completedTodayMap to ChildCardGrid
  - Update ChildCard to disable actions when completedToday is true
  - Show "Completed today!" badge on child card when true
  - _Requirements: 2_

- [ ] 17. Add loading states for dashboard
  - Add Suspense boundary around ChildCardGrid in dashboard page
  - Create SkeletonChildCard component for loading state
  - Create SkeletonChildCardGrid component rendering 3 skeleton cards
  - Add loading.tsx file in app/dashboard directory
  - Test that skeletons appear during data fetching
  - _Requirements: 4_

- [ ] 18. Add loading states for child detail page
  - Add Suspense boundary around ChildDetailClient
  - Create skeleton components for each section: TodaysPromptSkeleton, InsightsSkeleton, TipsSkeleton, HistorySkeleton
  - Create loading.tsx file in app/children/[id] directory
  - Test that skeletons appear during page load
  - _Requirements: 4_

- [ ] 19. Add error boundaries
  - Create ErrorBoundary component for ChildCardGrid
  - Create ErrorBoundary component for ChildDetailClient
  - Add fallback UI for errors (show friendly message + link to dashboard)
  - Add Sentry error tracking in error boundaries
  - Test error states by forcing errors in data fetching
  - _Requirements: 4_

- [ ] 20. Write unit tests for new components
  - Write tests for ChildCard: renders correctly, refresh cycles, start triggers callback, click navigates
  - Write tests for ConnectionInsights: displays stats, shows empty state, highlights streak
  - Write tests for PersonalizedTips: renders all tips, sorts by priority, limits to 5, color codes
  - Write tests for ActivityHistory: formats dates, shows duration, displays empty state
  - Write tests for tips-generator: generates developmental tips, detects imbalance, prioritizes re-engagement
  - Write tests for insights-calculator: calculates stats correctly, handles empty data
  - Run all tests with `npm test`
  - _Requirements: All_

- [ ] 21. Write integration tests for child detail page
  - Write test for data fetching: parallel queries complete successfully
  - Write test for insights calculation with mock completion data
  - Write test for tips generation with different scenarios (new user, imbalanced, active streak)
  - Write test for error handling: child not found, database errors
  - Run tests with `npm test -- app/children`
  - _Requirements: 4, 5, 6_

- [ ] 22. Write E2E tests for critical flows
  - Write Playwright test: "complete activity from child card" (click start → reflection → completion)
  - Write Playwright test: "refresh prompt shows new idea" (click refresh → verify different prompt)
  - Write Playwright test: "navigate to child detail page" (click card → verify all sections visible)
  - Write Playwright test: "personalized tips display correctly" (verify 1-5 tips shown)
  - Write Playwright test: "activity history shows recent completions" (verify chronological order)
  - Run tests with `npm run test:e2e`
  - _Requirements: All_

- [ ] 23. Add responsive design polish
  - Test all components on mobile viewport (320px width)
  - Test all components on tablet viewport (768px width)
  - Test all components on desktop viewport (1280px width)
  - Ensure child cards stack properly on mobile
  - Ensure stats grid stacks on mobile
  - Ensure recommendation grid adapts responsively
  - Fix any layout issues or text overflow
  - _Requirements: 1, 4_

- [ ] 24. Add animations and transitions
  - Add fade-in animation for child cards on dashboard load
  - Add slide transition for prompt refresh (fade out → fade in)
  - Add staggered animation for tip cards
  - Add hover effects for all interactive elements
  - Add smooth transitions for button states
  - Add confetti animation for activity completion (already exists, verify works)
  - Test animations are smooth (60fps) on mobile devices
  - _Requirements: 1, 3, 4_

- [ ] 25. Performance optimization
  - Add React.memo to ChildCard component
  - Add React.memo to ConnectionInsights component
  - Add React.memo to PersonalizedTips component
  - Add useMemo for expensive calculations in insights
  - Add useCallback for event handlers in ChildCard
  - Test dashboard load time < 1 second
  - Test child detail page load time < 1 second
  - Test recommendation generation < 500ms
  - Profile with React DevTools Profiler
  - _Requirements: 4_

- [ ] 26. Accessibility improvements
  - Add proper ARIA labels to all interactive elements
  - Add keyboard navigation support for child cards
  - Add focus indicators for all focusable elements
  - Add screen reader announcements for refresh actions
  - Add alt text for all images/emojis
  - Test with screen reader (VoiceOver on Mac)
  - Test keyboard-only navigation
  - Run Lighthouse accessibility audit (score > 95)
  - _Requirements: All_

- [ ] 27. Sentry error tracking integration
  - Add error tracking to calculateInsights function
  - Add error tracking to generatePersonalizedTips function
  - Add error tracking to child detail page data fetching
  - Add error tracking to ChildCardGrid component
  - Add breadcrumbs for user actions (refresh, start activity)
  - Test that errors are captured in Sentry dashboard
  - _Requirements: All_

- [ ] 28. Update documentation
  - Update README.md with new dashboard flow
  - Update ARCHITECTURE.md with new components and data flow
  - Update CLAUDE.md with child-centric UX patterns
  - Add JSDoc comments to all new utility functions
  - Add inline comments for complex logic in components
  - _Requirements: All_

- [ ] 29. Manual QA testing
  - Test full user flow: dashboard → refresh → start activity → complete → view detail page
  - Test with 0 children (empty state)
  - Test with 1 child (single card)
  - Test with 3+ children (grid layout)
  - Test with new user (0 completions, starter tips)
  - Test with active user (balanced categories, engagement tips)
  - Test with imbalanced user (category balance tips)
  - Test with inactive user (re-engagement tips)
  - Test with streak user (streak encouragement)
  - Test all edge cases from requirements
  - _Requirements: All_

- [ ] 30. Deploy and monitor
  - Create feature flag for child-centric dashboard in environment variables
  - Deploy to staging environment
  - Enable feature flag for internal testing
  - Monitor Sentry for errors
  - Monitor Vercel analytics for performance
  - Collect internal feedback
  - Fix any critical issues found
  - Deploy to production with feature flag disabled
  - Gradually enable for 10% of users (beta rollout)
  - Monitor adoption metrics and error rates
  - Enable for 100% of users if stable
  - _Requirements: All_

## Post-Launch Tasks (Future Enhancements)

- [ ] 31. Add child profile photos
  - Add photo upload to child profile form
  - Store photos in Supabase Storage
  - Display photos on child cards
  - Add default avatar if no photo
  - _Out of scope for v1_

- [ ] 32. Implement AI-generated tips using OpenAI
  - Replace rule-based tips with LLM-generated tips
  - Create prompt template for tip generation
  - Cache tips per child (refresh every 7 days)
  - Add fallback to rule-based tips if API fails
  - _Out of scope for v1_

- [ ] 33. Add export history feature
  - Create CSV export function
  - Add "Export" button to activity history
  - Generate downloadable CSV file
  - Include all completion data with timestamps
  - _Out of scope for v1_

- [ ] 34. Create weekly summary email
  - Implement scheduled job to send weekly emails
  - Include per-child connection stats
  - Include personalized tips
  - Add unsubscribe option
  - _Out of scope for v1_

## Success Criteria

✅ All unit tests pass
✅ All integration tests pass
✅ All E2E tests pass
✅ Dashboard loads in < 1 second
✅ Child detail page loads in < 1 second
✅ Recommendation engine completes in < 500ms
✅ Lighthouse accessibility score > 95
✅ No critical Sentry errors
✅ Mobile responsive (works on 320px width)
✅ Backward compatible (all existing features work)
✅ User feedback positive (internal beta testing)
