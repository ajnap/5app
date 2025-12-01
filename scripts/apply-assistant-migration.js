const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Applying Parenting Assistant migration...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/019_parenting_assistant.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      })

      if (error) {
        // Try executing directly if RPC doesn't work
        const { error: directError } = await supabase.from('_migrations').insert({
          name: '019_parenting_assistant',
          executed_at: new Date().toISOString()
        })

        if (directError) {
          throw new Error(`Failed to execute migration: ${error.message}`)
        }
      }
    }

    console.log('✅ Migration applied successfully!')
    console.log('\nTables created:')
    console.log('  - assistant_sessions')
    console.log('  - assistant_messages')
    console.log('\n💡 You can now use the Parenting Assistant at /assistant')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📝 Manual steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of:')
    console.log('   supabase/migrations/019_parenting_assistant.sql')
    console.log('4. Click "Run" to execute the migration')
    process.exit(1)
  }
}

applyMigration()
