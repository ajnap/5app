# Enhanced Profile Cards with AI Insights - Requirements

## Introduction

Parents want flexibility to connect multiple times per day with their children, receive personalized AI-powered insights about their connection patterns, and get daily coaching reminders that help them plan meaningful interactions. This feature transforms the app from a "one activity per day" model to an unlimited, insight-driven approach that adapts to each family's unique rhythm.

**Core Value**: Empower parents with unlimited connection opportunities, intelligent pattern analysis, and proactive coaching that helps them understand and improve their parent-child relationship.

**Current Limitations**:
- Parents can only complete one activity per child per day (artificial restriction)
- Tips are rule-based and don't learn from actual behavior patterns
- No proactive daily reminders or coaching guidance
- Limited insight into what's working well vs what needs attention

## Requirements

### Requirement 1: Unlimited Daily Activities Per Child

**User Story**: As a parent, I want to complete multiple connection activities with each child in a single day, so that I can take advantage of unexpected connection moments and build on positive momentum.

#### Acceptance Criteria

1. WHEN a parent completes an activity with a child THEN the system SHALL allow them to immediately start another activity with the same child
2. IF a parent completes multiple activities in one day THEN each SHALL be tracked separately with its own completion record, reflection notes, and duration
3. WHEN viewing the child card on the dashboard THEN it SHALL show "X activities today" instead of "Completed today" to encourage more connections
4. IF a child has completed 3+ activities today THEN the child card SHALL display a celebration indicator (e.g., "< Amazing! 3 connections today!")
5. WHEN generating recommendations THEN the system SHALL exclude activities completed within the last 2 hours (not the entire day) to ensure variety
6. IF all recommendations have been completed recently THEN the system SHALL allow repeating the least-recently-completed activity

#### Edge Cases
- Parent completes same activity twice in one day: Track both separately
- Child has completed all available age-appropriate prompts in one day: Show encouraging message and allow repeats
- Parent starts activity at 11:58 PM and completes at 12:02 AM: Count as separate days
- Rapid completions (< 1 minute apart): Allow but flag for potential data quality issues

#### Visual Requirements
- Child card badge: "2 activities today" with gradient background
- Progress ring showing daily activities count (visual indicator)
- Celebration animation for 3+ activities in one day
- "Keep going!" call-to-action after each completion

### Requirement 2: AI-Generated Personalized Insights

**User Story**: As a parent, I want to receive AI-powered insights about my connection patterns with each child, so that I can understand what's working well and where I need to focus attention.

#### Acceptance Criteria

1. WHEN a parent views a child's profile page THEN the system SHALL display an "AI Insights" section with 2-3 personalized observations
2. IF a child has 10+ completions THEN the system SHALL use OpenAI API to analyze patterns and generate insights about:
   - Consistency patterns ("You connect most with Emma on weekday mornings")
   - Category preferences ("Emma really lights up during creative activities")
   - Engagement depth ("Your reflection notes show deep connection in emotional moments")
   - Strengths to celebrate ("You've built a beautiful routine of bedtime connections")
   - Gentle suggestions ("Emma hasn't had many service activities lately - these could help develop empathy")
3. WHEN generating insights THEN the AI SHALL use: completion history (last 30 days), reflection notes, duration data, category distribution, time-of-day patterns, and child profile information
4. IF a parent has been inactive for 7+ days THEN the insight SHALL include re-engagement encouragement without guilt
5. WHEN insights are generated THEN they SHALL be cached for 7 days to reduce API costs and stay within budget
6. IF the OpenAI API fails THEN the system SHALL gracefully fall back to rule-based tips without showing an error
7. WHEN a user requests insight regeneration THEN the system SHALL only allow it if 7+ days have passed since last generation

#### Data Inputs for AI Insights
- Completion frequency and recency
- Reflection note sentiment and depth
- Activity duration vs estimated time (engagement indicator)
- Category balance over time
- Time of day patterns
- Child's age, interests, personality traits
- Parent's stated focus areas from child profile

