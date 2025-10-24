-- Add indexes to optimize Smart Recommendations queries
-- These indexes improve performance for category analysis, engagement scoring, and filtering

-- Optimize child completion history queries
-- Used by: Category analyzer to fetch all completions for a child ordered by date
CREATE INDEX IF NOT EXISTS idx_completions_child_date
ON prompt_completions(child_id, completion_date DESC)
WHERE child_id IS NOT NULL;

-- Optimize tag-based filtering for similar prompt recommendations
-- Used by: Recommendation engine to find prompts with specific tags
CREATE INDEX IF NOT EXISTS idx_prompts_tags_gin
ON daily_prompts USING GIN(tags);

-- Optimize engagement analysis queries (duration and reflection notes)
-- Used by: Score calculator to analyze which prompts had high engagement
CREATE INDEX IF NOT EXISTS idx_completions_engagement
ON prompt_completions(child_id, prompt_id)
WHERE duration_seconds IS NOT NULL OR reflection_note IS NOT NULL;

-- Optimize category filtering on prompts
-- Used by: Recommendation engine to filter prompts by category for diversity
CREATE INDEX IF NOT EXISTS idx_prompts_category_age
ON daily_prompts(category, age_categories);

-- Show created indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('prompt_completions', 'daily_prompts')
  AND indexname LIKE '%recommendation%' OR indexname LIKE '%engagement%' OR indexname LIKE '%tags%'
ORDER BY tablename, indexname;
