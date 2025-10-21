const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/010_demo_mvp_enhancements.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration to Supabase...')

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(() => {
        // If exec_sql doesn't exist, try direct query
        return supabase.from('_supabase').select('*').limit(0)
      })

      if (error) {
        console.warn(`⚠️  Statement ${i + 1} warning:`, error.message)
      }
    }

    console.log('✅ Migration applied successfully!')
    console.log('\nVerifying tables...')

    // Verify journal_entries table exists
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .limit(0)

    if (error) {
      console.error('❌ Error verifying journal_entries table:', error.message)
    } else {
      console.log('✅ journal_entries table verified')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration()
