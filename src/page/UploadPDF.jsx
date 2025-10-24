import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getAllUploads, uploadPDFToSupabase } from "../services/supabaseService";
import { cleanGeminiHTML } from "../utils/htmlUtils";
import { generateSummaryFromPDF } from "../services/summarizeService";
import { data as aiButtons } from "../data/ai-buttons";
import { getResponseFromDatabase } from "../services/storedAiResponseService";
import { supabase } from "../lib/supabase";
import Navbar from "../partials/Navbar";
import { useNotification } from "../context/notificationContext";

export default function UploadPDF() {
  const { userData } = useAuth();
  const { setNotification } = useNotification();
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
    else setNotification("error","File yang diupload harus berformat PDF.");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setNotification("error","Silahkan pilih file PDF.");

    try {
      setUploading(true);
      const url = await uploadPDFToSupabase(file);
      setFileUrl(url);
      setNotification("success","🎉 Upload berhasil!");
    } catch (err) {
      console.error(err);
      setNotification("error","Upload gagal 😢");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-8 border border-gray-200 rounded-3xl bg-white shadow-sm hover:shadow-lg transition-all duration-300">


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
          📁 Daftar PDF
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
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak ada hasil sebelumnya.");
    } catch (err) {
      console.error(err);
      setSummary("Belum ada hasil disimpan.");
    }
  };

  const handleSummarize = async (prompt, featureId) => {
    setLoading(true);
    try {
      const rawHTML = await generateSummaryFromPDF(prompt, featureId, pdf.id);
      setSummary(cleanGeminiHTML(rawHTML) || "Tidak dapat membuat ringkasan.");
    } catch (err) {
      console.error(err);
      setSummary("Gagal membuat ringkasan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white/90 backdrop-blur-md w-full max-w-3xl p-6 rounded-3xl shadow-2xl transition-all duration-300 border border-gray-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-black text-xl"
        >
          ✖
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-black mb-1">
          📘 {pdf.title}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Pilih fitur AI di bawah untuk melihat atau menghasilkan hasil baru.
        </p>

        {/* AI Feature Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4">
          {aiButtons.map((button) => {
            const active = openedFeatureId === button.id;
            return (
              <button
                key={button.id}
                onClick={() =>
                  setOpenedFeatureId(active ? null : button.id)
                }
                disabled={loading}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300
                  ${active
                    ? "bg-black  text-white font-semibold"
                    : "hover:text-white hover:bg-black"
                  }`}
              >
                {button.title}
              </button>
            );
          })}
        </div>

        {/* AI Output Section */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-50 rounded-2xl p-4 text-gray-800 prose prose-sm scrollbar-thin scrollbar-thumb-gray-300">
          {loading && (
            <p className="text-gray-400 italic">🤖 Sedang memproses permintaan AI...</p>
          )}

          {!loading && summary && (
            <div
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          )}

          {!loading && !summary && (
            <p className="text-gray-400 text-sm">
              Pilih salah satu fitur AI untuk melihat hasilnya.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {openedFeatureId && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() =>
                handleSummarize(aiButtons[openedFeatureId - 1]?.prompt, openedFeatureId)
              }
              className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300"
            >
              🔄 Generate Ulang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

