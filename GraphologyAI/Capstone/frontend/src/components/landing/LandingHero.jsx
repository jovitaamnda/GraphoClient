"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";

export default function LandingHero() {
  const router = useRouter();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleMulaiTes = () => {
    if (user) {
      router.push("/user/analysis");
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <section className="relative bg-[#FFF8F4] text-[#221A13]">
        <div className="mx-auto max-w-full w-full px-8 pb-20 pt-6">
          <div className="space-y-12">
            <div className="max-w-5xl">
              <h1 className="text-6xl font-semibold tracking-tight leading-[1.1]">Selamat Datang,</h1>
              <p className="mt-6 text-2xl leading-relaxed text-[#524342]">Mulai perjalanan mengenal dirimu melalui analisis tulisan tangan dan kepribadian.</p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.55fr_0.95fr]">
              <div className="rounded-[2rem] bg-[#854C4A] shadow-[0_28px_68px_rgba(133,76,74,0.18)] overflow-hidden border border-[#DBC9C4] min-h-[580px]">
                <div className="grid min-h-full md:grid-cols-[1fr_1.1fr]">
                  <div className="p-14 lg:p-20 flex flex-col justify-between">
                    <div>
                      <p className="text-[0.75rem] uppercase tracking-[0.42em] text-[#F8E3DC]/90 font-medium">Kenali dirimu lebih dalam</p>
                      <h2 className="mt-10 text-3xl font-semibold leading-snug text-white sm:text-[2.75rem]">Lengkapi profilmu dengan grafologi &amp; tes Enneagram untuk memahami motivasi dan kecenderungan kepribadianmu.</h2>
                    </div>
                    <button
                      onClick={handleMulaiTes}
                      className="mt-12 inline-flex items-center justify-center rounded-full bg-[#C17F7C] px-12 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#C17F7C]/30 transition hover:bg-[#FEB4B0] active:scale-95"
                    >
                      Mulai Tes
                    </button>
                  </div>
                  <div className="relative overflow-hidden bg-[#4F3633]">
                    <img
                      src="/graf.jpeg"
                      alt="Illustrasi grafologi"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#854C4A]/70 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#DBC9C4] bg-white p-10 shadow-sm min-h-[580px]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.42em] text-[#6E5B42] font-medium">Aktivitas Terbaru</p>
                  <button onClick={() => setShowLoginModal(true)} className="text-sm font-semibold text-[#854C4A] transition hover:text-[#C17F7C]">
                    Lihat Semua
                  </button>
                </div>
                <p className="mt-6 text-base leading-relaxed text-[#524342]">Mulai unggah tulisan tangan untuk melihat riwayat aktivitasmu di sini.</p>
                <div className="mt-10 rounded-[1.5rem] border border-[#F8E3DC] bg-[#FFF8F4] px-5 py-6 shadow-sm">
                  <p className="text-base font-semibold text-[#221A13]">Belum ada aktivitas</p>
                  <p className="mt-2 text-sm text-[#6E5B42]">Unggah tulisan tanganmu dan dapatkan laporan pertamamu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
