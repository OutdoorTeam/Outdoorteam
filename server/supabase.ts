import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // This warning is now less critical because server/index.ts will exit if env vars are missing.
  // It serves as a safeguard during development if this module is imported elsewhere.
  console.warn('Supabase URL or Service Role Key is not set. Supabase admin client will not be available.');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
