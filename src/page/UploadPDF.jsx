import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import { GoogleGenAI } from "@google/genai";

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
        <ul className="list-disc list-inside text-left max-h-48 overflow-y-auto">
          {uploads.map((upload) => (
            <li key={upload.id}>
              <a href={upload.file_url} target="_blank" className="underline">
                {upload.file_name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
