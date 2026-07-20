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
    console.log(`[AssetSaver] Starting to save ${type}: ${name.slice(0, 50)}`);
    console.log(`[AssetSaver] Source URL: ${url.slice(0, 100)}...`);

    const supabase = getSupabaseClient();
    const truncatedName = name.length > 100 ? name.substring(0, 100) : name;

    // Determine file extension based on type
    const ext = type === "video" ? "mp4" : "jpeg";

    // Download from AI URL and upload to object storage
    const key = await uploadFromUrl(url);
    console.log(`[AssetSaver] Uploaded to object storage: ${key}`);

    // Get signed URL for display
    const signedUrl = await getSignedUrl(key);

    // Save to database
    const { data, error } = await supabase.from("assets").insert({
      user_id: USER_ID,
      name: truncatedName,
      type,
      url: signedUrl,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error(`[AssetSaver] DB insert error: ${error.message}`);
      throw error;
    }

    console.log(`[AssetSaver] ✅ Saved ${type} asset: ${truncatedName} (id: ${data?.id})`);
  } catch (error) {
    console.error(`[AssetSaver] ❌ Failed to save ${type} asset "${name.slice(0, 50)}":`, error instanceof Error ? error.message : error);
  }
}
