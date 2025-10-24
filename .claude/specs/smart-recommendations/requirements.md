# Smart Prompt Recommendations - Requirements

## Introduction

The Smart Recommendations feature provides AI-powered, personalized prompt suggestions for each child based on their completion history, category balance, age appropriateness, and family patterns. This transforms the app from a static prompt library into an intelligent parenting companion that guides parents toward balanced, meaningful connections.

**Core Value**: Parents no longer need to browse 78 prompts wondering "what should we do today?" - the app intelligently surfaces the right activities at the right time.

## Requirements

### Requirement 1: Intelligent Recommendation Engine

**User Story**: As a parent, I want the app to suggest which prompts would be most beneficial for my child right now, so that I can quickly choose meaningful activities without browsing the entire library.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the system SHALL display a "Recommended for [Child Name]" section with 3-5 personalized prompt suggestions
2. IF a child has completed fewer than 3 prompts THEN the system SHALL recommend age-appropriate prompts from diverse categories to establish baseline preferences
3. WHEN a child has underrepresented categories in their completion history THEN the system SHALL prioritize prompts from those categories to encourage balance
4. IF a child completes prompts in certain categories faster or with longer reflection notes THEN the system SHALL boost recommendations from similar categories (engagement signal)
5. WHEN multiple children exist THEN the system SHALL show separate recommendation sections for each child
6. WHILE calculating recommendations THEN the system SHALL consider: completion history, category distribution, age appropriateness, recency (deprioritize recently completed), and estimated time commitment

#### Edge Cases
- New user with no completion history: Show diverse age-appropriate starter prompts
- User with only one category completed repeatedly: Strongly recommend other categories
- All prompts completed recently: Show "You're doing amazing! Here are some favorites to revisit"
- Child age updated: Immediately recalculate to show age-appropriate content

### Requirement 2: Category Balance Intelligence

**User Story**: As a parent, I want the app to help me provide diverse developmental experiences for my child, so that I'm not accidentally focusing only on one type of activity.

#### Acceptance Criteria

1. WHEN calculating recommendations THEN the system SHALL analyze category distribution in the child's completion history
2. IF a category represents less than 10% of completions AND child has 10+ completions THEN the system SHALL flag that category as "underrepresented" and boost its recommendation score by 50%
3. WHEN a category has been completed more than 30% of the time THEN the system SHALL reduce its recommendation score by 30% to encourage variety
4. IF a child hasn't completed any prompts from a major category (e.g., "Creative Expression", "Emotional Connection") in the last 14 days THEN the system SHALL surface at least one prompt from that category
5. WHILE displaying recommendations THEN the system SHALL show a subtle category indicator (emoji/badge) to help parents recognize the variety

#### Edge Cases
- Faith mode toggled: Recalculate immediately to show faith-based or secular prompts
- Seasonal prompts: Boost recommendations for time-sensitive activities (e.g., outdoor prompts in summer)

### Requirement 3: Engagement Pattern Learning

**User Story**: As a parent, I want the app to learn which types of activities resonate most with my child, so that recommendations become increasingly personalized over time.

#### Acceptance Criteria

1. WHEN a child completes a prompt with duration > estimated_minutes THEN the system SHALL record this as a positive engagement signal (they took their time)
2. IF a child adds a reflection note THEN the system SHALL increase that prompt's category engagement score by 1.5x
3. WHEN a child favorites a prompt THEN the system SHALL boost similar prompts (same category + similar themes) in recommendations
4. IF a prompt is started but not completed (timer started, no completion record after 1 hour) THEN the system SHALL decrease that category's priority score by 0.8x
5. WHILE calculating recommendations THEN the system SHALL blend: 70% category balance + 20% engagement signals + 10% age/faith mode filters

#### Constraints
- Engagement scores decay over time (older completions have less weight)
- Maximum engagement boost: 2x (prevent over-personalization)
- Minimum score floor: 0.3x (always show some variety)

### Requirement 4: Dashboard Integration & UX

**User Story**: As a parent, I want to see recommended prompts directly on my dashboard with clear explanations, so that I can quickly start a meaningful activity without extra navigation.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL display recommendations in a visually distinct section above "Browse All Prompts"
2. IF multiple children exist THEN the system SHALL show tabs or separate cards for each child's recommendations
3. WHEN hovering over a recommended prompt THEN the system SHALL display a tooltip explaining why it was recommended (e.g., "Great for creative expression - you haven't tried this category in a while!")
4. IF a user clicks "Start Activity" from recommendations THEN the system SHALL pre-fill the child selection (if recommended for specific child)
5. WHEN recommendations are loading THEN the system SHALL show skeleton loaders (not blank space)
6. IF the recommendation engine fails THEN the system SHALL gracefully fall back to showing age-appropriate prompts without explanation

#### UX Polish
- Animate recommendations with a subtle slide-in effect
- Show a small "✨ Personalized for [Child]" badge
- Include estimated time on each recommended card
- Allow dismissing a recommendation ("Not now") which boosts other categories temporarily

#### Performance Constraints
- Recommendation calculation must complete within 500ms
- Cache recommendations for 2 hours (recalculate on new completion)
- Use database indexes on user_id, child_id, completion_date, category

## Out of Scope (Future Enhancements)
- ML-based recommendation models (this version uses rule-based scoring)
- Time-of-day recommendations (morning vs evening activities)
- Weather-based recommendations (outdoor prompts on sunny days)
- Multi-child joint activity recommendations
- Parent preference survey to seed recommendations

## Success Metrics
- 70%+ of users start activities from recommendations (vs browsing library)
- Increased category diversity in user completion patterns
- Higher reflection note rates on recommended prompts
- Reduced time-to-activity-start (faster decision making)
