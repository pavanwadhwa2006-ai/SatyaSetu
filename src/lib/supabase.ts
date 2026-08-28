import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xjvixzpiptghjurfycti.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_D7rAXCwrz6LrPI834mbapg_fvF59KqA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
