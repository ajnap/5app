# Smart Recommendations - Implementation Plan

## Overview
This implementation plan breaks down the Smart Recommendations feature into incremental, test-driven tasks. Each task focuses on a specific component or function, building from core utilities up to the complete dashboard integration.

## Implementation Tasks

- [x] 1. Create database indexes for recommendation queries
  - Add composite index on (child_id, completion_date DESC) for efficient history queries
  - Add GIN index on tags for tag-based filtering
  - Add index on (child_id, duration_seconds, reflection_note) for engagement queries
  - _Requirements: 1.6 (Performance Constraints)_

- [x] 2. Build Category Analyzer utility
  - [x] 2.1 Implement category distribution analysis
    - Write `analyzeCategoryDistribution()` function to aggregate completion history by category
    - Calculate percentage, last completed date, avg duration per category
    - Identify underrepresented (< 10%), overrepresented (> 30%), and neglected (14+ days) categories
    - Write unit tests for distribution calculation with mock data
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Implement balance boost calculation
    - Write `getBalanceBoost()` function that returns multipliers based on category representation
    - Return 1.5x for underrepresented, 0.7x for overrepresented, 1.0x neutral
    - Write unit tests for boost calculations
    - _Requirements: 2.2, 2.3_

- [x] 3. Build Score Calculator utility
  - [x] 3.1 Implement engagement scoring functions
    - Write `calculateDurationEngagement()` to score based on duration vs estimate
    - Write `calculateReflectionEngagement()` to score based on reflection notes presence
    - Write `calculateFavoriteEngagement()` to score based on favorites
    - Write unit tests for each engagement function
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Implement filter scoring functions
    - Write `applyAgeFilter()` to check age appropriateness
    - Write `applyRecencyFilter()` to filter recently completed prompts (< 14 days)
    - Write `applyFaithModeFilter()` to filter faith-based vs secular prompts
    - Write unit tests for filter functions
    - _Requirements: 1.3, 1.4_

  - [x] 3.3 Implement composite score calculation
    - Write `calculatePromptScore()` that combines category, engagement, and filter scores
    - Apply 70% category + 20% engagement + 10% filter weighting
    - Calculate recency multiplier (0.5-1.0 based on days since completion)
    - Generate recommendation reasons (explanation text) for each score component
    - Write integration tests for full scoring with various scenarios
    - _Requirements: 3.5 (70-20-10 blend)_

- [x] 4. Build Recommendation Engine core
  - [x] 4.1 Implement data fetching and preparation
    - Write functions to fetch completion history with joined prompt data
    - Write function to fetch child profile with age calculation
    - Write function to fetch user favorites
    - Implement error handling for database queries
    - Write tests for data fetching functions
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Implement recommendation selection algorithm
    - Write `selectDiverseRecommendations()` that ensures category and tag diversity
    - Limit max 2 prompts from same category
    - Limit max 2 prompts with same primary tag
    - Implement fallback logic if < 3 recommendations found
    - Write tests for diversity guarantees
    - _Requirements: 1.1, 1.5_

  - [x] 4.3 Implement special case handlers
    - Write `getStarterRecommendations()` for new users (< 3 completions)
    - Write `getGreatestHitsRecommendations()` for exhausted prompts (all completed recently)
    - Write `forceCategoryDiversity()` for single category domination (> 50%)
    - Write tests for each special case
    - _Requirements: 1.2 (Edge Cases)_

  - [x] 4.4 Implement main engine entry point
    - Write `generateRecommendations()` function that orchestrates the full flow
    - Integrate category analyzer, score calculator, and selection algorithm
    - Add performance timing and logging
    - Implement graceful error handling with fallback prompts
    - Write integration tests for complete recommendation generation
    - Target < 500ms generation time
    - _Requirements: 1.1, 1.6 (Performance)_