#### Insight Categories
- **Pattern Recognition**: "You tend to connect most with Emma during..."
- **Celebration**: "You're doing an amazing job with..."
- **Gentle Guidance**: "Emma might enjoy more..."
- **Developmental Alignment**: "At Emma's age, activities that..."
- **Relationship Deepening**: "Your notes show Emma opens up most when..."

#### Implementation Approach
- Use GPT-3.5-turbo for cost-effective insights (budget: $0.01-0.015 per insight generation)
- Structured prompt with clear context and output format
- Cache insights per child for 7 days (weekly refresh cycle)
- Regenerate when: 7 days have passed, user clicks "Refresh Insights" (if eligible), or child reaches 10 completion milestone
- Only generate for children with 10+ completions to ensure sufficient data quality

### Requirement 3: Daily General Reminders with Coaching

**User Story**: As a parent, I want to receive a unique daily reminder that helps me think about connection planning and offers practical guidance, so that I'm inspired and equipped to prioritize quality time with my children.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the system SHALL display a "Daily Reminder" card at the top with a unique, thought-provoking message
2. IF the daily reminder is displayed THEN it SHALL be consistent for all users on the same calendar day (same message, not personalized per user)
3. WHEN the daily reminder is generated THEN it SHALL use one of these formats:
   - Reflective question: "When was the last time you sat down with your child and asked how they're really doing?"
   - Practical offer: "Need help planning connection time into your schedule? Let me suggest some pockets of time..."
   - Conversation starter: "Stuck on what to talk about? Try asking your child about..."
   - Research insight: "Studies show that 5 minutes of undivided attention creates more connection than..."
   - Challenge: "Today's challenge: Notice one small moment to celebrate with each child"
4. IF a user clicks "Help me with this" on a reminder THEN the system SHALL open a modal with:
   - Expanded guidance (2-3 paragraphs)
   - Actionable steps (3-5 bullet points)
   - Suggested activities from the library related to this theme
   - Option to schedule a calendar reminder
5. WHEN reminders are generated THEN they SHALL be stored in the database with: date, message, expanded_guidance, related_categories
6. IF no reminder exists for today THEN the system SHALL use OpenAI API to generate a fresh one based on seasonal/monthly themes

#### Reminder Themes (Rotating Monthly Focus)
- **Connection Planning**: Time management, scheduling, saying no to other commitments
- **Conversation Starters**: What to talk about, asking better questions, active listening
- **Emotional Attunement**: Noticing feelings, validating emotions, co-regulation
- **Developmental Awareness**: Age-appropriate expectations, milestone support
- **Self-Care for Parents**: Managing parenting stress, patience cultivation, grace for yourself
- **Relationship Repair**: Reconnecting after conflict, apologies, rebuilding trust
- **Joy and Play**: Not taking life too seriously, laughing together, being silly
- **Consistency Over Perfection**: Small moments add up, progress not perfection

#### Daily Reminder Visual Design
- Prominent card at top of dashboard
- Gradient background with soft colors
- Icon/emoji relevant to theme
- "Help me with this" button prominently displayed
- Dismissible but persists until next day

### Requirement 4: Enhanced Child Profile Card Redesign

**User Story**: As a parent, I want the child card to show rich, actionable information at a glance, so that I can quickly understand our connection status and feel motivated to engage.

#### Acceptance Criteria

1. WHEN a child card is rendered on the dashboard THEN it SHALL display:
   - Child's name and age (existing)
   - Today's activity count with progress visualization
   - Current streak (if 3+ days)
   - Next recommended activity with "Start" button
   - AI Insight teaser (first 15 words + "Read more")
   - Quick stats: total activities this week, total minutes this month
2. IF a child has 0 activities this week THEN the card SHALL show gentle encouragement ("Ready to connect with Emma?")
3. WHEN a parent hovers over the AI insight teaser THEN it SHALL expand to show the full insight without navigation
4. IF a parent clicks anywhere on the card (except buttons) THEN it SHALL navigate to the detailed child profile page
5. WHEN the card displays the activity count badge THEN it SHALL use color psychology:
   - 0 activities: Neutral gray
   - 1 activity: Soft blue (good start)
   - 2 activities: Warm purple (great job)
   - 3+ activities: Vibrant gold (celebrate!)

