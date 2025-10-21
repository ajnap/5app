# Implementation Plan: Demo-Ready MVP

## Day 1: Foundation & Onboarding (8 hours)

- [ ] 1. Create database migrations for new features
  - Write migration file `010_demo_mvp_enhancements.sql` with journal_entries table, profile columns (faith_mode, onboarding_completed), and reflection_note column
  - Apply migration to Supabase database and verify all tables/columns created
  - Test RLS policies by querying as different users
  - _Requirements: 3, 4, 5, 6_

- [ ] 2. Build OnboardingFlow component with faith mode toggle
  - Create `/components/OnboardingFlow.tsx` with TypeScript interfaces
  - Implement step 1: Faith mode toggle with clear explanation UI
  - Implement step 2: Simplified child form (name + birthdate only)
  - Add state management for currentStep, faithMode, childData
  - Add progress indicator showing "1 of 2" and "2 of 2"
  - Style with Tailwind using `.card` class and gradient backgrounds
  - _Requirements: 5_

- [ ] 3. Implement onboarding data submission logic
  - Create handler to save faith_mode to user profile
  - Create handler to insert first child profile
  - Update onboarding_completed and onboarding_completed_at in profile
  - Add error handling with try-catch and user-friendly alerts
  - Add loading states during submission
  - Redirect to dashboard on successful completion
  - _Requirements: 5_

- [ ] 4. Create onboarding route and integration
  - Create `/app/onboarding/page.tsx` as server component
  - Add auth check and redirect if not authenticated
  - Check if onboarding already completed and skip if so
  - Pass userId and userEmail props to OnboardingFlow component
  - Style page with gradient background consistent with app theme
  - _Requirements: 5_

- [ ] 5. Update signup flow to redirect to onboarding
  - Modify `/app/signup/page.tsx` to check onboarding_completed status after auth
  - Redirect new users to `/onboarding` instead of `/dashboard`
  - Redirect existing users directly to `/dashboard`
  - Handle edge case: user has children but onboarding_completed is false
  - _Requirements: 5_

- [ ] 6. Test onboarding flow end-to-end
  - Manually test: Sign up → onboarding step 1 → step 2 → dashboard
  - Verify faith_mode saves correctly (check database)
  - Verify child profile created with correct user_id
  - Verify onboarding doesn't show on subsequent logins
  - Test with different faith mode selections (true/false)
  - _Requirements: 5_

## Day 2: Daily Connection & Reflection (8 hours)

- [ ] 7. Build ReflectionModal component
  - Create `/components/ReflectionModal.tsx` with TypeScript interface
  - Implement modal overlay with centered card design
  - Add faith-based question conditional rendering based on faithMode prop
  - Add secular reflection question as default
  - Create text area with 500 character limit and counter
  - Add "Save & Complete" button and "Skip Note" link
  - Handle modal open/close state with backdrop click to close
  - Style with glass morphism effect and fade-in animation
  - _Requirements: 2, 4_

- [ ] 8. Implement reflection submission logic
  - Create async handler to insert prompt_completion with reflection_note
  - Update streak counter after successful save
  - Add optimistic UI update (show completion immediately)
  - Handle errors and revert optimistic updates on failure
  - Call onComplete callback prop with notes parameter
  - Close modal and show success message
  - Trigger parent component refresh (router.refresh())
  - _Requirements: 2_

- [ ] 9. Build TodaysPromptCard component
  - Create `/components/TodaysPromptCard.tsx` with props interface
  - Design prominent card with larger padding and gradient border
  - Display "Today's Connection Moment" header
  - Show category badge with color coding (spiritual: purple, emotional: pink, etc.)
  - Display activity title (large, bold) and description
  - Add estimated time badge and age-appropriateness indicator
  - Implement "Mark as Complete" button as primary CTA
  - Show completion confirmation if already completed (checkmark + message)
  - Add fade-in entrance animation
  - _Requirements: 1_

