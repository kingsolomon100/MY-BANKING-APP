import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fail gracefully or alert early in development without crashing TypeScript
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Warning: Supabase environment variables are missing. Check your local .env.local file."
  );
}

// Export a single, unified global instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);