import { createOrUpdateResponseInDatabase } from "./storedAiResponseService";
import { supabase } from "../lib/supabase";

export async function generateSummaryFromPDF(base64PDF, prompt, featureId, uploadId) {
  console.log("generateSummaryFromPDF called", { featureId, uploadId });

  try {
    // panggil Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("smart-function/gemini-summariser", {
      body: { base64PDF, prompt, featureId, uploadId },
    });

    if (error) throw error;

    const text = data?.text || "";
    await createOrUpdateResponseInDatabase(text, featureId, uploadId);

    return text;
  } catch (error) {
    console.error("generateSummaryFromPDF error", error);
    return `Gagal membuat ringkasan. ${error.message}`;
  }
}
