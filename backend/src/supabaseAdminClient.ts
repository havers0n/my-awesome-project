import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Supabase Admin Client Initialization ---');
console.log(`Attempting to read SUPABASE_URL: ${supabaseUrl ? 'Loaded' : 'MISSING!'}`);
// For security, we only log if the service key exists, not its value.
console.log(`Attempting to read SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'Loaded' : 'MISSING!'}`);
console.log('------------------------------------------');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  throw new Error('Supabase URL and Service Role Key must be defined for admin operations.');
}

// Админский клиент для операций, требующих полных прав (например, в middleware)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Эти опции важны для серверного использования
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

console.log('Supabase admin client created successfully');