#### Card Layout Sections
```
                                 
 Emma, 6 years old          PPP  (3 activities badge)
                                 
 Today's Recommended Activity:   
 [Activity Title]                
 [Category emoji] [Est. time]    
 [Start Activity] [Refresh]      
                                 
 ( AI Insight:                  
 "Emma really lights up during...
  [Read more]                    
                                 
 =% 5-day streak                 
 =� 4 activities this week       
 � 38 minutes this month        
                                 
```

### Requirement 5: AI Insight Generation API Integration

**User Story**: As a system, I need to efficiently generate high-quality AI insights using OpenAI's GPT-4 API while managing costs and handling failures gracefully.

#### Acceptance Criteria

1. WHEN the system generates AI insights THEN it SHALL use the OpenAI GPT-4 API with a structured prompt containing:
   - Child's profile (name, age, interests, personality traits, parent focus areas)
   - Completion history (last 30 days with dates, categories, durations, reflection notes)
   - Aggregated stats (total completions, category distribution, average duration, consistency pattern)
   - Current date and day of week (for temporal context)
2. IF the API call succeeds THEN the system SHALL parse the response into 2-3 distinct insights with type classification
3. WHEN storing insights THEN the system SHALL save: child_id, generated_at timestamp, insights_json (array), expires_at (24 hours), generation_cost
4. IF the API call fails THEN the system SHALL log the error to Sentry and return fallback rule-based insights
5. WHEN the API response is received THEN it SHALL be validated for:
   - Appropriate tone (warm, encouraging, non-judgmental)
   - Actionable guidance (not just observations)
   - Accurate data interpretation
   - No use of child's name in a way that feels impersonal
6. IF insights have not expired (< 7 days old) THEN the system SHALL return cached insights without calling the API
7. WHEN calculating monthly API costs THEN the system SHALL track total spend and stop generating new insights if approaching $4 limit

#### API Cost Management
- **Budget**: $4/month maximum for insight generation (~200-300 insight generations)
- **Model**: Use GPT-3.5-turbo instead of GPT-4 ($0.001/1K input tokens, $0.002/1K output tokens)
- **Estimated cost per insight**: ~$0.01-0.015 (500 input tokens + 300 output tokens)
- **Cache duration**: 7 days per child (vs 24 hours) to reduce regenerations
- **Eligibility**: Only generate AI insights for children with 10+ completions (ensures quality data)
- **Rate limiting**: Maximum 1 insight generation per child per week
- **Daily reminders**: Use curated library only (no AI generation) to preserve budget for insights
- **Graceful degradation**: Always have rule-based fallback

#### Prompt Engineering Requirements
- Temperature: 0.7 (balance between creativity and consistency)
- Max tokens: 300 (approx 2-3 insights at 100 words each)
- Model: gpt-3.5-turbo (cost-effective, still high quality)
- System message: Establish role as parenting coach with research-backed, faith-centered approach
- User message: Structured data + clear task + output format specification
- Few-shot examples: Include 2-3 example insights in prompt for consistency

### Requirement 6: Daily Reminder Generation System

**User Story**: As a system, I need to generate or retrieve a unique daily reminder that is consistent across all users for a given day.

#### Acceptance Criteria