- [ ] 5. Implement caching layer
  - [ ] 5.1 Add recommendation caching with Next.js unstable_cache (SKIPPED FOR MVP - caching adds complexity)
    - Implement `getCachedRecommendations()` with 2-hour TTL
    - Generate cache keys: `recommendations:${userId}:${childId}:${faithMode}:v1`
    - Add cache hit/miss logging for monitoring
    - Write tests for cache behavior
    - _Requirements: 4.3 (Performance Constraints - Cache)_

  - [ ] 5.2 Implement cache invalidation
    - Add cache invalidation trigger on activity completion
    - Add cache invalidation on child profile update
    - Add cache invalidation on faith mode toggle
    - Test cache invalidation flows
    - _Requirements: 4.3 (Recalculate on new completion)_

- [x] 6. Build RecommendedPromptCard component
  - Create `components/RecommendedPromptCard.tsx` with prompt display
  - Add "✨ Personalized for [Child]" badge
  - Display category badge with emoji
  - Show estimated time and description
  - Add tooltip with recommendation reasons (why it's recommended)
  - Add "Start Activity" button that pre-fills child selection
  - Add optional "Not Now" dismiss button
  - Style with glassmorphism matching brand colors
  - Ensure accessibility (aria-labels, keyboard navigation)
  - Test component rendering and interactions
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Build RecommendationSection component
  - Create `components/RecommendationSection.tsx` container
  - Display "Recommended for [Child Name]" heading
  - Render grid of 3-5 RecommendedPromptCard components
  - Add slide-in animation on mount (fade-in-up)
  - Create skeleton loading state component
  - Create empty state for zero recommendations
  - Handle multiple children with separate sections or tabs
  - Test responsive layout (mobile, tablet, desktop)
  - Test loading and empty states
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8. Integrate recommendations into Dashboard
  - [x] 8.1 Add server-side recommendation generation
    - Update `app/dashboard/page.tsx` to fetch recommendations for each child
    - Generate recommendations using `getCachedRecommendations()`
    - Handle errors gracefully with fallback prompts
    - Pass recommendations as props to DashboardClient
    - Measure and log generation performance
    - _Requirements: 1.1, 4.1_

  - [x] 8.2 Update DashboardClient to display recommendations
    - Add RecommendationSection above "Browse All Prompts"
    - Pass through onStartActivity handler to pre-fill child
    - Show separate recommendation sections for each child
    - Ensure recommendations are visually distinct from other sections
    - Test full user flow: view recommendations → start activity → complete → see new recommendations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Add recommendation analytics and monitoring
  - Add performance timing for recommendation generation
  - Log cache hit/miss rates
  - Track recommendation click-through rate (impressions vs clicks)
  - Add error tracking for recommendation failures
  - Create console logging for debugging (development only)
  - Test analytics tracking in various scenarios
  - _Requirements: 4.3 (Performance), Out of Scope (Success Metrics - prep for future)_

- [ ] 10. Manual testing and polish
  - Test new user experience (< 3 completions) shows diverse starters
  - Test category balance improves after multiple completions
  - Test underrepresented categories get boosted
  - Test faith mode toggle changes recommendations
  - Test child age change triggers appropriate recommendations
  - Test tooltip explanations are helpful and clear
  - Test mobile responsiveness and touch interactions
  - Test accessibility (screen reader, keyboard navigation)
  - Test error states and fallbacks
  - Test cache invalidation after activity completion
  - Verify < 500ms generation time in production
  - _Requirements: All acceptance criteria_

## Notes

- **Test-Driven Approach**: Write unit tests before or alongside each implementation task
- **Incremental Progress**: Each task should result in working, tested code
- **Performance Focus**: Monitor generation time throughout; optimize if exceeding 500ms
- **User Experience**: Prioritize clear explanations and smooth interactions
- **Accessibility**: Ensure keyboard navigation and screen reader support throughout

## Success Criteria

✅ Recommendations generate in < 500ms
✅ Category diversity improves over user's completion history
✅ New users see appropriate starter prompts
✅ All edge cases handled gracefully (exhausted prompts, single category domination)
✅ Cache invalidation works correctly
✅ UI is responsive and accessible
✅ Tooltips explain "why recommended" clearly
✅ Integration with existing dashboard is seamless
