-- Add missing columns to prompt_completions table if they don't exist

-- Add child_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_completions' AND column_name = 'child_id'
  ) THEN
    ALTER TABLE prompt_completions
    ADD COLUMN child_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_completions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE prompt_completions
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_completions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE prompt_completions
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN prompt_completions.child_id IS 'Optional: track which child this activity was done with for personalized history';
COMMENT ON COLUMN prompt_completions.notes IS 'Optional: quick note about how the activity went';
