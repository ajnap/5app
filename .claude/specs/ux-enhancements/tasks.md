# Implementation Plan: UX Enhancement Features

## Phase 1: Database & Dependencies

- [ ] 1. Install canvas-confetti library
  - Run `npm install canvas-confetti @types/canvas-confetti`
  - Verify installation in package.json
  - _Requirements: 2.1_

- [ ] 2. Create database migration for duration tracking
  - Create `011_activity_duration_tracking.sql`
  - Add `duration_seconds` and `started_at` to prompt_completions
  - Add `estimated_minutes` to daily_prompts with default value
  - Update existing prompts with estimated durations (5, 10, or 15 min based on category)
  - _Requirements: 3.1, 3.2, 3.3_

## Phase 2: Empty State Components

- [ ] 3. Build reusable EmptyState component
  - Create `components/EmptyState.tsx` with icon, title, description, CTA props
  - Style with gradient background, rounded corners, centered layout
  - Add hover animations for CTA button
  - Support both navigation links and onClick handlers
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. Update DashboardClient with empty children state
  - Add conditional rendering when children.length === 0
  - Show EmptyState with "Add Your First Child" message
  - Link to /onboarding or /children/new
  - _Requirements: 1.1_

- [ ] 5. Update favorites page with empty state
  - Check if favorites list is empty
  - Render EmptyState with "Start favoriting prompts!" message
  - Add "Browse Prompts" CTA linking to /prompts
  - _Requirements: 1.2_

- [ ] 6. Update streak display with zero-state handling
  - Modify dashboard streak card to detect 0 streak
  - Replace "0 days" with "Start Your Journey Today!" message
  - Show encouraging icon (🌱 or ✨)
  - _Requirements: 1.3_

## Phase 3: Celebration Animations