- [ ] 10. Build QuickMemoryButton and MemoryModal components
  - Create `/components/QuickMemoryButton.tsx` as floating action button
  - Position fixed bottom-right with z-index and accessible label
  - Create `/components/MemoryModal.tsx` with children selector dropdown
  - Add text area with "What made you smile today?" placeholder
  - Implement emoji reaction selector (❤️ 😊 🎉 🤗 ✨)
  - Add character count display (max 500)
  - Create "Save Memory" button with loading state
  - _Requirements: 3_

- [ ] 11. Implement memory journal save logic
  - Create handler to insert journal_entry with user_id, child_id, content, emoji_reactions
  - Add validation: require child selection and non-empty content
  - Show confirmation message: "Memory captured ❤️"
  - Clear form fields after successful save
  - Close modal and refresh child profile if viewing
  - Handle errors gracefully with user-friendly messages
  - _Requirements: 3_

- [ ] 12. Integrate ReflectionModal into DashboardClient
  - Modify `/components/DashboardClient.tsx` to add reflection modal state
  - Add faithMode state from user profile
  - Update handleMarkComplete to open reflection modal instead of direct save
  - Pass promptId, promptTitle, childId, faithMode props to modal
  - Handle onComplete callback to update completedToday state
  - Replace existing completion button with new TodaysPromptCard component
  - Test completion flow: click complete → modal opens → submit → streak updates
  - _Requirements: 1, 2_

- [ ] 13. Build ChildGrowthStats component
  - Create `/components/ChildGrowthStats.tsx` with props interface
  - Fetch category breakdown using get_category_breakdown database function
  - Calculate percentage for each category (Spiritual, Emotional, Physical, Academic, Social)
  - Map categories to colors (use existing app color scheme)
  - Render horizontal bar chart with widths based on percentages
  - Display category name, count, and percentage for each
  - Add gentle suggestion if distribution is imbalanced (e.g., one category > 50%)
  - Style with gradient bars and smooth transitions
  - _Requirements: 8_

- [ ] 14. Add memory journal display to child profile page
  - Modify `/app/children/[id]/page.tsx` to fetch journal entries
  - Query journal_entries table ordered by entry_date descending
  - Display entries in chronological feed with date headers
  - Show content text and any emoji reactions
  - Add "No memories yet" empty state with encouragement
  - Style with card layout and subtle borders between entries
  - Add QuickMemoryButton to page for easy new entries
  - _Requirements: 3, 6_

## Day 3: Polish, Deploy, Review (8 hours)

- [ ] 15. Build StreakEncouragement component
  - Create `/components/StreakEncouragement.tsx` with props interface
  - Display current streak, longest streak, and total completions
  - Implement milestone detection (7, 14, 30, 60, 90 days)
  - Show celebratory message for reached milestones
  - Handle broken streak with grace-filled message emphasizing total completions
  - Style with gradient backgrounds and emoji for milestones
  - Add subtle animation when milestone reached (confetti effect optional)
  - _Requirements: 7, 9_

- [ ] 16. Enhance child profile page with complete stats
  - Integrate ChildGrowthStats component into `/app/children/[id]/page.tsx`
  - Add StreakEncouragement component showing child-specific streak
  - Display "Today's Activity" section linking to daily prompt
  - Show recent completions (last 5) with dates and reflection notes
  - Add total activities completed badge
  - Implement "No activities yet" empty state with encouraging message
  - Test with multiple completion scenarios (0, 1, 5, 20+ completions)
  - _Requirements: 6, 7_

- [ ] 17. Fix TypeScript errors and run build test
  - Run `npx tsc --noEmit` to check for type errors
  - Fix all TypeScript errors in new components
  - Ensure all props interfaces are properly defined
  - Add missing return type annotations
  - Run `npm run build` locally to verify successful build
  - Check for any console warnings in build output
  - Verify build completes in under 5 minutes
  - _Requirements: 8, 9_

- [ ] 18. Run comprehensive manual testing checklist
  - Test authentication: signup, signin, signout, protected routes
  - Test onboarding: both faith mode options, child creation, skip for existing users
  - Test daily prompt: view for different ages, mark complete, reflection modal
  - Test memory journal: add memory, view in profile, character limit
  - Test child profiles: add, edit, view stats, activity history
  - Test streak: complete consecutive days, verify increment, break streak
  - Test responsive design: mobile (iPhone, Android), tablet, desktop
  - Test Stripe: checkout flow, payment, subscription status update
  - _Requirements: All_

