import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded (Next.js automatically loads .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "Supabase credentials MISSING! This usually happens if the dev server was started before .env.local was created or moved. \n\n" +
    "👉 PLEASE RESTART YOUR DEV SERVER: Press Ctrl+C in your terminal and run 'npm run dev' again."
  );
}

// We initialize even if missing to avoid breaking imports, but the logs above will guide the user
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
