import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getOAuthRedirectUrl } from "../../utils/platform";

interface Config {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  redirect_url: string;
  supabaseClient?: SupabaseClient;
}

const config: Config = {
  SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL || "https://ibsisfnjxeowvdtvgzff.supabase.co",
  SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2lzZm5qeGVvd3ZkdHZnemZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTk1NzgsImV4cCI6MjA4MDEzNTU3OH0.K16sO1R9L2WZGPueDP0mArs2eDYZc-TnIk2LApDw_fs",
  // Use platform-aware redirect URL for iOS Universal Links support
  redirect_url:
    import.meta.env.VITE_SUPABASE_REDIRECT_URL || getOAuthRedirectUrl(),
};

function createSupabaseClient() {
  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
}

config.supabaseClient = createSupabaseClient();

export default config;
