import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsqwczmlxfvpyaxncana.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BGmP0f-ndCaIm4aZyMjn4w_fkNJv0DL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);