import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vfwnrcolilhkttmbexuj.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_MsiKETUoVosNle4N2O2UBg__H6Fuf3K";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