- [ ] 19. Deploy to Vercel production
  - Verify all environment variables set in Vercel dashboard
  - Push to main branch to trigger automatic deployment
  - Monitor build logs in Vercel for errors
  - Verify build completes successfully
  - Test deployed production URL loads correctly
  - Verify auth redirects work with production domain
  - Test Stripe checkout on production (test mode)
  - Update Stripe webhook URL to production domain
  - _Requirements: 8_

- [ ] 20. Verify production deployment functionality
  - Sign up for new account on production
  - Complete onboarding flow
  - Add child and mark prompt complete
  - Verify database updates reflect in Supabase dashboard
  - Test on real mobile device (iPhone or Android)
  - Check page load times (should be < 2 seconds)
  - Run Lighthouse audit (target: > 80 score)
  - Verify no console errors in production
  - _Requirements: 8, 10_

- [ ] 21. Generate AI code review report
  - Use Claude Code to analyze codebase with prompt: "How many lines of code is my app? How well designed is the app on a scale of 1-10? Would this stand up in a world-class engineering shop? Save your response in a .md file"
  - Review generated CODE_REVIEW.md file
  - Verify report includes: LOC count, architecture rating, detailed analysis across criteria
  - Assess if any critical issues need immediate attention
  - Document any post-demo improvements to address
  - Include report in demo presentation materials
  - _Requirements: 9_

- [ ] 22. Address critical issues from code review
  - Fix any security vulnerabilities identified
  - Resolve critical performance issues (if any)
  - Fix accessibility violations that impact core UX
  - Update documentation if needed
  - Re-run build and deploy if changes made
  - Run final smoke test on production
  - _Requirements: 9_

- [ ] 23. Final production testing and demo prep
  - Create demo user account with realistic data
  - Add 2-3 children of different ages
  - Complete 5-7 activities with reflections
  - Add several memory journal entries
  - Verify all features work smoothly
  - Practice demo flow: signup → onboarding → complete activity → view stats
  - Prepare talking points highlighting unique value proposition
  - Take screenshots of key features for presentation
  - _Requirements: 10_

## Post-Demo Enhancements (Future)

- [ ] 24. Add voice note recording to memory journal
  - Integrate Web Audio API for recording
  - Store audio files in Supabase Storage
  - Add playback controls to journal entries
  - _Requirements: Future Phase 2_

- [ ] 25. Implement photo upload for memories
  - Add image upload to MemoryModal
  - Compress images before upload
  - Display images in journal feed
  - _Requirements: Future Phase 2_

- [ ] 26. Create "On This Day" feature
  - Query journal entries from previous years on same date
  - Display in dashboard as special section
  - Add nostalgia-inducing messaging
  - _Requirements: Future Phase 2_

- [ ] 27. Build weekly summary email
  - Create email template with week's activities
  - Send via email service (SendGrid, Resend)
  - Include highlights and encouragement
  - _Requirements: Future Phase 2_

- [ ] 28. Add E2E tests with Playwright
  - Set up Playwright testing framework
  - Write tests for critical user flows
  - Add to CI/CD pipeline
  - _Requirements: Technical Debt_

## Notes

### Testing Approach
- Prioritize manual testing given 3-day timeline
- Focus on happy path and critical error scenarios
- Test on real devices (mobile + desktop)
- Verify production deployment thoroughly

### Task Dependencies
- Day 1 tasks must complete before Day 2 (database schema needed)
- Reflection modal must be built before dashboard integration
- All features should be complete before deployment (Day 3)

### Time Estimates
- Each day allocated ~8 hours of focused work
- Buffer time included for debugging and testing
- Deploy early on Day 3 to allow time for fixes

### Success Criteria
- App is deployed and accessible to demo users
- Core flow works: signup → onboard → complete activity → view stats
- No critical bugs or TypeScript errors
- Code review report demonstrates quality engineering
- Free tier is functional without payment required
