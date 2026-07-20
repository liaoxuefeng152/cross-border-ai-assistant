import { getSupabaseClient } from "@/storage/database/supabase-client";
import { uploadFromUrl, getSignedUrl } from "@/lib/storage";

const USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Save a generated asset (image/video) to object storage and assets table
 * Downloads from AI service URL, uploads to our object storage, stores key in DB
 */
export async function saveGeneratedAsset(
  url: string,
  name: string,
  type: "image" | "video"
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const truncatedName = name.length > 100 ? name.substring(0, 100) : name;

    // Download from AI URL and upload to object storage
    const key = await uploadFromUrl(url);

    // Get signed URL for display
    const signedUrl = await getSignedUrl(key);

    // Save to database - store the signed URL for now
    // (In production, you'd store the key and generate URL on-the-fly)
    await supabase.from("assets").insert({
      user_id: USER_ID,
      name: truncatedName,
      type,
      url: signedUrl,
      created_at: new Date().toISOString(),
    });

    console.log(`[AssetSaver] Saved ${type} asset: ${truncatedName}`);
  } catch (error) {
    console.error("[AssetSaver] Failed to save asset:", error);
  }
}
