import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase configuration is missing. Please check your environment variables."
      );
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        try {
          const session = await auth();
          return session?.getToken() || null;
        } catch (error) {
          console.error("Error getting auth token:", error);
          return null;
        }
      },
    });
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
};
