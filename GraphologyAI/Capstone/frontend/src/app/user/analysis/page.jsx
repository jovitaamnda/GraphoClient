"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import UploadFoto from "@/components/analysis/UploadFoto";
import HandwritingCanvas from "@/components/analysis/HandwritingCanvas";
import HasilAnalisis from "@/components/analysis/HasilAnalisis";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";
import { analysisApi } from "@/api";
import Swal from 'sweetalert2';
import { useAuth } from "@/context/AuthContext";

const mockFallbackAnalysis = (imageUrl, fileName) => ({
  enneagramType: "Tipe 3",
  personalityType: "Pribadi Ekspresif",
  description: "Analisis menunjukkan kecenderungan pribadi yang berorientasi pada tujuan, produktif, dan memiliki motivasi tinggi untuk mencapai keberhasilan.\n\nMotivasi Berprestasi: Anda senang menetapkan target dan berusaha mencapainya dengan strategi yang terukur.\n\nAdaptabilitas Tinggi: Anda mampu menyesuaikan diri dengan berbagai situasi dan tetap menjaga performa dalam tekanan.\n\nFokus pada Hasil: Anda lebih memilih tindakan yang efektif dan efisien untuk mencapai tujuan yang telah ditetapkan.",
  confidence: 84,
  traits: {
    slant: { val: "Vertical/Right", meaning: "Motivasi Berprestasi: Anda senang menetapkan target dan bekerja dengan strategi terukur." },
    size: { val: "Large (Besar)", meaning: "Fokus pada Hasil: Tulisan yang jelas menunjukkan keinginan kuat untuk mencapai tujuan." },
    pressure: { val: "Heavy (Tebal)", meaning: "Daya Kerja Tinggi: Energi Anda mendukung tindakan yang efektif dan produktif." },
    baseline: { val: "Ascending (Naik)", meaning: "Adaptabilitas Tinggi: Anda mampu menyesuaikan diri dengan tekanan sambil tetap menjaga performa." },
  },
  recommendations: [
    "Berikan waktu istirahat untuk memperbarui energi Anda.",
    "Tetap jujur pada diri sendiri tentang motivasi yang mendorong Anda.",
    "Fokus pada kualitas hasil, bukan hanya kuantitas pencapaian.",
  ],
  imageUrl,
  fileName,
  fallback: true,
});

