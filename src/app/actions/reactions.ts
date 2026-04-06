"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

// Prefer the service role key, but fall back to the anon key so production
// still works when only public Supabase env vars are configured.
const supabaseAdmin = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function toggleAnonymousReaction(
  itemId: string,
  reactionType: string,
  guestId: string
) {
  if (!itemId || !reactionType || !guestId) {
    throw new Error("Missing required parameters: itemId, reactionType, and guestId are required.");
  }

  // Gracefully handle missing Supabase configuration (e.g., during build)
  if (!supabaseAdmin) {
    console.warn("Supabase not configured - reactions unavailable");
    return { action: "skipped", reason: "Supabase not available" };
  }

  // Check if a reaction exists for that exact guest_id, item_id, and type.
  const { data: existingReaction, error: fetchError } = await supabaseAdmin
    .from("anonymous_reactions")
    .select("id")
    .eq("guest_id", guestId)
    .eq("item_id", itemId)
    .eq("type", reactionType)
    .maybeSingle(); 

  if (fetchError) {
    console.error("Error fetching reaction:", fetchError);
    throw new Error("Failed to fetch reaction status.");
  }

  if (existingReaction) {
    // If it exists, delete it (unlike)
    const { error: deleteError } = await supabaseAdmin
      .from("anonymous_reactions")
      .delete()
      .eq("id", existingReaction.id);

    if (deleteError) {
      console.error("Error deleting reaction:", deleteError);
      throw new Error("Failed to remove reaction.");
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${itemId}`);

    return { action: "removed" };
  } else {
    // If it doesn't exist, insert it (like)
    const { error: insertError } = await supabaseAdmin
      .from("anonymous_reactions")
      .insert({
        guest_id: guestId,
        item_id: itemId,
        type: reactionType,
      });

    if (insertError) {
      console.error("Error inserting reaction:", insertError);
      throw new Error("Failed to add reaction.");
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${itemId}`);

    return { action: "added" };
  }
}

export async function getReactionCounts(itemId: string): Promise<Record<string, number>> {
  if (!itemId) return {};

  // Gracefully handle missing Supabase configuration (e.g., during build)
  if (!supabaseAdmin) {
    console.warn("Supabase not configured - returning empty reaction counts");
    return {};
  }

  const { data, error } = await supabaseAdmin
    .from("anonymous_reactions")
    .select("type")
    .eq("item_id", itemId);

  if (error) {
    console.error("Error fetching reaction counts:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  if (data) {
    for (const row of data) {
      counts[row.type] = (counts[row.type] || 0) + 1;
    }
  }

  return counts;
}
