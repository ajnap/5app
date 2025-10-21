# Demo-Ready MVP Requirements

## Introduction

This spec focuses on polishing the existing application to deliver a world-class demo in 3 days. The app already has authentication, Stripe integration, child profiles, and a prompt library. We need to refine the daily connection experience, ensure deployment is solid, and add the critical features that demonstrate the unique value proposition: intentional, faith-informed family connection.

## Demo Success Criteria
- One or more working features that deliver on customer value proposition
- Functional back-end with Supabase, user authentication, and Stripe payments integrated ✅
- Application deployed to Vercel
- Free tier/trial signup functional ✅
- AI generated code review in .md file

## Requirements

### Requirement 1: Daily Connection Prompt Delivery (Polish Existing)
**User Story:** As a parent, I want to see today's personalized connection prompt when I log in so that I know exactly what to do with my child today.

#### Acceptance Criteria
1. WHEN a parent logs into the dashboard THEN the system SHALL display a prominent "Today's Connection Moment" section at the top
2. WHEN no child is selected THEN the system SHALL prompt the parent to select a child first
3. WHEN a child is selected THEN the system SHALL display an age-appropriate prompt from the library
4. WHEN displaying the prompt THEN the system SHALL show: activity title, description, category badge, estimated time, and preparation tips
5. WHEN a prompt is age-appropriate THEN the system SHALL filter based on the child's calculated age
6. IF the parent has completed today's activity THEN the system SHALL display completion confirmation with positive messaging

### Requirement 2: Guided Activity Completion with Reflection
**User Story:** As a parent, I want to mark activities as complete and optionally reflect on the experience so that I build a meaningful record of our connection moments.

#### Acceptance Criteria
1. WHEN viewing today's prompt THEN the system SHALL display a clear "Mark as Complete" button
2. WHEN the parent clicks "Mark as Complete" THEN the system SHALL show a reflection prompt overlay
3. WHEN the reflection overlay appears THEN the system SHALL offer: "How did it go?" text input (optional, 500 char max)
4. WHEN the parent submits completion THEN the system SHALL save to prompt_completions table with timestamp
5. WHEN completion is saved THEN the system SHALL update the streak counter immediately
6. WHEN completion is confirmed THEN the system SHALL display encouraging message: "Beautiful! You just created a moment they'll remember."
7. IF the parent wants to skip reflection THEN the system SHALL allow "Complete without note" option

### Requirement 3: Memory Journal Quick Entries
**User Story:** As a parent, I want to quickly jot down funny quotes or sweet moments so that I capture memories before I forget them.

#### Acceptance Criteria
1. WHEN on the dashboard THEN the system SHALL display a "Quick Memory" floating action button
2. WHEN the parent clicks "Quick Memory" THEN the system SHALL open a simple text input modal
3. WHEN the modal opens THEN the system SHALL show: child selector dropdown, text area (500 chars), and optional emoji reactions
4. WHEN the parent submits a memory THEN the system SHALL save to a journal_entries table with timestamp and child_id
5. WHEN viewing a child's profile THEN the system SHALL display recent memory entries in chronological order
6. WHEN a memory is saved THEN the system SHALL provide gentle confirmation: "Memory captured ❤️"

### Requirement 4: Faith-Based Reflection (Optional Toggle)
**User Story:** As a parent with faith values, I want optional spiritual reflection prompts so that I can connect our activities to deeper meaning.

#### Acceptance Criteria
1. WHEN a new user signs up THEN the system SHALL ask during onboarding: "Would you like faith-based reflection prompts?" with Yes/No options
2. WHEN the user selects Yes THEN the system SHALL save faith_mode: true in their profile
3. IF faith_mode is enabled THEN the system SHALL add a gentle spiritual question after activity completion: "What did this moment teach you about God's love?"
4. WHEN faith reflection is shown THEN the system SHALL be optional and non-pressuring
5. WHEN viewing settings THEN the system SHALL allow toggling faith mode on/off at any time
6. IF faith_mode is disabled THEN the system SHALL show purely secular reflection prompts

### Requirement 5: Onboarding Flow for New Users
**User Story:** As a new parent, I want to quickly understand the app's purpose and set up my first child so that I can start connecting immediately.

#### Acceptance Criteria
1. WHEN a user signs up for the first time THEN the system SHALL redirect to an onboarding page
2. WHEN onboarding starts THEN the system SHALL show: "Welcome! Let's create meaningful moments with your children."
3. WHEN on step 1 THEN the system SHALL ask: "Would you like faith-based reflection prompts?" with clear explanation
4. WHEN on step 2 THEN the system SHALL prompt: "Tell us about your first child" with name and birthdate fields
5. WHEN the parent completes onboarding THEN the system SHALL redirect to dashboard with first prompt visible
6. WHEN onboarding is complete THEN the system SHALL save onboarding_completed: true in profile
7. IF a user has already completed onboarding THEN the system SHALL never show it again

### Requirement 6: Enhanced Child Profile View
**User Story:** As a parent, I want to see my child's growth and our connection history so that I feel motivated to continue.

