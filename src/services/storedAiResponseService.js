import { supabase } from "../lib/supabase";

export async function createOrUpdateResponseInDatabase(response, featureId, uploadId) {
  try {
    const { data: existingData } = await supabase.from("ai_responses").select("*").eq("feature_id", featureId).eq("uploads_id", uploadId).single();
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

export async function getResponseFromDatabase(uploadId, featureId) {
  try {
    const { data, error, status } = await supabase
      .from("ai_responses")
      .select("response")
      .eq("feature_id", featureId)
      .eq("uploads_id", uploadId)
      .single(); // pakai maybeSingle biar ga throw error 406 atau null data

    if (error) {
      console.error("❌ Supabase error:", error.message, "| status:", status);
      return null;
    }

    // Pastikan response bukan null atau tipe aneh
    if (!data || !data.response) {
      console.warn("⚠️ No response found in database for:", { uploadId, featureId });
      return null;
    }

    // Jika response berupa objek jsonb, ubah ke string
    if (typeof data.response === "object") {
      return JSON.stringify(data.response);
    }

    return data.response;
  } catch (err) {
    console.error("💥 Unexpected error getting response from database:", err);
    return null;
  }
}
