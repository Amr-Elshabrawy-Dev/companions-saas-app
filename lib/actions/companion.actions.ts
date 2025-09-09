"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { revalidatePath } from "next/cache";
import {
  CreateCompanion,
  GetAllCompanions,
  Companion,
} from "@/types/companions";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error || !data) {
    console.error("Error creating companion:", error);
    throw new Error(error?.message || "Failed to create companion");
  }

  return data[0];
};

export const getAllCompanions = async ({
  subject,
  topic,
  limit = 10,
  page = 1,
}: GetAllCompanions) => {
  try {
    const supabase = createSupabaseClient();

    // Build the base query
    let query = supabase.from("companions").select(`
      id,
      name,
      subject,
      topic,
      style,
      voice,
      author,
      created_at,
      duration
    `);

    // Apply filters
    if (subject) {
      query = query.eq("subject", subject);
    }

    if (topic && topic.trim() !== "") {
      // Use parentheses to properly group OR conditions
      query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    // Add pagination
    query = query
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false }); // Add default sorting

    const response = await query;

    if (response.error) {
      console.error("Supabase query error details:", response);
      throw new Error(
        `Failed to fetch companions: ${
          response.error.message || "Unknown error"
        }`
      );
    }

    if (!response.data) {
      console.warn("No companions found");
      return [];
    }

    const companions = response.data;

    return companions;
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in getAllCompanions:", error);
    throw new Error(`Failed to fetch companions: ${errorMessage}`);
  }
};

export const getCompanion = async (id: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error || !data) {
    console.error("Error getting companion:", error);
    throw new Error(error?.message || "Companion not found");
  }

  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) {
    console.error("Error adding to session history:", error);
    throw new Error(error.message);
  }

  return data;
};

const getSessions = async ({
  limit = 10,
  userId,
}: {
  limit?: number;
  userId?: string;
}) => {
  const supabase = createSupabaseClient();
  let query = supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error getting sessions:", error);
    throw new Error(error.message);
  }

  return data
    .map(({ companions }) => companions)
    .flat()
    .filter(Boolean) as Companion[];
};

export const getRecentSessions = async (limit = 10) => {
  return getSessions({ limit });
};

export const getUserSessions = async (userId: string, limit = 10) => {
  return getSessions({ userId, limit });
};

export const getUserCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) {
    console.error("Error getting user companions:", error);
    throw new Error(error.message);
  }

  return data;
};

export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  const supabase = createSupabaseClient();

  if (has({ plan: "pro" })) {
    return true;
  }

  let limit = 0;
  if (has({ feature: "3_companion_limit" })) {
    limit = 3;
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10;
  }

  const { count, error } = await supabase
    .from("companions")
    .select("*", { count: "exact", head: true })
    .eq("author", userId);

  if (error) {
    console.error("Error checking new companion permissions:", error);
    throw new Error(error.message);
  }

  return (count ?? 0) < limit;
};

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    console.error("Error adding bookmark:", error);
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    console.error("Error removing bookmark:", error);
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    console.error("Error getting bookmarked companions:", error);
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data
    .map(({ companions }) => companions)
    .flat()
    .filter(Boolean) as Companion[];
};
