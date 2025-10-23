-- Migration: Allow Multiple Daily Completions
-- Removes unique constraint to allow completing same prompt multiple times per day
-- This is useful for testing and for cases where parents do activities multiple times

-- Drop the unique constraint that prevents duplicate completions
-- The constraint name might be different, so we'll use a dynamic approach

-- First, let's drop the unique index if it exists
DROP INDEX IF EXISTS prompt_completions_user_id_prompt_id_completion_date_idx;

-- Drop any unique constraint on the combination
-- Note: The exact constraint name may vary, check your database
DO $$
BEGIN
    -- Try to drop the constraint if it exists
    -- This will fail silently if the constraint doesn't exist
    ALTER TABLE prompt_completions
    DROP CONSTRAINT IF EXISTS prompt_completions_user_id_prompt_id_completion_date_key;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Now we can create a regular (non-unique) index for query performance
-- This helps with "get today's completions" queries without enforcing uniqueness
CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_date
ON prompt_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_prompt
ON prompt_completions(user_id, prompt_id);

-- Add comment explaining the change
COMMENT ON TABLE prompt_completions IS 'Tracks prompt completions. Users can complete the same prompt multiple times per day (useful for testing and re-doing activities with different children).';
