"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { analysisApi } from "@/api";
import { PenLine, ChevronRight, FileText } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [recentHistory, setRecentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Redirect kalau belum login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Ambil riwayat analisis terbaru
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const data = await analysisApi.getHistory(user.id, 1, 3);
        const items = data?.analyses || data?.data || data || [];
        setRecentHistory(Array.isArray(items) ? items.slice(0, 3) : []);
      } catch {
        setRecentHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#854C4A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6E5B42]">Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] || "Pengguna";

  return (
    <main className="min-h-screen bg-[#FFF8F4] text-[#221A13] pt-28 pb-16">
      <div className="mx-auto max-w-full w-full px-8">
        <div className="space-y-12">

          {/* ── Heading ── */}
          <div className="max-w-5xl">
            <h1 className="text-6xl font-semibold tracking-tight leading-[1.1] text-[#221A13]">
              Selamat Datang, <span className="text-[#854C4A] font-bold">{firstName}</span>
            </h1>
            <p className="mt-4 max-w-3xl text-xl leading-relaxed text-[#524342]">
              Mulai perjalanan mengenal dirimu melalui analisis tulisan tangan dan kepribadian.
            </p>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid gap-8 xl:grid-cols-[1.55fr_0.95fr] items-stretch">

            {/* ── Kartu Kiri — Mulai Analisis ── */}
            <div className="rounded-[2rem] bg-[#854C4A] shadow-[0_28px_68px_rgba(133,76,74,0.18)] overflow-hidden border border-[#DBC9C4] min-h-[540px]">
              <div className="grid min-h-full md:grid-cols-[1fr_1.1fr]">
                {/* Teks */}
                <div className="p-14 lg:p-20 flex flex-col justify-between">
                  <div>
                    <p className="text-[0.75rem] uppercase tracking-[0.42em] text-[#F8E3DC]/90 font-medium">
                      Kenali dirimu lebih dalam
                    </p>
                    <h2 className="mt-10 text-3xl font-semibold leading-snug text-white sm:text-[2.5rem]">
                      Lengkapi profilmu dengan grafologi &amp; tes Enneagram untuk memahami
                      motivasi dan kecenderungan kepribadianmu.
                    </h2>
                  </div>
                  <div>
                    <button
                      onClick={() => router.push("/user/analysis")}
                      className="mt-12 inline-flex items-center justify-center rounded-xl bg-[#FFF8F4] px-10 py-3.5 text-sm font-semibold text-[#854C4A] shadow-lg transition hover:bg-white hover:shadow-xl active:scale-95"
                    >
                      Mulai Tes
                    </button>
                  </div>
                </div>

                {/* Gambar */}
                <div className="relative overflow-hidden bg-[#4F3633]">
                  <img
                    src="/graf.png"
                    alt="Ilustrasi grafologi"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#854C4A]/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* ── Kartu Kanan — Aktivitas Terbaru ── */}
            <div className="rounded-[2rem] border border-[#DBC9C4] bg-white p-8 shadow-sm flex flex-col h-full justify-between min-h-[540px]">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-[0.75rem] uppercase tracking-[0.42em] text-[#6E5B42] font-medium">
                    Aktivitas Terbaru
                  </p>
                  <button
                    onClick={() => router.push("/user/analysis")}
                    className="text-sm font-semibold text-[#854C4A] transition hover:text-[#C17F7C]"
                  >
                    Lihat Semua
                  </button>
                </div>

                {historyLoading ? (
                  <div className="flex flex-col gap-3 mt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-[#FFF8F4] rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : recentHistory.length === 0 ? (
                  <div className="mt-6">
                    <p className="text-sm leading-relaxed text-[#524342]">
                      Mulai unggah tulisan tangan untuk melihat riwayat aktivitasmu di sini.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {recentHistory.map((item, i) => (
                      <li key={item._id || item.id || i}>
                        <button
                          onClick={() => router.push(`/user/analysis`)}
                          className="w-full flex items-center gap-4 rounded-2xl border border-[#F0E6E0] bg-[#FFF8F4] px-5 py-4 text-left transition hover:border-[#DBC9C4] hover:shadow-sm group"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#854C4A]/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#854C4A]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#221A13] truncate">
                              {item.dominantTrait || item.personality_type || `Analisis #${i + 1}`}
                            </p>
                            <p className="mt-0.5 text-xs text-[#6E5B42]">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "long", year: "numeric",
                                  })
                                : "Baru-baru ini"}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C17F7C] opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>

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
    </main>
  );
}
