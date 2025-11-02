-- Migration: Enhanced Memories and Child Profiles
-- Description: Adds photo uploads, tags, search, and enriched profile fields with AI preparation
-- Date: 2025-10-27

-- =====================================================
-- 1. Enhance journal_entries table for photos and tags
-- =====================================================

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_path TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN journal_entries.photo_url IS 'Public URL of uploaded photo from Supabase Storage';
COMMENT ON COLUMN journal_entries.photo_path IS 'Storage path for photo deletion (format: user_id/memory_id.ext)';
COMMENT ON COLUMN journal_entries.tags IS 'Searchable tags like ["first-words", "funny-moment", "achievement"]';
COMMENT ON COLUMN journal_entries.is_milestone IS 'Mark as important milestone memory';

-- =====================================================
-- 2. Create full-text search index for memories
-- =====================================================

-- Add tsvector column for full-text search
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION journal_entries_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
DROP TRIGGER IF EXISTS journal_entries_search_vector_trigger ON journal_entries;
CREATE TRIGGER journal_entries_search_vector_trigger
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION journal_entries_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_journal_entries_search
  ON journal_entries USING GIN(search_vector);

-- Create index for tags
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags
  ON journal_entries USING GIN(tags);

-- =====================================================
-- 3. Enhance child_profiles table with rich fields
-- =====================================================

ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS challenges TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_books TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS love_language TEXT CHECK (
    love_language IN ('words', 'time', 'gifts', 'service', 'touch', NULL)
  ),
  ADD COLUMN IF NOT EXISTS ai_personality_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary_generated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN child_profiles.strengths IS 'Child''s strengths (e.g., ["creative", "empathetic", "curious"])';
COMMENT ON COLUMN child_profiles.challenges IS 'Areas of growth (e.g., ["sharing", "patience", "transitions"])';
COMMENT ON COLUMN child_profiles.favorite_books IS 'Favorite books or stories';
COMMENT ON COLUMN child_profiles.hobbies IS 'Current interests and hobbies';
COMMENT ON COLUMN child_profiles.love_language IS 'Primary love language (words/time/gifts/service/touch)';
COMMENT ON COLUMN child_profiles.ai_personality_summary IS 'AI-generated personality insights (future OpenAI integration)';
COMMENT ON COLUMN child_profiles.ai_summary_generated_at IS 'When AI summary was last generated';

-- =====================================================
-- 4. Create Supabase Storage bucket for memory photos
-- =====================================================

-- Note: Run this in Supabase Dashboard SQL Editor or via supabase CLI
-- This creates a public bucket for memory photos with RLS
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
-- 5. Create RLS policies for storage bucket
-- =====================================================

-- Allow authenticated users to upload photos to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload memory photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to view photos they uploaded
CREATE POLICY IF NOT EXISTS "Users can view own memory photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete photos they uploaded
CREATE POLICY IF NOT EXISTS "Users can delete own memory photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memory-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 6. Enhanced database functions for memories
-- =====================================================

-- Function: Search memories by text and tags
CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_child_id UUID DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  child_id UUID,
  child_name TEXT,
  content TEXT,
  photo_url TEXT,
  tags TEXT[],
  emoji_reactions TEXT[],
  is_milestone BOOLEAN,
  entry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.child_id,
    cp.name AS child_name,
    je.content,
    je.photo_url,
    je.tags,
    je.emoji_reactions,
    je.is_milestone,
    je.entry_date,
    je.created_at,
    CASE
      WHEN p_search_term IS NOT NULL THEN
        ts_rank(je.search_vector, plainto_tsquery('english', p_search_term))
      ELSE
        0
    END AS rank
  FROM journal_entries je
  JOIN child_profiles cp ON je.child_id = cp.id
  WHERE je.user_id = p_user_id
    AND (p_child_id IS NULL OR je.child_id = p_child_id)
    AND (
      p_search_term IS NULL OR
      je.search_vector @@ plainto_tsquery('english', p_search_term)
    )
    AND (
      p_tags IS NULL OR
      je.tags && p_tags -- Array overlap operator
    )
  ORDER BY
    CASE WHEN p_search_term IS NOT NULL THEN rank END DESC,
    je.entry_date DESC,
    je.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_memories IS 'Full-text search memories with optional filters';

-- Function: Get "on this day" memories (look back feature)
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
  emoji_reactions TEXT[],
  entry_date DATE,
  years_ago INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  current_day INTEGER := EXTRACT(DAY FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.child_id,
    cp.name AS child_name,
    je.content,
    je.photo_url,
    je.tags,
    je.emoji_reactions,
    je.entry_date,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - EXTRACT(YEAR FROM je.entry_date)::INTEGER AS years_ago,
    je.created_at
  FROM journal_entries je
  JOIN child_profiles cp ON je.child_id = cp.id
  WHERE je.user_id = p_user_id
    AND (p_child_id IS NULL OR je.child_id = p_child_id)
    AND EXTRACT(MONTH FROM je.entry_date) = current_month
    AND EXTRACT(DAY FROM je.entry_date) = current_day
    AND je.entry_date < CURRENT_DATE -- Exclude today
  ORDER BY je.entry_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memories_on_this_day IS 'Get memories from past years on this day';

-- Function: Get memory statistics for a child
CREATE OR REPLACE FUNCTION get_memory_stats(p_child_id UUID)
RETURNS TABLE (
  total_memories BIGINT,
  memories_with_photos BIGINT,
  milestone_count BIGINT,
  unique_tags TEXT[],
  first_memory_date DATE,
  most_recent_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_memories,
    COUNT(photo_url)::BIGINT AS memories_with_photos,
    COUNT(*) FILTER (WHERE is_milestone = true)::BIGINT AS milestone_count,
    ARRAY_AGG(DISTINCT tag)::TEXT[] AS unique_tags,
    MIN(entry_date) AS first_memory_date,
    MAX(entry_date) AS most_recent_date
  FROM journal_entries je
  CROSS JOIN LATERAL UNNEST(je.tags) AS tag
  WHERE je.child_id = p_child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_memory_stats IS 'Get aggregate statistics for child''s memories';

-- =====================================================
-- 7. Grant permissions on new functions
-- =====================================================

GRANT EXECUTE ON FUNCTION search_memories TO authenticated;
GRANT EXECUTE ON FUNCTION get_memories_on_this_day TO authenticated;
GRANT EXECUTE ON FUNCTION get_memory_stats TO authenticated;

-- =====================================================
-- 8. Backfill search vectors for existing memories
-- =====================================================

UPDATE journal_entries
SET search_vector =
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'B')
WHERE search_vector IS NULL;

-- =====================================================
-- 9. Create indexes for new child profile fields
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_child_profiles_strengths
  ON child_profiles USING GIN(strengths);

CREATE INDEX IF NOT EXISTS idx_child_profiles_challenges
  ON child_profiles USING GIN(challenges);

CREATE INDEX IF NOT EXISTS idx_child_profiles_hobbies
  ON child_profiles USING GIN(hobbies);
