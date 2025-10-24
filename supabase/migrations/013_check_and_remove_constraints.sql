-- Check what constraints exist and remove them all
-- This is a more thorough approach to find and remove the unique constraint

-- First, let's see all constraints on prompt_completions
-- Run this to see what exists:
-- SELECT conname, contype
-- FROM pg_constraint
-- WHERE conrelid = 'prompt_completions'::regclass;

-- Drop ALL unique constraints on prompt_completions
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'prompt_completions'::regclass
        AND contype = 'u'  -- 'u' means unique constraint
    LOOP
        EXECUTE 'ALTER TABLE prompt_completions DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Also drop any unique indexes
DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'prompt_completions'
        AND indexdef LIKE '%UNIQUE%'
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || index_name;
        RAISE NOTICE 'Dropped unique index: %', index_name;
    END LOOP;
END $$;

-- Create performance indexes (non-unique)
CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_date
ON prompt_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_prompt
ON prompt_completions(user_id, prompt_id);

CREATE INDEX IF NOT EXISTS idx_prompt_completions_lookup
ON prompt_completions(user_id, prompt_id, completion_date);

-- Verify no unique constraints remain
SELECT
    'Remaining unique constraints:' as info,
    conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'prompt_completions'::regclass
AND contype = 'u';

-- Show all indexes
SELECT
    'All indexes on prompt_completions:' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'prompt_completions';
