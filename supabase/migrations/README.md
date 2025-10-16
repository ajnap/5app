# Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended if CLI not installed)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `002_prompt_completions.sql`)
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Push migrations to remote database
supabase db push
```

## Migration Files

- `001_initial_schema.sql` - Initial database schema (profiles, daily_prompts, triggers)
- `002_prompt_completions.sql` - Prompt completion tracking table

## Verifying Migrations

After applying a migration, verify it worked by:

1. Check the **Table Editor** in Supabase dashboard
2. Look for the new tables (e.g., `prompt_completions`)
3. Verify RLS policies are enabled under **Authentication > Policies**
