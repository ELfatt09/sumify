import { gemini } from "../lib/gemini";

export async function generateSummaryFromPDF(base64PDF) {
  const prompt = `
    berikan saya rangkuman isi dari dokumen PDF berikut yang sudah di dalam bahasa Indonesia dengan format HTML.
    Gunakan hanya tag: <p>, <ul>, <li>, <strong>, <br>.
    Panjang: minimal 50 kata dan maksimal setengah total kata dari teks asli di dokumen.
    Jangan sertakan backtick (\`\`\`), komentar, atau teks di luar HTML.
  `;

  const contents = [
    { text: prompt },
    { inlineData: { mimeType: "application/pdf", data: base64PDF } },
  ];

  const result = await gemini.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
  });

  return result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
