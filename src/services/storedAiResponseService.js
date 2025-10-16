import { supabase } from "../lib/supabase";

export async function createOrUpdateResponseInDatabase(response, featureId, uploadId) {
  try {
    const { data: existingData } = await supabase.from("ai_responses").select("*").eq("feature_id", featureId).single();
    if (existingData) {
      await supabase.from("ai_responses").update({ response, }).eq("id", existingData.id);
    } else {
      await supabase.from("ai_responses").insert({ feature_id: featureId, uploads_id: uploadId, response });
    }
    return { status: "success", error: null };
  } catch (error) {
    console.error("Error creating or updating response in database:", error);
    return { status: "error", error };
  }
}