export default function HomeAnalisis() {
  const router = useRouter();
  const [step, setStep] = useState("upload");
  const [inputMode, setInputMode] = useState("upload"); // "upload" atau "canvas"
  const [analysisResult, setAnalysisResult] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingFileName, setPendingFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallbackResult, setIsFallbackResult] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await analysisApi.getHistory(user._id, 1, 3);
          setHistory(res.analyses || []);
        } catch (err) {
          console.error("Gagal mengambil riwayat", err);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handleUploadComplete = async (imageData) => {
    setIsLoading(true);
    setError(null);
    setIsFallbackResult(false);
    try {
      // Call API - userId will be extracted from JWT token by backend
      const data = await analysisApi.uploadImage(imageData);
      setAnalysisResult(data.analysis);
      setPendingImage(null);
      setPendingFileName(null);
      setStep("hasil");
    } catch (err) {
      const errorMessage = err.message || String(err);
      const isAIFailure = /ai service failed|connect|timeout|ECONNREFUSED|ETIMEDOUT/i.test(errorMessage);

      if (isAIFailure) {
        const fallbackAnalysis = mockFallbackAnalysis(pendingImage, pendingFileName);
        setAnalysisResult(fallbackAnalysis);
        setIsFallbackResult(true);
        setStep("hasil");
        setPendingImage(null);
        setPendingFileName(null);
      } else {
        let displayMessage = errorMessage;
        if (
          errorMessage.toLowerCase().includes("ai service failed") ||
          errorMessage.toLowerCase().includes("connect") ||
          errorMessage.toLowerCase().includes("timeout")
        ) {
          displayMessage = "Layanan AI tidak terhubung dan terputus.";
        }

        Swal.fire({
          icon: 'error',
          title: 'Gagal Terhubung',
          text: displayMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Tutup'
        });

        if (errorMessage.includes("authorized") || errorMessage.includes("token")) {
          setShowLoginModal(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#221A13] pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="space-y-12">

          <div className="rounded-[2rem] border border-[#E7D7D1] bg-white p-10 shadow-sm">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="mx-auto inline-flex rounded-xl border border-[#F0E4DD] bg-[#FFF2EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#8F5B54]">
                Analisis Grafologi
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#221A13]">
                Analisis Tulisan Tangan Anda
              </h1>
              <p className="mx-auto max-w-3xl text-base md:text-lg leading-relaxed text-[#524342]">
                Unggah tulisan tangan atau tulis langsung di layar untuk melihat wawasan kepribadian dan fitur grafologi yang diproses oleh AI.
              </p>
            </div>
          </div>

          {step === "upload" ? (
            <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr] items-start">
              <div className="rounded-[2rem] border border-[#E7D7D1] bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 gap-3 p-6 pb-4">
                  <button
                    onClick={() => setInputMode("upload")}
                    className={`rounded-[1.75rem] px-5 py-3 text-sm font-semibold transition ${
                      inputMode === "upload"
                        ? "bg-[#854C4A] text-white shadow-sm"
                        : "bg-white text-[#6E5B42] border border-[#E7D7D1] hover:border-[#C9B0A8]"
                    }`}
                  >
                    Unggah Foto
                  </button>
                  <button
                    onClick={() => setInputMode("canvas")}
                    className={`rounded-[1.75rem] px-5 py-3 text-sm font-semibold transition ${
                      inputMode === "canvas"
                        ? "bg-[#854C4A] text-white shadow-sm"
                        : "bg-white text-[#6E5B42] border border-[#E7D7D1] hover:border-[#C9B0A8]"
                    }`}
                  >
                    Tulis Langsung
                  </button>
                </div>

                <div className="p-8">
                  {inputMode === "upload" ? (
                    <UploadFoto onUploadComplete={handleUploadComplete} onUploadReady={(preview, fileName) => {
                      setPendingImage(preview);
                      setPendingFileName(fileName);
                    }} />
                  ) : (
                    <HandwritingCanvas onUploadComplete={handleUploadComplete} />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] bg-[#F5E5DA] p-8 shadow-sm border border-[#E4D0C5]">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8ECE7] text-[#8B4C45] shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M12 19V5" />
                        <path d="M5 12H19" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-[#2C1F18]">Panduan Penulisan</h2>
                      <p className="mt-2 max-w-xs text-sm leading-7 text-[#4D3F38]">Ikuti langkah sederhana ini untuk membuat analisis grafologi Anda lebih akurat.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      "Gunakan kertas putih tanpa garis agar analisis kemiringan tulisan lebih akurat.",
                      "Tuliskan 3–5 kalimat secara alami tanpa terlalu memikirkan bentuk tulisan.",
                      "Pastikan pencahayaan cukup dan foto terlihat jelas saat mengunggah tulisan.",
                      "Tambahkan tanda tangan di bagian bawah seperti biasanya."
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-start gap-4 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]">
                        <div className="min-w-[40px] text-[#8B4C45] font-semibold text-lg leading-none">0{idx + 1}</div>
                        <p className="text-sm leading-7 text-[#3F322A]">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#E7D7D1] bg-[#FFF8F4] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#854C4A] font-semibold">Status Analisis</p>
                    {isLoading && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#E7D7D1] bg-white px-3 py-2 text-sm text-[#854C4A] shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sedang Diproses
                      </div>
                    )}
                  </div>
                  <div className="rounded-[1.5rem] border border-dashed border-[#E7D7D1] bg-white p-6">
                    {isLoading ? (
                      <div className="space-y-5">
                        <div className="rounded-[1.75rem] border border-[#E7D7D1] bg-[#FBF6F3] overflow-hidden shadow-sm">
                          <div className="h-44 bg-[#EDE2DA] flex items-center justify-center">
                            {pendingImage ? (
                              <img src={pendingImage} alt="Preview upload" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#B39A8D]">Loading preview...</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[#221A13]">{pendingFileName || 'File sedang diproses'}</p>
                          <p className="mt-1 text-sm text-[#6E5B42]">Diunggah beberapa saat lalu</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-[#221A13]">Belum ada hasil analisis</p>
                        <p className="mt-2 text-sm text-[#6E5B42] leading-relaxed">
                          Insight dan hasil grafologi akan muncul setelah tulisan berhasil dianalisis.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-[#E7D7D1] p-8 md:p-14 shadow-sm max-w-5xl mx-auto">
              {isFallbackResult && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                  Hasil sementara ditampilkan karena AI service saat ini sedang tidak dapat dijangkau. Hasil asli akan muncul kembali setelah backend AI pulih.
                </div>
              )}
              <HasilAnalisis analysis={analysisResult} />
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-6 pt-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-[#221A13]">Wawasan Terbaru</h3>
                <button
                  onClick={() => router.push("/user/dashboard")}
                  className="text-sm font-semibold text-[#854C4A] hover:text-[#C17F7C] transition-colors"
                >
                  Lihat Riwayat
                </button>
              </div>
              
              {isLoadingHistory ? (
                <div className="rounded-[2rem] border border-dashed border-[#E7D7D1] bg-[#FFF3EE] p-12 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#854C4A]" />
                </div>
              ) : history.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {history.map((item) => (
                    <div key={item._id} className="rounded-[1.5rem] border border-[#E7D7D1] bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                        setAnalysisResult(item);
                        setStep("hasil");
                    }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[#854C4A] uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                        <span className="px-3 py-1 bg-[#F5E5DA] text-[#854C4A] rounded-full text-xs font-medium">{item.confidence}%</span>
                      </div>
                      <h4 className="text-lg font-bold text-[#221A13] mb-2">{item.enneagramType}</h4>
                      <p className="text-sm text-[#6E5B42] line-clamp-2">{item.personalityType}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-[#E7D7D1] bg-[#FFF3EE] p-12 shadow-none">
                  <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-white border border-[#E7D7D1] shadow-sm text-[#8F6F63]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 14.5" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-[#221A13]">Belum ada analisis</p>
                    <p className="max-w-xl text-sm text-[#6E5B42] leading-relaxed">
                      Mulai unggah tulisan tangan pertama Anda untuk melihat wawasan di sini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <footer className="mt-20 border-t border-[#DBC9C4]/40 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#6E5B42]">
            <div>
              <span className="font-semibold text-[#854C4A]">Grafologi</span> © 2026
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#854C4A] transition-colors">Tentang</a>
              <a href="#" className="hover:text-[#854C4A] transition-colors">Privasi</a>
              <a href="#" className="hover:text-[#854C4A] transition-colors">Bantuan</a>
              <a href="#" className="hover:text-[#854C4A] transition-colors">Ketentuan</a>
            </div>
          </footer>

        </div>
      </div>

      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
