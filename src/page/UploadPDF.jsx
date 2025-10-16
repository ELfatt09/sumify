import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getAllUploads, uploadPDFToSupabase } from "../services/supabaseService";
import { arrayBufferToBase64 } from "../utils/pdfUtils";
import { cleanGeminiHTML } from "../utils/htmlUtils";
import { generateSummaryFromPDF } from "../services/summarizeService";
import { data as aiButtons } from "../data/ai-buttons";
import { getResponseFromDatabase } from "../services/storedAiResponseService";

export default function UploadPDF() {
  const { handleSignOut } = useAuth();
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getAllUploads().then(setUploads).catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile?.type === "application/pdf") setFile(uploadedFile);
    else alert("Please upload a valid PDF file!");
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
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-sm font-medium"
      >
        Sign Out
      </button>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload your PDF</h2>

      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4 w-full">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="cursor-pointer border border-gray-300 p-2 rounded-lg w-full text-gray-600 hover:border-gray-400 transition"
        />
        {file && <p className="text-sm text-gray-500">{file.name}</p>}

        <button
          type="submit"
          disabled={uploading}
          className={`px-6 py-2 rounded-lg text-white font-medium transition ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload to Supabase"}
        </button>
      </form>

      {fileUrl && (
        <p className="text-green-600 mt-4 text-sm">
          ✅ Uploaded!{" "}
          <a href={fileUrl} target="_blank" className="underline hover:text-green-700">
            View PDF
          </a>
        </p>
      )}

      <section className="mt-8 w-full">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Uploaded PDFs</h3>
        <ul className="space-y-4">
          {uploads.map((upload) => (
            <PdfItem
              key={upload.id}
              uploadId={upload.id}
              fileName={upload.file_name}
              fileUrl={upload.file_url}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function PdfItem({ fileName, fileUrl, uploadId }) {
  const [openedFeatureId, setOpenedFeatureId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openedFeatureId) getExistingSummary(openedFeatureId);
  }, [openedFeatureId]);

  const getExistingSummary = async (featureId) => {
    try {
      const rawHTML = await getResponseFromDatabase(uploadId, featureId);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat memuat ringkasan sebelumnya.");
    } catch (err) {
      console.error(err);
      setSummary("Gagal memuat ringkasan.");
    }
  };

  const handleSummarize = async (prompt, featureId) => {
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
    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <a
          href={fileUrl}
          target="_blank"
          className="font-medium text-blue-600 hover:underline truncate max-w-sm"
        >
          {fileName}
        </a>

        <div className="flex flex-wrap gap-2">
          {aiButtons.map((button) => (
            <button
              key={button.id}
              onClick={() =>
                setOpenedFeatureId(openedFeatureId === button.id ? null : button.id)
              }
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                openedFeatureId === button.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {loading && openedFeatureId === button.id ? "Memproses..." : button.title}
            </button>
          ))}
        </div>
      </div>

      {summary && (
        <div className="mt-3">
          <strong className="text-gray-800">Ringkasan:</strong>
          <div
            className="prose prose-sm max-w-none mt-2 text-gray-700"
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          <button
            onClick={() =>
              handleSummarize(aiButtons[openedFeatureId - 1]?.prompt, openedFeatureId)
            }
            className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
          >
            Generate
          </button>
        </div>
      )}
    </li>
  );
}
