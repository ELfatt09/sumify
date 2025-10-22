import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getAllUploads, uploadPDFToSupabase } from "../services/supabaseService";
import { arrayBufferToBase64 } from "../utils/pdfUtils";
import { cleanGeminiHTML } from "../utils/htmlUtils";
import { generateSummaryFromPDF } from "../services/summarizeService";
import { data as aiButtons } from "../data/ai-buttons";
import { getResponseFromDatabase } from "../services/storedAiResponseService";
import { supabase } from "../lib/supabase";
import Navbar from "../partials/navbar";

export default function UploadPDF() {
  const { handleSignOut, userData } = useAuth();
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null); // 🆕 untuk pop-up

  useEffect(() => {
    getAllUploads().then(setUploads).catch(console.error);

    const channel = supabase
      .channel(userData?.id + "-uploads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "uploads" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setUploads((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setUploads((prev) =>
              prev.map((todo) =>
                todo.id === payload.new.id ? payload.new : todo
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setUploads((prev) =>
              prev.filter((todo) => todo.id !== payload.old.id)
            );
          }
        }
      );

    const subscribeChannel = async () => {
      await channel.subscribe();
    };
    subscribeChannel();

    return () => {
      supabase.removeChannel(channel);
    };
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
      alert("🎉 Upload berhasil!");
    } catch (err) {
      console.error(err);
      alert("Upload gagal 😢");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-8 border border-gray-200 rounded-3xl bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-sm font-medium transition"
      >
        🚪 Keluar
      </button>

      <h2 className="text-3xl font-bold text-black mb-2">
        📄 Upload PDF-mu!
      </h2>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Simpan dan olah PDF-mu dengan AI ✨
      </p>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-4 w-full"
      >
        <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-black p-6 rounded-2xl w-full text-center transition-all duration-300 bg-gray-50 hover:bg-gray-100">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-gray-600">
            {file ? `📎 ${file.name}` : "Klik untuk memilih file PDF"}
          </span>
        </label>

        <button
          type="submit"
          disabled={uploading}
          className={`px-6 py-2 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {uploading ? "💾 Uploading..." : "🚀 Upload"}
        </button>
      </form>

      {/* List View */}
      <section className="mt-10 w-full">
        <h3 className="text-xl font-semibold mb-3 text-black">
          🗂 Daftar PDF
        </h3>
        {uploads.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">
            Belum ada file diunggah 😌
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                onClick={() => setSelectedPDF(upload)} // 🆕 buka popup
                className="p-4 hover:bg-gray-50 transition cursor-pointer flex flex-wrap gap-3 items-center justify-between border border-neutral-300  rounded-lg"
              >
                <div>
                  <p className="font-medium text-black" title={upload.title} data-tooltip-max-length="20">{upload.title.slice(0, 20)}{upload.title.length > 20 && "..."}</p>
                  <p className="text-xs text-gray-400">
                    Klik untuk lihat fitur AI ⚡
                  </p>
                </div>
                <span className="text-gray-400">klik untuk detail</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🆕 Pop-Up Detail Modal */}
      {selectedPDF && (
        <PdfModal
          pdf={selectedPDF}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
      </>
  );
}

// 🧠 Modal Detail PDF
function PdfModal({ pdf, onClose }) {
  const [openedFeatureId, setOpenedFeatureId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openedFeatureId) getExistingSummary(openedFeatureId);
  }, [openedFeatureId]);

  const getExistingSummary = async (featureId) => {
    try {
      const rawHTML = await getResponseFromDatabase(pdf.id, featureId);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat memuat ringkasan sebelumnya.");
    } catch (err) {
      console.error(err);
      setSummary("Ringkasan belum tersedia.");
    }
  };

  const handleSummarize = async (prompt, featureId) => {
    setLoading(true);
    try {
      const base64PDF = await arrayBufferToBase64(pdf.file_url, featureId);
      const rawHTML = await generateSummaryFromPDF(base64PDF, prompt, featureId, pdf.id);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat membuat ringkasan.");
    } catch (err) {
      console.error(err);
      setSummary("Gagal membuat ringkasan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg p-6 rounded-3xl shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-black mb-2">
          📘 {pdf.title}
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          Pilih fitur AI untuk diterapkan 👇
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {aiButtons.map((button) => (
            <button
              key={button.id}
              onClick={() =>
                setOpenedFeatureId(openedFeatureId === button.id ? null : button.id)
              }
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                openedFeatureId === button.id
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {button.title}
            </button>
          ))}
        </div>

        {summary && (
          <div className="border-t pt-3 mt-2">
            <strong className="block mb-2 text-gray-800">
              💬 {aiButtons[openedFeatureId - 1]?.title}
            </strong>
            {!loading && (
              <div
              className="prose prose-sm max-w-none text-gray-700 max-h-[200px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
            )}
            
            {loading && (
              <p className="text-gray-400 text-sm mt-2">
                Sedang membuat memproses...
              </p>
            )}

            <button
              onClick={() =>
                handleSummarize(aiButtons[openedFeatureId - 1]?.prompt, openedFeatureId)
              }
              className="mt-3 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              🔄 Generate Ulang
            </button>
          </div>
        )}
      </div>
      </div>
      
  );
}
