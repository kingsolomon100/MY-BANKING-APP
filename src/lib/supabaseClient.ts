import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xsqwczmlxfvpyaxncana.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcXdjem1seGZ2cHlheG5jYW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTUzMDQsImV4cCI6MjA5ODY3MTMwNH0.-JAahp-iMA-yUietkTdqII3HnEGK2LxUq3umaVyNQ94";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
});