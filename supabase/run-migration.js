import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const migrationFilePath = path.resolve(__dirname, 'migrations/001_initial_schema.sql');

async function runMigration() {
  console.log('====================================================');
  console.log('   Research Mind AI - Database Migration Runner     ');
  console.log('====================================================');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`[-] Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');

  // Check for PostgreSQL connection string
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (connectionString) {
    console.log('[*] Connecting to Supabase PostgreSQL via DATABASE_URL...');
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('[+] Connected to Supabase PostgreSQL successfully.');
      console.log('[*] Executing migration: 001_initial_schema.sql ...');
      await client.query(sqlContent);
      console.log('[✓] Migration applied successfully! All tables & RLS policies are active.');
      await client.end();
      return;
    } catch (err) {
      console.error('[-] Error applying migration with pg client:', err.message);
      try { await client.end(); } catch (e) {}
    }
  }

  // Supabase REST client check and alternative
  if (supabaseUrl && supabaseServiceKey) {
    console.log('[*] Checking Supabase connection using Service Role Key...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
      const { data, error } = await supabase.from('workspaces').select('id').limit(1);
      if (!error) {
        console.log('[✓] Successfully verified connection to Supabase! The "workspaces" table already exists.');
        return;
      } else if (error.code === '42P01') {
        console.log('[-] Tables do not exist yet in Supabase.');
      } else {
        console.log(`[i] Supabase query status: ${error.message}`);
      }
    } catch (e) {
      console.log('[i] Note:', e.message);
    }
  }

  console.log('\n====================================================');
  console.log('               MIGRATION INSTRUCTIONS               ');
  console.log('====================================================');
  console.log('To apply the database schema to your Supabase project:');
  console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to your project -> "SQL Editor" -> "New Query"');
  console.log(`3. Copy & paste the contents of:`);
  console.log(`   ${migrationFilePath}`);
  console.log('4. Click "Run" to initialize all tables, triggers, and RLS policies.');
  console.log('Alternatively, set DATABASE_URL in server/.env with your Supabase direct connection string.');
  console.log('====================================================\n');
}

runMigration().catch((err) => {
  console.error('Migration runner failed:', err);
});