1. WHEN a user loads the dashboard THEN the system SHALL check if a daily reminder exists for today's date
2. IF no reminder exists for today THEN the system SHALL retrieve one from the curated fallback library (no AI generation for cost management):
   - Current date and season (spring, summer, fall, winter)
   - Monthly theme (based on current month's focus area)
   - Previous 7 days' reminders (to avoid repetition within the library)
3. WHEN generating a reminder THEN it SHALL include:
   - Main message (1-2 sentences, thought-provoking)
   - Reminder type (reflective_question, practical_offer, conversation_starter, research_insight, challenge)
   - Expanded guidance (2-3 paragraphs with actionable steps)
   - Related activity categories (array of category names that fit this theme)
   - Icon/emoji (single emoji representing the theme)
4. IF a reminder exists for today THEN the system SHALL retrieve it from the database (shared across all users)
5. WHEN a user clicks "Help me with this" THEN the system SHALL display the expanded guidance in a modal
6. ALL daily reminders SHALL come from the curated library (no AI generation) to preserve OpenAI budget exclusively for personalized child insights

#### Reminder Storage Schema
```sql
CREATE TABLE daily_reminders (
  id UUID PRIMARY KEY,
  reminder_date DATE UNIQUE NOT NULL,
  message TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  expanded_guidance TEXT NOT NULL,
  related_categories TEXT[] NOT NULL,
  icon TEXT NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  generation_source TEXT NOT NULL -- 'openai' or 'fallback'
);
```

#### Curated Reminder Library (PRIMARY SOURCE)
- Maintain 100+ pre-written high-quality reminders across all themes
- Organize by monthly focus area (8-10 reminders per theme)
- Rotate intelligently to avoid repetition (track last 30 days)
- Professional copywriting quality (not AI-generated)
- Each reminder includes expanded guidance and related categories
- Review and add new reminders quarterly

## Out of Scope (Future Enhancements)

- Push notifications for daily reminders
- Email digest of weekly insights
- Comparison insights across multiple children ("Your connection style differs with each child...")
- Voice-based reflection notes
- Photo attachment to completions
- Goal setting per child ("Connect 5 times this week")
- Shared insights for co-parents
- Export insights as PDF report
- Historical insight timeline ("3 months ago you were working on...")

## Success Metrics

- **Increased Engagement**: Average daily activities per user increases from 1.0 to 2.5+
- **Retention**: Users who receive AI insights have 30%+ higher 30-day retention
- **Depth of Connection**: Reflection note submission rate increases by 20%+
- **API Cost Efficiency**: Stay within $4/month budget for OpenAI API calls (strict requirement)
- **Cost per user**: Target <$0.50 per active user per month for AI insights
- **User Satisfaction**: 80%+ of users rate AI insights as "helpful" or "very helpful"
- **Daily Reminder Engagement**: 40%+ of users click "Help me with this" at least once per week
- **Cache hit rate**: 85%+ of insight requests served from cache (not API)

## Technical Constraints

- **OpenAI API Budget**: $4/month maximum spend (strict cost management required)
- **Cost per insight**: Target $0.01-0.015 using GPT-3.5-turbo
- **Monthly insight budget**: ~200-300 total AI insights across all users
- **Cache duration**: 7 days minimum to reduce regenerations
- **Eligibility threshold**: Only children with 10+ completions get AI insights
- **Response Time**: AI insight generation must complete in < 3 seconds
- **Graceful Degradation**: All AI features must have non-AI fallbacks
- **Database Performance**: Caching insights must not slow down dashboard load (<1 second)
- **Mobile Responsive**: All new UI components must work on 320px width screens
- **Accessibility**: AI-generated content must pass WCAG 2.1 AA standards
- **Cost monitoring**: Real-time tracking of monthly OpenAI spend with automatic cutoff at $4

## Privacy & Ethical Considerations

- **Data Minimization**: Only send necessary data to OpenAI API (no PII beyond first name and age)
- **Transparency**: Clearly label AI-generated insights as "AI-powered"
- **Tone Sensitivity**: AI must never sound judgmental or shame parents
- **Cultural Sensitivity**: Insights must respect diverse parenting styles
- **Consent**: Users must opt-in to AI insights (default: enabled, can be disabled in settings)
- **Data Retention**: AI insights cached for 7 days, then can be regenerated if eligible

## Dependencies

- **OpenAI API**: Requires valid API key and GPT-3.5-turbo access
- **Database Schema Changes**: New tables for daily_reminders and ai_insights_cache
- **Existing Systems**: Builds on current recommendation engine, completion tracking, child profiles
- **Supabase Edge Functions**: May use for background insight generation jobs
