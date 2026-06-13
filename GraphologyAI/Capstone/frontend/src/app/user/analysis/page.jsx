"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadFoto from "@/components/analysis/UploadFoto";
import HandwritingCanvas from "@/components/analysis/HandwritingCanvas";
import HasilAnalisis from "@/components/analysis/HasilAnalisis";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";
import LoadingModal from "@/components/modals/LoadingModal";
import { analysisApi } from "@/api";
import Swal from 'sweetalert2';

export default function HomeAnalisis() {
  const router = useRouter();
  const [step, setStep] = useState("upload");
  const [inputMode, setInputMode] = useState("upload"); // "upload" atau "canvas"
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleUploadComplete = async (imageData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call API - userId will be extracted from JWT token by backend
      const data = await analysisApi.uploadImage(imageData);
      setAnalysisResult(data.analysis);
      setStep("hasil");
    } catch (err) {
      // Custom error message for AI connection issues
      let displayMessage = err.message;

      if (
        err.message.toLowerCase().includes("ai service failed") ||
        err.message.toLowerCase().includes("connect") ||
        err.message.toLowerCase().includes("timeout")
      ) {
        displayMessage = "Layanan AI tidak terhubung dan terputus.";
      }

      // Show error popup instead of console error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Terhubung',
        text: displayMessage,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tutup'
      });

      // Check if it's an authentication error
      if (err.message.includes("authorized") || err.message.includes("token")) {
        setShowLoginModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#221A13] pt-28 pb-16">
      <div className="mx-auto max-w-full w-full px-8">
        <div className="space-y-12">
          
          {/* ── Heading ── */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-[#221A13]">
              Analisis Tulisan Tangan
            </h1>
            <p className="text-lg text-[#221A13]/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Temukan pola karakter dan kepribadianmu melalui tulisan tangan alami yang kamu buat sehari-hari.
              Unggah sampel tulisan tangan untuk memulai analisis grafologi pertamamu.
            </p>
          </div>

          {step === "upload" ? (
            <div className="grid gap-8 xl:grid-cols-[1.55fr_0.95fr]">
              
              {/* ── Kotak Input Utama (Sisi Kiri) ── */}
              <div className="rounded-[2rem] border border-[#DBC9C4] bg-white shadow-sm overflow-hidden flex flex-col">
                {/* Tabs Selector */}
                <div className="flex border-b border-[#DBC9C4]/40 bg-[#854C4A]/5">
                  <button
                    onClick={() => setInputMode("upload")}
                    className={`flex-1 py-4 text-base font-bold border-b transition-all ${
                      inputMode === "upload"
                        ? "border-b-2 border-[#854C4A] text-[#854C4A] bg-white"
                        : "border-transparent text-[#6E5B42] hover:text-[#854C4A]"
                    }`}
                  >
                    Unggah Foto
                  </button>
                  <button
                    onClick={() => setInputMode("canvas")}
                    className={`flex-1 py-4 text-base font-bold border-b transition-all ${
                      inputMode === "canvas"
                        ? "border-b-2 border-[#854C4A] text-[#854C4A] bg-white"
                        : "border-transparent text-[#6E5B42] hover:text-[#854C4A]"
                    }`}
                  >
                    Tulis di Layar
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {inputMode === "upload" ? (
                    <UploadFoto onUploadComplete={handleUploadComplete} />
                  ) : (
                    <HandwritingCanvas onUploadComplete={handleUploadComplete} />
                  )}
                </div>
              </div>

              {/* ── Sisi Kanan: Panduan & Status ── */}
              <div className="flex flex-col gap-6">
                
                {/* Panduan Penulisan */}
                <div className="rounded-[2rem] border border-[#DBC9C4] bg-[#F5EDE8] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📌</span>
                    <h3 className="text-2xl font-bold text-[#854C4A] tracking-wide">
                      Panduan Penulisan
                    </h3>
                  </div>
                  <ul className="space-y-5 text-[#221A13] leading-relaxed">
                    <li className="flex gap-4">
                      <span className="font-mono text-[#854C4A] font-bold text-lg shrink-0">01</span>
                      <span className="text-base font-semibold text-[#221A13]">Gunakan kertas putih tanpa garis agar analisis kemiringan tulisan lebih akurat.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-mono text-[#854C4A] font-bold text-lg shrink-0">02</span>
                      <span className="text-base font-semibold text-[#221A13]">Tuliskan 3-5 kalimat secara alami tanpa terlalu memikirkan bentuk tulisan.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-mono text-[#854C4A] font-bold text-lg shrink-0">03</span>
                      <span className="text-base font-semibold text-[#221A13]">Pastikan pencahayaan cukup dan foto terlihat jelas saat mengunggah tulisan.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-mono text-[#854C4A] font-bold text-lg shrink-0">04</span>
                      <span className="text-base font-semibold text-[#221A13]">Tambahkan tanda tanganmu di bagian bawah seperti biasanya.</span>
                    </li>
                  </ul>
                </div>

                {/* Status Laporan */}
                <div className="rounded-[2rem] border border-[#DBC9C4] bg-white p-8 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#854C4A] font-extrabold mb-3">
                    Belum Ada Hasil Analisis
                  </p>
                  <p className="text-base text-[#221A13] leading-relaxed font-medium">
                    Insight dan hasil grafologi akan muncul setelah tulisan berhasil dianalisis.
                  </p>
                </div>

              </div>

            </div>
          ) : (
            /* ── Tampilan Hasil Analisis ── */
            <div className="bg-white rounded-[2rem] border border-[#DBC9C4] p-8 md:p-14 shadow-sm max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#DBC9C4]/40">
                <h2 className="text-2xl font-bold text-[#854C4A]">Hasil Analisis Lengkap</h2>
                <button
                  onClick={() => setStep("upload")}
                  className="text-sm font-semibold text-[#854C4A] hover:text-[#C17F7C] transition-colors"
                >
                  ← Mulai Ulang
                </button>
              </div>
              <HasilAnalisis analysis={analysisResult} />
            </div>
          )}

          {/* ── Wawasan Terbaru (Hanya Muncul Saat Upload State) ── */}
          {step === "upload" && (
            <div className="space-y-6 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-[#221A13]">Wawasan Terbaru</h3>
                <button
                  onClick={() => router.push("/user/dashboard")}
                  className="text-sm font-semibold text-[#854C4A] hover:text-[#C17F7C] transition-colors"
                >
                  Lihat Riwayat
                </button>
              </div>
              
              <div className="rounded-[2rem] border-2 border-dashed border-[#DBC9C4] p-12 text-center bg-white">
                <div className="w-14 h-14 rounded-full bg-[#854C4A]/10 flex items-center justify-center mx-auto mb-4 text-[#854C4A]">
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="font-semibold text-[#221A13]">Belum ada analisis</p>
                <p className="text-sm text-[#6E5B42] mt-1">
                  Mulai unggah tulisan tangan pertama Anda untuk melihat wawasan di sini.
                </p>
              </div>
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
    </div>
  );
}
