import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getAllUploads, uploadPDFToSupabase } from "../services/supabaseService";
import { arrayBufferToBase64 } from "../utils/pdfUtils";
import { cleanGeminiHTML } from "../utils/htmlUtils";
import { generateSummaryFromPDF } from "../services/summarizeService";
import { data } from "../data/ai-buttons";

export default function UploadPDF() {
  const { handleSignOut } = useAuth();
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getAllUploads()
      .then(setUploads)
      .catch(console.error);
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
      const url = await uploadPDFToSupabase(file);
      setFileUrl(url);
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
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
      >
        Sign Out
      </button>

      <h2 className="text-lg font-semibold mb-3">Upload your PDF</h2>

      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
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
          ✅ Uploaded!{" "}
          <a href={fileUrl} target="_blank" className="underline">
            View PDF
          </a>
        </p>
      )}

      <div className="mt-6 w-full">
        <h3 className="text-md font-semibold mb-2">Uploaded PDFs:</h3>
        <ul className="list-disc list-inside text-left">
          {uploads.map((upload) => (
            <PdfItem key={upload.id} uploadId={upload.id} fileName={upload.file_name} fileUrl={upload.file_url} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PdfItem({ fileName, fileUrl, uploadId }) {
  const [openedFeatureId, setOpenedFeatureId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setSummary();
  }, [openedFeatureId]);

  const getExistingSummary = async (featureId) => {
    try {
      const rawHTML = await generateSummaryFromPDF(null, null, featureId, uploadId);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat membuat ringkasan.");
    } catch (err) {
      console.error(err);
      setSummary("Gagal membuat ringkasan.");
    }
  }

  const handleSummarize = async (prompt, featureId, uploadId) => {
    setLoading(true);
    try {
      const base64PDF = await arrayBufferToBase64(fileUrl, featureId);
      const rawHTML = await generateSummaryFromPDF(base64PDF, prompt, featureId, uploadId);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat membuat ringkasan.");
    } catch (err) {
      console.error(err);
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
      {data.map((button) => (
        <button
          key={button.id}
          onClick={() => handleSummarize(button.prompt, button.id, uploadId)}
          disabled={loading}
          className="ml-4 px-2 py-1 bg-blue-600 text-white rounded"
        >
          {loading ? "Merangkum..." : button.title}
        </button>
      ))}
      {summary && (
        <div className="mt-2">
          <strong>Ringkasan:</strong>
          <div
            className="
              [&>p]:mt-2 [&>p]:text-justify
              [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mt-2
              [&>li]:ml-4 [&>li]:mt-1
              [&>strong]:font-semibold
            "
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </div>
      )}
    </li>
  );
}