#### Acceptance Criteria
1. WHEN viewing a child's profile page THEN the system SHALL display: name, age, photo (if added), total activities completed, current streak
2. WHEN on the child profile THEN the system SHALL show activity distribution by category (visual breakdown)
3. WHEN viewing history THEN the system SHALL display recent completions with dates and any reflection notes
4. WHEN viewing memories THEN the system SHALL show journal entries chronologically with dates
5. IF no activities completed yet THEN the system SHALL show encouraging message: "Your journey begins today!"
6. WHEN viewing the profile THEN the system SHALL have a "Today's Activity" section linking to daily prompt

### Requirement 7: Streak Encouragement Without Pressure
**User Story:** As a parent, I want to see my consistency celebrated without feeling guilty about missed days.

#### Acceptance Criteria
1. WHEN a parent completes consecutive daily activities THEN the system SHALL display streak count prominently
2. WHEN viewing streak stats THEN the system SHALL show: current streak, longest streak ever, total completions
3. WHEN reaching 7-day milestone THEN the system SHALL display: "A full week of connection! 🎉"
4. WHEN reaching 30-day milestone THEN the system SHALL display: "One month of intentional moments! You're building something beautiful."
5. IF a streak is broken THEN the system SHALL show: "That's okay—what matters is showing up. Your [X] total activities show your heart."
6. WHEN viewing broken streak THEN the system SHALL emphasize total completions over consecutive days
7. WHEN returning after missing days THEN the system SHALL welcome back: "We're glad you're here. Today is a new beginning."

### Requirement 8: Vercel Deployment Configuration
**User Story:** As the developer, I want the app deployed to Vercel with proper environment variables so that demo users can access it.

#### Acceptance Criteria
1. WHEN deploying to Vercel THEN the system SHALL use Next.js 14.1.0 build configuration
2. WHEN environment variables are set THEN the system SHALL include: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
3. WHEN the build runs THEN the system SHALL complete without TypeScript or build errors
4. WHEN accessing the deployed URL THEN the system SHALL load the homepage within 2 seconds
5. WHEN a user signs up on production THEN the system SHALL successfully authenticate via Supabase
6. WHEN Stripe checkout occurs THEN the system SHALL properly handle webhooks on the deployed domain
7. IF deployment fails THEN the system SHALL provide clear error messages in Vercel logs

### Requirement 9: Code Quality and Review
**User Story:** As the developer, I want a comprehensive code review analyzing the app's quality so that I can demonstrate engineering excellence.

#### Acceptance Criteria
1. WHEN code review is requested THEN the system SHALL analyze all TypeScript/React files
2. WHEN analyzing THEN the system SHALL count total lines of code
3. WHEN evaluating design THEN the system SHALL rate the app architecture on a scale of 1-10
4. WHEN assessing quality THEN the system SHALL evaluate: component structure, TypeScript usage, database schema design, error handling, security practices
5. WHEN providing rating THEN the system SHALL answer: "Would this stand up in a world-class engineering shop?"
6. WHEN review is complete THEN the system SHALL save findings to CODE_REVIEW.md with detailed sections
7. WHEN suggesting improvements THEN the system SHALL provide actionable recommendations

### Requirement 10: Free Tier and Trial Experience
**User Story:** As a demo user, I want to sign up for free and experience core features so that I can evaluate the product.

#### Acceptance Criteria
1. WHEN a user signs up THEN the system SHALL default to free tier (no payment required)
2. WHEN on free tier THEN the system SHALL allow: unlimited prompt viewing, completion tracking, child profiles (up to 3 children), basic memory journal
3. WHEN viewing premium features THEN the system SHALL display subtle upgrade prompts
4. WHEN a free user completes activities THEN the system SHALL track all progress identically to premium
5. IF a user wants to upgrade THEN the system SHALL show clear Stripe checkout flow
6. WHEN upgrading THEN the system SHALL unlock: unlimited children, advanced analytics (future), community features (future)

## Edge Cases and Constraints

### Edge Cases
1. **User completes multiple activities in one day**: System should allow and count each separately
2. **Timezone handling**: Use user's local timezone for "new day" calculations
3. **No age-appropriate prompts available**: Gracefully suggest expanding age range or show closest match
4. **Onboarding interrupted**: Save partial progress and resume where they left off
5. **Deleted child with existing data**: Archive data, don't delete, allow restoration within 30 days

### Constraints
1. **Timeline**: Must be demo-ready in 3 days (by October 24, 2025)
2. **Performance**: All pages must load within 2 seconds on production
3. **Mobile-first**: Must work perfectly on iPhone and Android
4. **Data Privacy**: COPPA compliant (no personal data for children under 13 without parental consent)
5. **Build Time**: Vercel builds must complete within 5 minutes
6. **Database**: Use existing Supabase schema, minimize new migrations
7. **TypeScript**: Zero TypeScript errors on build
8. **Accessibility**: Minimum WCAG 2.1 AA compliance for interactive elements
