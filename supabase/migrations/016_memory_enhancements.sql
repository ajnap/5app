-- Migration: Memory System Enhancements
-- Description: Adds photo upload, tags, milestones, and search to journal_entries
-- Date: 2025-11-01

-- =====================================================
-- 1. Add new columns to journal_entries
-- =====================================================

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_path TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

COMMENT ON COLUMN journal_entries.photo_url IS 'Public URL for uploaded memory photo';
COMMENT ON COLUMN journal_entries.photo_path IS 'Storage path for photo (for deletion)';
COMMENT ON COLUMN journal_entries.tags IS 'User-defined tags for categorization (e.g., first-time, funny, achievement)';
COMMENT ON COLUMN journal_entries.is_milestone IS 'Whether this memory is marked as a milestone';
COMMENT ON COLUMN journal_entries.search_vector IS 'Full-text search vector combining content and tags';

-- =====================================================
-- 2. Create GIN index for tag searches
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_tags
  ON journal_entries USING GIN(tags);

-- =====================================================
-- 3. Create GIN index for full-text search
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_search
  ON journal_entries USING GIN(search_vector);

-- =====================================================
-- 4. Create index for milestone memories
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_milestones
  ON journal_entries(user_id, is_milestone, entry_date DESC)
  WHERE is_milestone = TRUE;

-- =====================================================
-- 5. Create trigger to auto-update search_vector
-- =====================================================

CREATE OR REPLACE FUNCTION update_journal_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Combine content and tags with different weights
  -- Content gets weight 'A' (highest), tags get weight 'B'
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entries_search_vector_update
  BEFORE INSERT OR UPDATE OF content, tags
  ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_search_vector();

COMMENT ON FUNCTION update_journal_search_vector IS 'Automatically updates search_vector when content or tags change';

-- =====================================================
-- 6. Backfill search_vector for existing entries
-- =====================================================

UPDATE journal_entries
SET search_vector =
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'B')
WHERE search_vector IS NULL;

-- =====================================================
-- 7. Create Supabase Storage bucket for memory photos
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memory-photos',
  'memory-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. Create RLS policies for storage bucket
-- =====================================================

-- Policy: Users can upload photos to their own folder
CREATE POLICY "Users can upload memory photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view public memory photos
CREATE POLICY "Anyone can view memory photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memory-photos');

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own memory photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 9. Create search function
-- =====================================================

CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_child_id UUID DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_milestone_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  child_id UUID,
  child_name TEXT,
  content TEXT,
  photo_url TEXT,
  tags TEXT[],
  is_milestone BOOLEAN,
  emoji_reactions TEXT[],
  entry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.child_id,
    cp.name as child_name,
    je.content,
    je.photo_url,
    je.tags,
    je.is_milestone,
    je.emoji_reactions,
    je.entry_date,
    je.created_at,
    CASE
      WHEN p_search_term IS NOT NULL THEN
        ts_rank(je.search_vector, plainto_tsquery('english', p_search_term))
      ELSE 1.0
    END as relevance
  FROM journal_entries je
  JOIN child_profiles cp ON je.child_id = cp.id
  WHERE
    je.user_id = p_user_id
    AND (p_child_id IS NULL OR je.child_id = p_child_id)
    AND (p_search_term IS NULL OR je.search_vector @@ plainto_tsquery('english', p_search_term))
    AND (p_tags IS NULL OR je.tags && p_tags)  -- Array overlap operator
    AND (p_milestone_only = FALSE OR je.is_milestone = TRUE)
  ORDER BY
    CASE WHEN p_search_term IS NOT NULL THEN
      ts_rank(je.search_vector, plainto_tsquery('english', p_search_term))
    ELSE 0
    END DESC,
    je.entry_date DESC,
    je.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_memories IS 'Search memories by text, tags, child, or milestone status with full-text search ranking';

GRANT EXECUTE ON FUNCTION search_memories TO authenticated;

-- =====================================================
-- 10. Create "On This Day" function
-- =====================================================

CREATE OR REPLACE FUNCTION get_memories_on_this_day(
  p_user_id UUID,
  p_child_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  child_id UUID,
  child_name TEXT,
  content TEXT,
  photo_url TEXT,
  tags TEXT[],
  is_milestone BOOLEAN,
  emoji_reactions TEXT[],
  entry_date DATE,
  years_ago INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.child_id,
    cp.name as child_name,
    je.content,
    je.photo_url,
    je.tags,
    je.is_milestone,
    je.emoji_reactions,
    je.entry_date,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - EXTRACT(YEAR FROM je.entry_date)::INTEGER as years_ago,
    je.created_at
  FROM journal_entries je
  JOIN child_profiles cp ON je.child_id = cp.id
  WHERE
    je.user_id = p_user_id
    AND (p_child_id IS NULL OR je.child_id = p_child_id)
    AND EXTRACT(MONTH FROM je.entry_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM je.entry_date) = EXTRACT(DAY FROM CURRENT_DATE)
    AND je.entry_date < CURRENT_DATE  -- Exclude today
  ORDER BY je.entry_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memories_on_this_day IS 'Get memories from previous years on this same date (e.g., "5 years ago today")';

GRANT EXECUTE ON FUNCTION get_memories_on_this_day TO authenticated;

-- =====================================================
-- 11. Create memory stats function
-- =====================================================

CREATE OR REPLACE FUNCTION get_memory_stats(p_child_id UUID)
RETURNS TABLE (
  total_memories BIGINT,
  total_with_photos BIGINT,
  total_milestones BIGINT,
  unique_tags TEXT[],
  first_memory_date DATE,
  latest_memory_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_memories,
    COUNT(photo_url) FILTER (WHERE photo_url IS NOT NULL) as total_with_photos,
    COUNT(*) FILTER (WHERE is_milestone = TRUE) as total_milestones,
    ARRAY_AGG(DISTINCT tag) FILTER (WHERE tag IS NOT NULL) as unique_tags,
    MIN(entry_date) as first_memory_date,
    MAX(entry_date) as latest_memory_date
  FROM journal_entries je
  CROSS JOIN LATERAL unnest(COALESCE(je.tags, ARRAY[]::TEXT[])) as tag
  WHERE je.child_id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memory_stats IS 'Get statistics about memories for a specific child';

GRANT EXECUTE ON FUNCTION get_memory_stats TO authenticated;
