import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : {
        from: (table: string) => ({
          insert: async (data: any) => {
            console.log(`[Supabase Mock] Insert into ${table}:`, data);
            try {
              const current = JSON.parse(localStorage.getItem(table) || "[]");
              current.push({ ...data, created_at: new Date().toISOString() });
              localStorage.setItem(table, JSON.stringify(current));
            } catch (e) {
              console.error(e);
            }
            return { data, error: null };
          },
          select: async () => ({ data: [], error: null }),
        }),
      };
