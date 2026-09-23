import { createClient } from "@supabase/supabase-js";

// Fallback values let the app run without any env configuration.
const FALLBACK_URL = "https://toufekynlxvepmfuilav.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_q4GQZMX4yjpcsM2ZhYU84g_8BCldhWg";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
