/**
 * ⚽ نادي الاسطورة - Supabase Database Setup Script
 * This script creates all database tables using the Supabase REST API
 * Run: node setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bzvvxdmbswtdvdrzjyay.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dnZ4ZG1ic3d0ZHZkcnpqeWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkwNTg0NSwiZXhwIjoyMDk2NDgxODQ1fQ.etKa2JQ4iopCnoXiEalShcLmJKAcNOsB4bsSJJ-V7b8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTable(name) {
  const { data, error } = await supabase.from(name).select('*').limit(1);
  if (error && error.code === 'PGRST205') {
    return false; // Table doesn't exist
  }
  return true; // Table exists (even if empty)
}

async function main() {
  console.log('⚽ نادي الاسطورة - Supabase Database Setup');
  console.log('============================================\n');

  // Check existing tables
  const tables = ['users', 'clubs', 'players', 'tournaments', 'tournament_participants', 
                  'matches', 'transfer_listings', 'user_achievements', 'game_events', 
                  'player_packs', 'pack_openings', 'achievements', 'seasons', 'leaderboard_entries'];
  
  console.log('📋 Checking existing tables...');
  for (const table of tables) {
    const exists = await checkTable(table);
    console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? 'exists' : 'missing'}`);
  }
  
  console.log('\n⚠️  Tables need to be created using the Supabase SQL Editor.');
  console.log('📝 Please follow these steps:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/bzvvxdmbswtdvdrzjyay/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy and paste the contents of supabase-init.sql');
  console.log('4. Click "Run" to execute\n');
  console.log('============================================');
}

main().catch(console.error);
