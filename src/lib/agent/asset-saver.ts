import { getSupabaseClient } from "@/storage/database/supabase-client";

const USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Save a generated asset (image/video) to the assets table
 */
export async function saveGeneratedAsset(
  url: string,
  name: string,
  type: "image" | "video"
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const truncatedName = name.length > 100 ? name.substring(0, 100) : name;

    await supabase.from("assets").insert({
      user_id: USER_ID,
      name: truncatedName,
      type,
      url,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[AssetSaver] Failed to save asset:", error);
  }
}
