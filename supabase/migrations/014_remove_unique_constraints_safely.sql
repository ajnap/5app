-- Safely remove unique constraints without touching the primary key
-- This fixes the issue where we were accidentally trying to drop the primary key

-- Drop unique constraints (but NOT primary key)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'prompt_completions'::regclass
        AND contype = 'u'  -- 'u' means unique constraint (NOT primary key which is 'p')
    LOOP
        EXECUTE 'ALTER TABLE prompt_completions DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
    END LOOP;
END $$;

-- Drop unique indexes (but NOT the primary key index)
DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'prompt_completions'
        AND indexdef LIKE '%UNIQUE%'
        AND indexname != 'prompt_completions_pkey'  -- Skip primary key!
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

-- Show what we did
SELECT 'Migration complete!' as status;

-- Verify no unique constraints remain (except primary key)
SELECT
    conname as constraint_name,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY (keep this)'
        WHEN 'u' THEN 'UNIQUE (should be gone)'
        ELSE contype::text
    END as constraint_type
FROM pg_constraint
WHERE conrelid = 'prompt_completions'::regclass
ORDER BY contype;
