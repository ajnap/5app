# Child-Centric Dashboard Redesign - Requirements

## Introduction

The Child-Centric Dashboard Redesign transforms the app's mental model from "prompt-first" to "child-first". Parents think in terms of their children ("What should I do with Emma today?"), not in terms of browsing prompt libraries. This redesign reorganizes the entire UX around this parent-friendly mental model.

**Core Value**: Parents see all their children at a glance with personalized ideas for each, can instantly start activities or refresh for new ideas, and can dive deep into per-child insights and history.

**Current Problem**: Users must select a child, then see one prompt, then scroll to recommendations. This requires multiple clicks and doesn't show comparative options across children at a glance.

## Requirements

### Requirement 1: Child Card Dashboard

**User Story**: As a parent, I want to see all my children on the dashboard with today's personalized activity idea for each, so that I can quickly choose which child to connect with and what to do.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the system SHALL display a grid of child cards showing all children in the family
2. WHEN a child card is rendered THEN it SHALL display: child's name, age, today's personalized prompt (title + brief description), estimated time, and action buttons
3. IF a user has only one child THEN the system SHALL display a single child card (not a grid)
4. IF a user has no children THEN the system SHALL display an "Add Your First Child" card with a call-to-action
5. WHEN child cards are displayed THEN the system SHALL show an "Add Child" card as the last item in the grid
6. WHILE rendering child cards THEN the system SHALL use the top recommendation from the recommendation engine as "today's prompt"
7. IF no recommendations exist for a child THEN the system SHALL fall back to showing the most recent age-appropriate prompt

#### Edge Cases
- New child just added: Show age-appropriate starter prompt
- All prompts completed today: Show encouraging message with option to revisit favorites
- Child has no age-appropriate prompts: Show generic family activity
- Loading state: Show skeleton cards while loading

#### Visual Requirements
- Child cards should be visually prominent with gradient backgrounds
- Display child's name and age prominently
- Show category emoji for today's prompt
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Each card should have equal height for visual consistency

### Requirement 2: Quick Start from Dashboard

**User Story**: As a parent, I want to start an activity directly from a child's card on the dashboard, so that I can quickly begin connecting without extra navigation.

#### Acceptance Criteria

1. WHEN a child card displays a prompt THEN it SHALL include a "Start Activity" button
2. IF a user clicks "Start Activity" on a child card THEN the system SHALL immediately trigger the activity timer and open the reflection modal upon completion
3. WHEN a user starts an activity from a child card THEN the system SHALL automatically associate the completion with that specific child
4. IF an activity is already in progress THEN the system SHALL disable other "Start Activity" buttons to prevent concurrent activities
5. WHILE an activity is in progress THEN the active child card SHALL display a visual indicator (e.g., pulsing border, "In Progress" badge)

#### UX Requirements
- "Start Activity" button should be prominent with gradient styling
- Hover states for all interactive elements
- Smooth transitions when starting activities
- Confetti celebration when completing from dashboard
- Milestone modals still apply

### Requirement 3: Instant Prompt Refresh

**User Story**: As a parent, I want to refresh a child's suggested prompt if I'm not interested in today's idea, so that I can quickly find an activity that fits our mood without browsing the library.

#### Acceptance Criteria

1. WHEN a child card is displayed THEN it SHALL include a "Refresh" (⟳) button next to the "Start Activity" button
2. IF a user clicks the "Refresh" button THEN the system SHALL immediately show the next recommendation from the child's recommendation list
3. WHEN refreshing a prompt THEN the system SHALL cycle through available recommendations without page reload
4. IF the user has cycled through all recommendations THEN the system SHALL loop back to the first recommendation
5. WHILE refreshing THEN the system SHALL show a subtle loading indicator (spinner icon)
6. WHEN a prompt is refreshed THEN the system SHALL update only that child's card (no full page refresh)

#### Implementation Details
- Store recommendation list in client state after initial load
- Track current index in recommendation list per child
- Animate prompt transition with fade/slide effect
- Maximum refresh speed: 1 per second (prevent spam clicks)

#### Edge Cases
- Only one recommendation available: Disable refresh button
- Recommendations empty: Show fallback prompt
- Network error while refreshing: Show error toast, keep current prompt

### Requirement 4: Enhanced Child Detail Page

**User Story**: As a parent, I want to click on a child's card to see detailed insights, tips, and activity history for that child, so that I can make informed decisions and track our connection patterns.

#### Acceptance Criteria

1. WHEN a user clicks anywhere on a child card (except action buttons) THEN the system SHALL navigate to `/children/{childId}`
2. WHEN the child detail page loads THEN it SHALL display: child's name/age, today's prompt (larger version), connection insights, personalized tips, recent activity history, and additional recommendations
3. IF a user is on the child detail page THEN they SHALL see a "Back to Dashboard" navigation link
4. WHEN viewing connection insights THEN the system SHALL show: total time this week, total time this month, favorite categories, and completion count
5. IF a child has fewer than 5 completions THEN insights SHALL display encouraging "getting started" messaging

#### Sections Required on Detail Page

**Today's Prompt Section:**
- Full prompt with title, description, activity instructions
- Estimated time
- Category badge
- Actions: Start Activity, Refresh, Save to Favorites

**Connection Insights Section:**
- Weekly minutes spent
- Monthly minutes spent
- Top 3 favorite categories (by completion count)
- Total completions
- Current streak (if applicable)

