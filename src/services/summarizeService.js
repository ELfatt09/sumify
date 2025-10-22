import { gemini } from "../lib/gemini";
import { createOrUpdateResponseInDatabase } from "./storedAiResponseService";



export async function generateSummaryFromPDF(base64PDF, prompt, featureId, uploadId) {
  console.log("generateSummaryFromPDF called with", { base64PDF, prompt, featureId, uploadId });

  const finalPrompt = `
    ${prompt}\n\n
⚠️ Perhatian penting:
Mulailah respon **langsung dengan konten dalam format HTML**, tanpa kalimat pembuka seperti “baik”, “berikut adalah”, “ini hasilnya”, atau sejenisnya.

Gunakan **hanya** tag HTML berikut:
<p>, <ul>, <li>, <strong>, dan <br>.

🚫 Jangan gunakan tag lain seperti <html>, <head>, <body>, <div>, atau tag HTML kompleks lainnya.

Gunakan <br> untuk memisahkan ide agar lebih mudah dibaca dan dipahami.

🧠 Aturan tambahan:
- Panjang konten minimal 50 kata dan maksimal setengah dari total kata dokumen asli.
- Gunakan bahasa ringan, menyenangkan, dan mudah dipahami oleh pelajar Gen-Z.
- Jangan sertakan karakter non-HTML seperti tanda backtick (\`\`\`\`\`), komentar, atau teks di luar struktur HTML.
- Tidak boleh ada pembuka, penjelasan tambahan, atau catatan sistem. 
- Output **hanya berisi HTML** siap render di UI.

Contoh format yang benar:
<p><strong>Judul:</strong> Ringkasan singkat dokumen...</p>
<ul>
  <li>Poin penting pertama...</li>
  <li>Poin penting kedua...</li>
</ul>
<p>Tips: Gunakan metode ini untuk memahami topik lebih cepat.<br>Belajar santai tapi tetap nyantol!</p>

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

    console.log("generateSummaryFromPDF result", result);

    await createOrUpdateResponseInDatabase(result?.candidates?.[0]?.content?.parts?.[0]?.text, featureId, uploadId);

    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("generateSummaryFromPDF error", error);
    return `Gagal membuat ringkasan. ${error.message}`;
  }
}


