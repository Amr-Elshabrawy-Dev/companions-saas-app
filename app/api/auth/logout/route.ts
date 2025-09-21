"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient();

    // Clear session history for the user
    const { error: sessionError } = await supabase
      .from("session_history")
      .delete()
      .eq("user_id", userId);

    if (sessionError) {
      console.error("Error clearing session history:", sessionError);
      // Don't fail the entire logout if session cleanup fails
    }

    // Clear bookmarks for the user (optional - enhances privacy)
    const { error: bookmarkError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId);

    if (bookmarkError) {
      console.error("Error clearing bookmarks:", bookmarkError);
      // Don't fail the entire logout if bookmark cleanup fails
    }

    // Note: We intentionally do NOT clear user-created companions
    // as they are user-generated content that should persist

    return NextResponse.json({
      success: true,
      message: "Session data cleared successfully"
    });

  } catch (error) {
    console.error("Logout cleanup error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout cleanup" },
      { status: 500 }
    );
  }
}
