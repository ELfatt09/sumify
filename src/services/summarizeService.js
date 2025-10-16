import { gemini } from "../lib/gemini";
import { createOrUpdateResponseInDatabase } from "./storedAiResponseService";



export async function generateSummaryFromPDF(base64PDF, prompt, featureId, uploadId) {

  if (!base64PDF) {
    
  }
  const finalPrompt = `
    ${prompt}
    Gunakan hanya tag: <p>, <ul>, <li>, <strong>, <br>.
    Panjang: minimal 50 kata dan maksimal setengah total kata dari teks asli di dokumen.
    Jangan sertakan backtick (\`\`\`), komentar, atau teks di luar HTML.
  `;

  const contents = [
    { text: finalPrompt },
    { inlineData: { mimeType: "application/pdf", data: base64PDF } },
  ];

  try {
    const result = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
    });

    await createOrUpdateResponseInDatabase(result?.candidates?.[0]?.content?.parts?.[0]?.text, featureId, uploadId);

    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error(error);
    return `Gagal membuat ringkasan. ${error.message}`;
  }
}


