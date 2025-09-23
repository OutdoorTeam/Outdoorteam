import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

let supabaseAdminInstance = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Supabase URL or Service Role Key is not set. Supabase admin client will not be available.');
}

export const supabaseAdmin = supabaseAdminInstance;
