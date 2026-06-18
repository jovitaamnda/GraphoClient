"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function AnalysisResult({ analysis }) {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // Debugging
  useEffect(() => {
    console.log("Data diterima Frontend:", analysis);
  }, [analysis]);

  if (!analysis) return null;

  // --- 1. NORMALISASI DATA ---
  const rawData = analysis.data ? analysis.data : analysis;

  // Persiapan Data untuk Tampilan
  const displayData = {
    enneagram: rawData.enneagramType || "Tipe Tidak Terdeteksi",
    personality: rawData.personalityType || "Unknown Type",
    description: rawData.description || "Deskripsi tidak tersedia.",

    // Ambil Confidence (Bulatkan ke angka)
    confidence: rawData.confidence ? Math.round(rawData.confidence) : 0,

    // Ambil Features (Traits dari Backend)
    features: rawData.traits || rawData.graphologyAnalysis || null,

    // Gambar
    image: rawData.imageUrl || rawData.canvasData,

    // Rekomendasi
    recommendations: Array.isArray(rawData.recommendations) ? rawData.recommendations : []
  };

  const descriptionSections = parseDescriptionSections(displayData.description);
  const mainSection = descriptionSections[0] || { title: null, content: 'Deskripsi tidak tersedia.' };
  const detailSections = descriptionSections.slice(1);
  const hasError = rawData.status === 'failed' || rawData.errorMessage;

  // --- 2. FUNGSI DOWNLOAD PDF (BACKEND) ---
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const analysisId = rawData._id || rawData.id;
      if (!analysisId) throw new Error("Analysis ID not found");

      const backendUrl = "http://localhost:8000";
      const downloadUrl = `${backendUrl}/api/analysis/${analysisId}/pdf`;

      window.open(downloadUrl, '_blank');

      setTimeout(() => setIsExporting(false), 2000);

    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mendownload PDF. Pastikan server backend berjalan.");
      setIsExporting(false);
    }
  };

  // --- 3. FUNGSI DOWNLOAD TXT ---
  const handleDownloadTxt = () => {
    const f = displayData.features || {};

    const recText = displayData.recommendations
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n');

    const txtContent = `
Graphology Analysis Result
==========================
Date: ${new Date().toLocaleDateString()}

RESULT
------
Type: ${displayData.enneagram}
Personality: ${displayData.personality}
Confidence: ${displayData.confidence}%

DESCRIPTION
-----------
${displayData.description}

RECOMMENDATIONS
---------------
${recText}

GRAPHOLOGY FEATURES
-------------------
1. Slant: ${f.slant?.val || '-'} 
   Meaning: ${f.slant?.meaning || '-'}
2. Size: ${f.size?.val || '-'}
   Meaning: ${f.size?.meaning || '-'}
3. Pressure: ${f.pressure?.val || '-'}
   Meaning: ${f.pressure?.meaning || '-'}
4. Baseline: ${f.baseline?.val || '-'}
   Meaning: ${f.baseline?.meaning || '-'}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([txtContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Analysis_${displayData.enneagram}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const cardSections = detailSections.length > 0 ? detailSections.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-[#F7E9E4] animate-in fade-in duration-700 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {hasError && (
          <div className="rounded-3xl border border-[#E6C1B0] bg-[#FFF2EA] p-6 mb-8 text-sm" style={{ color: '#7B4E42' }}>
            <p className="font-semibold mb-2">Hasil sementara ditampilkan karena AI service saat ini tidak dapat dijangkau.</p>
            <p>Hasil akhir akan muncul kembali setelah backend AI pulih.</p>
          </div>
        )}

        <div className="rounded-[40px] border border-[#ECD3C9] bg-[#FBECE6] p-8 shadow-sm sm:p-10">
          <div className="rounded-[40px] bg-white p-8 shadow-sm sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.9fr_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] font-semibold text-[#A16461]">
                  Hasil Analisis Kepribadian
                </p>
                <h1 className="mt-4 text-5xl md:text-6xl font-bold leading-tight" style={{ color: '#854C4A' }}>
                  {displayData.enneagram} — {displayData.personality}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#524342]">
                  {mainSection.content}
                </p>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-[#F0D8D3] bg-[#F9E2DA] p-5 shadow-sm">
                {displayData.image ? (
                  <img
                    src={displayData.image}
                    alt="Tulisan tangan user"
                    className="h-full w-full rounded-[28px] object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-[28px] bg-[#FCE8E0] p-8 text-center text-sm text-[#7B4E42]">
                    Gambar tulisan tangan tidak tersedia.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {cardSections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 * index }}
                  className="rounded-[28px] bg-[#F7E1D6] p-6 shadow-sm"
                >
                  {section.title && (
                    <h3 className="text-xl font-semibold text-[#7F3F3A] mb-4">
                      {section.title}
                    </h3>
                  )}
                  <p className="text-sm leading-7 text-[#6A4A45]">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-14 rounded-[32px] bg-[#7A4640] p-8 text-white shadow-lg sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight">Validasi Hasil Analisis</h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/85">
                    Meskipun analisis grafologi memberikan insight mengenai pola kepribadianmu, kepribadian manusia memiliki banyak dimensi yang kompleks.
                  </p>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                    Untuk mendapatkan hasil yang lebih mendalam dan akurat, lanjutkan dengan Kuesioner Enneagram 12 pertanyaan.
                  </p>
                  <button
                    onClick={() => {
                      const id = rawData._id || rawData.id;
                      if (id) {
                         router.push(`/user/analysis/validation?analysisId=${id}`);
                      } else {
                         const typeParam = rawData.enneagramType || 'Tipe 3';
                         router.push(`/user/analysis/validation?testType=${typeParam}`);
                      }
                    }}
                    className="mt-8 rounded-2xl bg-white px-7 py-3 text-sm font-semibold text-[#7A4640] shadow-sm transition hover:opacity-90"
                  >
                    Mulai Kuesioner Validasi
                  </button>
                </div>

                <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                  <div className="relative rounded-[24px] border border-white/20 bg-white/10 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 rounded-3xl bg-white/15 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#7A4640] font-bold">1</div>
                        <p className="text-sm font-semibold text-white">Analisis Grafologi Selesai</p>
                      </div>

                      <div className="flex justify-center">
                        <div className="h-12 w-px rounded-full bg-white/40" />
                      </div>

                      <div className="flex items-center gap-4 rounded-3xl bg-white/15 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white text-white">2</div>
                        <p className="text-sm font-semibold text-white">Validasi Kuesioner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to split description into sections and preserve backend formatting
function parseDescriptionSections(text) {
  if (!text) return [{ title: null, content: "Deskripsi tidak tersedia." }];

  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const trimmed = block.trim();
      const [firstLine, ...restLines] = trimmed.split('\n');
      const match = firstLine.match(/^(.{2,60}):\s*(.*)$/);

      if (match && (restLines.length > 0 || match[2])) {
        return {
          title: match[1].trim(),
          content: [match[2], ...restLines].filter(Boolean).join('\n').trim(),
        };
      }

      return {
        title: null,
        content: trimmed,
      };
    });
}

