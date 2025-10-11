import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();



const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const getAllUploads = async () => {
    const { data, error } = await supabase.from("uploads").select("*");
    if (error) throw error;
    return data;
  };

  useEffect(() => { 
    getAllUploads().then(setUploads).catch(console.error);
   }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
    } else {
      alert("Please upload a valid PDF file!");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF first!");

    try {
      setUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("Pdfs")
        .upload(fileName, file);

        if (error) throw error;



      const { data: publicUrlData } = supabase.storage
        .from("Pdfs")
            .getPublicUrl(fileName);
    
                
        await supabase.from("uploads").insert({
            file_name: fileName,
            file_url: publicUrlData.publicUrl,
        });

      setFileUrl(publicUrlData.publicUrl);
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
      <h2 className="text-lg font-semibold mb-3">Upload your PDF</h2>
      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="cursor-pointer"
        />

        {file && <p className="text-sm text-gray-600">{file.name}</p>}

        <button
          type="submit"
          disabled={uploading}
          className={`px-4 py-2 rounded-lg text-white ${
            uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload to Supabase"}
        </button>
      </form>

      {fileUrl && (
        <p className="text-green-600 mt-3">
          ✅ Uploaded! <a href={fileUrl} target="_blank" className="underline">View PDF</a>
        </p>
      )}
      <div className="mt-6 w-full">
        <h3 className="text-md font-semibold mb-2">Uploaded PDFs:</h3>
        <ul className="list-disc list-inside text-left">
          {uploads.map((upload) => (
            <PdfItem key={upload.id} fileName={upload.file_name} fileUrl={upload.file_url} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PdfItem({ fileName, fileUrl }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fungsi ekstrak teks dari PDF URL
  const extractTextFromPdfUrl = async (url) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }

    return text;
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const pdfText = await extractTextFromPdfUrl(fileUrl);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Halo Gemini, saya memiliki dokumen PDF yang berisi banyak informasi. Tugas Anda adalah membuat *ringkasan* dari dokumen ini dalam **bahasa Indonesia**, menggunakan **format HTML terstruktur** hanya dengan tag berikut: <p>, <ul>, <li>, <strong>, dan <br>.

⚠️ Aturan wajib:
1. **Gunakan hanya tag yang disebutkan di atas.** Jangan gunakan tag lain dalam bentuk apa pun.
2. **Panjang ringkasan:**
   - Minimal **50 kata**.
   - Maksimal **setengah dari total kata** dalam dokumen PDF.
   - Jika setengah dari total kata dokumen kurang dari 50, gunakan **antara 50 hingga 70 kata**.
3. **Output harus bersih**, tanpa tambahan atau penjelasan apa pun:
   - Jangan tulis \`\`\`html, \`\`\`, html:, begin, end, atau teks lain di luar hasil HTML.
   - Tidak boleh ada komentar, catatan, atau kalimat di luar struktur HTML.
   - jangan gunakan blok kode seperti \`\`\`html atau \`\`\` di awal atau akhir jawaban. 
Saya hanya ingin hasil HTML murni tanpa tanda backtick, tanpa kata "html", "begin", "end", atau teks tambahan. 
Output harus bersih, hanya berisi tag <p>, <ul>, <li>, <strong>, dan <br>.

4. **Struktur HTML boleh diubah** sesuai kebutuhan isi ringkasan, selama tetap mematuhi semua aturan di atas.

📘 **Contoh format hasil yang benar:**

<p>Lorem ipsum dolor sit <strong>amet</strong></p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

Berikut isi dokumen yang harus diringkas:

${pdfText}

`
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const summaryText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      setSummary(summaryText.replace(/```html/g, '') 
  .replace(/```/g, '')  
  .trim() || "Tidak dapat membuat ringkasan.");
    } catch (error) {
      console.error(error);
      setSummary("Gagal membuat ringkasan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="mb-4">
      <a href={fileUrl} target="_blank" className="underline text-blue-600">
        {fileName}
      </a>
      <button
        onClick={generateSummary}
        disabled={loading}
        className="ml-4 px-2 py-1 bg-blue-600 text-white rounded"
      >
        {loading ? "Merangkum..." : "Ringkas"}
      </button>
      {summary && (
        <p className="mt-2 ">
          <strong>Ringkasan:</strong>
          {summary && <div className="
  [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-4
  [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-3
  [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-2
  [&>p]:mt-2 [&>p]:text-justify
  [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mt-2
  [&>li]:ml-4 [&>li]:mt-1

  "
           dangerouslySetInnerHTML={{ __html: summary }} />}
        </p>
      )}
    </li>
  );
}

