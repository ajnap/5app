// Simple script to apply migration
const fs = require('fs')
const https = require('https')

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8')
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1]
const SERVICE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1]

const migrationSQL = fs.readFileSync('supabase/migrations/010_demo_mvp_enhancements.sql', 'utf8')

const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL)

console.log('🚀 Applying migration to Supabase...')
console.log('Note: Copy and paste the SQL below into your Supabase SQL Editor if this fails:\n')
console.log('=' + '='.repeat(70))
console.log(migrationSQL)
console.log('=' + '='.repeat(70))
console.log('\nTo apply manually:')
console.log('1. Go to:', SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/') + '/sql')
console.log('2. Paste the SQL above')
console.log('3. Click "Run"')
console.log('\nOr we can continue with components while you apply it manually!')