- [ ] 7. Build ConfettiCelebration component
  - Create `components/ConfettiCelebration.tsx`
  - Integrate canvas-confetti library
  - Configure colors to match brand palette (#6C63FF, #FFC98A, #F9EAE1)
  - Fire from bottom center with upward spread
  - Add useEffect to trigger on prop change
  - Respect prefers-reduced-motion media query
  - _Requirements: 2.1, 2.3_

- [ ] 8. Build MilestoneCelebration modal component
  - Create `components/MilestoneCelebration.tsx`
  - Define milestone messages for 1st, 7, 14, 30, 60, 90 days
  - Create modal with backdrop blur, large emoji, gradient background
  - Add auto-close after 4 seconds
  - Support manual close with X button and Escape key
  - Animate emoji with scale and rotation
  - _Requirements: 2.2, 2.4, 2.5_

- [ ] 9. Add milestone detection logic
  - Create utility function `detectMilestone(currentStreak: number): Milestone | null`
  - Check against milestone thresholds [1, 7, 14, 30, 60, 90]
  - Return highest achieved milestone or null
  - _Requirements: 2.2, 2.5_

- [ ] 10. Integrate celebrations into completion flow
  - Update ReflectionModal's onComplete handler
  - Trigger confetti immediately on completion
  - Check for milestone and show MilestoneCelebration BEFORE ReflectionModal
  - Pass streak count from dashboard to components
  - Update state to show celebrations in correct sequence
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

## Phase 4: Activity Timer

- [ ] 11. Build ActivityTimer component
  - Create `components/ActivityTimer.tsx`
  - Implement timer state (startTime, elapsedSeconds, isRunning)
  - Update every 10 seconds using setInterval
  - Format display as "X min Y sec"
  - Store startTime in localStorage for persistence
  - Add progress bar showing elapsed vs estimated time
  - Change color when exceeding estimate (orange tone)
  - _Requirements: 3.1, 3.2, 3.6_

- [ ] 12. Integrate timer into TodaysPromptCard
  - Add "Start Activity" button that begins timer
  - Show timer display while activity is in progress
  - Replace "Mark Complete" button with timer controls
  - Pass duration to ReflectionModal on completion
  - Clear localStorage timer on completion
  - _Requirements: 3.2, 3.3_

- [ ] 13. Update ReflectionModal to display duration
  - Accept `durationSeconds` prop
  - Calculate minutes from seconds
  - Show "You spent X minutes connecting today!" message
  - Show encouraging message if duration > estimated
  - Pass duration to database insert
  - _Requirements: 3.3, 3.4, 3.6_

- [ ] 14. Add weekly/monthly time stats to dashboard
  - Create RPC function `get_time_stats(user_id, period)` in Supabase
  - Sum duration_seconds for completions in period
  - Display stats card showing "X minutes this week"
  - Show comparison to previous period if available
  - _Requirements: 3.5_

## Phase 5: Loading States

- [ ] 15. Build SkeletonPromptCard component
  - Create `components/SkeletonPromptCard.tsx`
  - Match TodaysPromptCard dimensions and layout
  - Use animate-pulse for shimmer effect
  - Add gray placeholder bars for text
  - _Requirements: 4.1_

- [ ] 16. Build SkeletonChildProfile component
  - Create `components/SkeletonChildProfile.tsx`
  - Match child profile page layout
  - Add skeleton bars for stats section
  - Add skeleton circles for emoji reactions
  - Stagger animation delays for visual interest
  - _Requirements: 4.2_

- [ ] 17. Update DashboardClient with loading state
  - Add `isLoading` state initialized to true
  - Render SkeletonPromptCard while loading
  - Use useEffect to set isLoading to false after data loads
  - Add fade-in transition when switching to real content
  - _Requirements: 4.1, 4.4_

- [ ] 18. Update child profile page with loading state
  - Wrap data fetching in try-catch for error handling
  - Show SkeletonChildProfile while fetching
  - Transition to real content with fade-in
  - Add error state with retry button on failure
  - _Requirements: 4.2, 4.4, 4.5_

- [ ] 19. Update CompletionCalendar with loading state
  - Add loading prop to CompletionCalendar component
  - Show skeleton calendar grid while loading
  - Fade in real calendar data when ready
  - _Requirements: 4.3, 4.4_

## Phase 6: Polish & Testing

- [ ] 20. Add accessibility improvements
  - Add aria-live region to timer for screen readers
  - Add aria-busy to loading states
  - Ensure all modals trap focus
  - Test keyboard navigation for all interactive elements
  - Verify all animations respect prefers-reduced-motion
  - _Requirements: All (Constraints)_

- [ ] 21. Test edge cases
  - Verify timer persists across page refresh
  - Test timer behavior for activities >1 hour
  - Verify multiple milestones don't stack (show highest only)
  - Test confetti on slow connections
  - Test empty states for all data combinations
  - _Requirements: All (Edge Cases)_

- [ ] 22. Update all prompts with estimated durations
  - Review prompt library categorization
  - Assign 5 min to simple prompts (quick questions, single activities)
  - Assign 10 min to standard prompts (conversations, projects)
  - Assign 15 min to deep prompts (storytelling, complex crafts)
  - Run SQL update statement in migration
  - _Requirements: 3.1_

- [ ] 23. Run build and fix TypeScript errors
  - Execute `npm run build`
  - Fix any type errors in new components
  - Ensure all props are properly typed
  - Verify no console warnings
  - _Requirements: All_

- [ ] 24. Test complete user flows
  - New user journey (empty states → onboarding → first completion)
  - Activity completion with timer and celebration
  - Milestone achievement at each threshold
  - Loading states on slow connection (throttle in DevTools)
  - Verify all toasts and modals appear correctly
  - _Requirements: All_

- [ ] 25. Commit and deploy to production
  - Git add all new files and changes
  - Commit with descriptive message
  - Push to GitHub
  - Apply database migration to production Supabase
  - Monitor Vercel deployment
  - Test production URL
  - _Requirements: All_