**Personalized Tips Section:**
- 3-5 tips based on child's age, recent activity patterns, and category balance
- Tips should be actionable and encouraging
- Mix of developmental insights and activity suggestions

**Recent Activity History Section:**
- Last 7 days of completed activities
- Each item shows: date, prompt title, duration, category
- "View All History" link to full completion log

**More Ideas Section:**
- Grid of 4-6 additional recommendations (beyond today's prompt)
- Same format as recommendation cards

#### Data Requirements
- All data must be child-specific
- Cache insights for 1 hour
- Recalculate on new completion

### Requirement 5: Personalized Tips Generation

**User Story**: As a parent, I want to receive personalized coaching tips for each child based on their age and our activity patterns, so that I can improve the quality and variety of our connections.

#### Acceptance Criteria

1. WHEN the child detail page loads THEN the system SHALL generate 3-5 personalized tips for that child
2. IF a child's category distribution is unbalanced (one category >40%) THEN the system SHALL recommend trying underrepresented categories
3. WHEN a child has high engagement in specific categories THEN the system SHALL provide positive reinforcement and suggest similar activities
4. IF a child's age corresponds to key developmental milestones THEN the system SHALL include age-appropriate developmental insights
5. WHEN a child has not completed activities in 7+ days THEN the system SHALL include re-engagement tips
6. IF a child has a current streak THEN the system SHALL encourage maintaining the streak

#### Tip Categories

**Developmental Insights:**
- Age-appropriate tips based on child development research
- Example: "At 6, Emma is developing empathy - activities that help her notice others' feelings are great"

**Category Balance:**
- Suggest underrepresented categories
- Example: "You've been doing lots of creative activities! Try mixing in some service/gratitude ones"

**Engagement Patterns:**
- Highlight what's working well
- Example: "Emma loves 'Wonder Questions' - try more of those conversation starters"

**Streak Encouragement:**
- Motivate consistency
- Example: "You're on a 5-day streak with Emma! Keep it going!"

**Re-engagement:**
- Gentle nudges for inactive periods
- Example: "It's been a week - Emma would love some connection time!"

#### Implementation Approach
- Use rule-based logic (not AI/LLM for v1)
- Prioritize tips: developmental > category balance > engagement > streak
- Limit to 5 tips maximum (prevent overwhelming)
- Refresh tips when category distribution changes significantly

### Requirement 6: Per-Child Activity History

**User Story**: As a parent, I want to see a complete history of activities I've done with each child, so that I can reflect on our connection journey and identify patterns.

#### Acceptance Criteria

1. WHEN viewing the child detail page THEN the system SHALL display the last 7 days of completed activities in the "Recent Activity History" section
2. IF a user clicks "View All History" THEN the system SHALL navigate to a full history page showing all completions for that child
3. WHEN displaying activity history THEN each entry SHALL show: completion date, prompt title, duration (if recorded), category, and reflection note (if any)
4. IF a child has no activity history THEN the system SHALL display an encouraging empty state with a "Start Your First Activity" call-to-action
5. WHEN viewing history THEN entries SHALL be sorted by completion date (most recent first)

#### Full History Page Requirements
- Display all completions (paginate after 50)
- Filter by category
- Filter by date range
- Show statistics summary at top (total time, total activities, favorite category)
- Export to CSV option (future enhancement)

### Requirement 7: Backward Compatibility & Migration

**User Story**: As an existing user, I want the new child-centric dashboard to work seamlessly without losing any of my data or breaking existing features.

#### Acceptance Criteria

1. WHEN the redesign is deployed THEN all existing user data (children, completions, favorites) SHALL remain intact
2. IF a user has bookmarks/favorites for prompts THEN those SHALL still be accessible via the favorites page
3. WHEN existing pages (e.g., /prompts, /favorites, /account) are accessed THEN they SHALL continue to function without modification
4. IF a user has only one child THEN the experience SHALL be optimized (no unnecessary child selection)
5. WHEN the dashboard loads THEN it SHALL use the existing recommendation engine without modification

#### Pages to Preserve
- `/prompts` - Browse all prompts (keep as-is)
- `/favorites` - Saved favorites (keep as-is)
- `/account` - Subscription management (keep as-is)
- `/children` - Child profile management (keep as-is)
- `/children/new` - Add child form (keep as-is)

#### Components to Deprecate
- `ChildSelector` component (replaced by child cards)
- `TodaysPromptCard` on main dashboard (moved to child cards and detail page)
- Personalization badge (integrated into child cards)

## Out of Scope (Future Enhancements)
- AI-generated personalized tips using LLMs
- Weekly summary emails with child-specific insights
- Comparison view showing activity distribution across all children
- Joint activity recommendations for multiple children
- Goal setting per child (e.g., "Connect 5 times this week with Emma")
- Photo upload for child profiles
- Child-specific schedules/calendar integration

## Success Metrics
- Reduced time-to-activity-start (faster decision making)
- Increased daily active usage (easier to see what to do)
- Higher completion rates from dashboard vs library browsing
- More balanced category distribution across children
- Increased engagement with child detail pages
- Positive user feedback on "child-first" mental model

## Technical Constraints
- All database queries must use existing RLS policies
- Child detail page must load in <1 second
- Recommendation engine must complete in <500ms
- Mobile responsive required (320px minimum width)
- Must work with existing authentication flow
- No breaking changes to database schema
