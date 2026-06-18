"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Search, AlertCircle, FileText, Clock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/api";
import Swal from 'sweetalert2';

/* ─── Color & Palette Helpers ────────────────────────── */
const getAvatarStyle = (name) => {
  const char = name ? name.trim().charAt(0).toUpperCase() : "U";
  const code = char.charCodeAt(0) % 5;
  const palettes = [
    { bg: "bg-[#F8E3DC]", text: "text-[#C17F7C]" },
    { bg: "bg-[#FFF3ED]", text: "text-[#D4956A]" },
    { bg: "bg-[#FFF8F4]", text: "text-[#C8A87A]" },
    { bg: "bg-[#F1F6F0]", text: "text-[#8FAD88]" },
    { bg: "bg-[#F0F5F8]", text: "text-[#7A9EAD]" },
  ];
  return palettes[code] || { bg: "bg-[#F8E3DC]", text: "text-[#854C4A]" };
};

const ENNEAGRAM_OPTIONS = [
  "Tipe 1", "Tipe 2", "Tipe 3", "Tipe 4", "Tipe 5", "Tipe 6", "Tipe 7", "Tipe 8", "Tipe 9"
];

export default function DataAnalisisPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [clock, setClock] = useState("");

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [editEnneagram, setEditEnneagram] = useState("Tipe 1");
  const [editConfidence, setEditConfidence] = useState(80);
  const [isSaving, setIsSaving] = useState(false);

  // Clock tick
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }) +
          " · " +
          d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Protected Route Check
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push(user ? "/dashboard" : "/auth/login");
    }
  }, [user, loading, router]);

  const fetchAnalyses = async () => {
    try {
      setLoadingData(true);
      const res = await adminApi.getAllAnalyses(page, 15); // Limit 15
      setAnalyses(res.analyses || []);
      setTotalPages(res.pages || 1);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnalyses();
    }
  }, [user, page]);

  // Debounce search filter
  const filteredAnalyses = analyses.filter(item =>
    item.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enneagramType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.personalityType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data analisis yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#854C4A',
      cancelButtonColor: '#B8A89E',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      background: '#FFF8F4',
      color: '#221A13',
    });

    if (result.isConfirmed) {
      try {
        await adminApi.deleteAnalysis(id);
        setAnalyses(prev => prev.filter(item => item._id !== id));
        
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data analisis telah berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#854C4A',
          background: '#FFF8F4',
          color: '#221A13',
        });
      } catch (error) {
        Swal.fire({
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus data.',
          icon: 'error',
          confirmButtonColor: '#854C4A',
          background: '#FFF8F4',
          color: '#221A13',
        });
      }
    }
  };

  const openEditModal = (item) => {
    setEditingAnalysis(item);
    setEditEnneagram(item.enneagramType || "Tipe 1");
    setEditConfidence(Math.round(item.confidence || 80));
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingAnalysis) return;

    try {
      setIsSaving(true);
      const res = await adminApi.updateAnalysis(editingAnalysis._id, {
        enneagramType: editEnneagram,
        confidence: editConfidence
      });

      // Update local state directly so UI responds instantly
      setAnalyses(prev => prev.map(item => {
        if (item._id === editingAnalysis._id) {
          return {
            ...item,
            enneagramType: res.data.analysis.enneagramType,
            personalityType: res.data.analysis.personalityType,
            confidence: res.data.analysis.confidence,
          };
        }
        return item;
      }));

      setIsEditModalOpen(false);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data analisis berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#854C4A',
        background: '#FFF8F4',
        color: '#221A13',
      });
    } catch (error) {
      console.error("Failed to update analysis:", error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memperbarui data analisis.',
        icon: 'error',
        confirmButtonColor: '#854C4A',
        background: '#FFF8F4',
        color: '#221A13',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center flex-col items-center gap-4 min-h-[70vh]">
        <div className="w-12 h-12 border-3 border-[#854C4A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-base font-semibold text-[#6E5B42]">Memuat data analisis...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const up = (i) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  });

  return (
    <div className="space-y-8 min-h-[85vh]">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div {...up(0)} className="flex items-end justify-between border-b border-[#EDE0D8] pb-8">
        <div>
          <h1 className="text-6xl font-bold font-serif text-[#221A13] tracking-tight">Data Analisis</h1>
          <p className="mt-3 text-xl text-[#6E5B42]">
            Mengelola dan memantau seluruh riwayat hasil analisis pengguna di <span className="font-semibold text-[#854C4A]">GraphologyAI</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAnalyses}
            className="flex items-center gap-2 text-base font-semibold text-[#854C4A] hover:text-[#C17F7C] bg-white border border-[#EDE0D8] rounded-xl px-5 py-3 shadow-sm transition active:scale-95 hover:bg-[#FFF3ED]"
          >
            Refresh Data
          </button>
          <span className="hidden md:flex items-center gap-2 text-base text-[#B8A89E] bg-white border border-[#EDE0D8] rounded-xl px-5 py-3 shadow-sm">
            <Clock className="w-4 h-4" />
            {clock}
          </span>
        </div>
      </motion.div>

      {/* ── Row 1 — Search Bar ─────────────────────────────── */}
      <motion.div
        {...up(1)}
        className="bg-white rounded-3xl border border-[#EDE0D8] shadow-sm p-6"
      >
        <div className="relative w-full sm:w-[480px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5.5 h-5.5 text-[#B8A89E]" />
          <input
            type="text"
            placeholder="Cari nama user atau tipe enneagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-13 pr-4 py-4 bg-white border border-[#EDE0D8] text-[#221A13] placeholder-[#B8A89E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#854C4A] focus:border-transparent transition-all shadow-inner text-base font-medium"
          />
        </div>
      </motion.div>

      {/* ── Row 2 — Analysis History Table ─────────────────── */}
      <motion.div
        {...up(2)}
        className="bg-white rounded-3xl border border-[#EDE0D8] shadow-sm overflow-hidden"
      >
        {/* Table Title and Summary Pill */}
        <div className="px-8 py-6 border-b border-[#EDE0D8] flex justify-between items-center bg-[#FFF8F4]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F8E3DC] flex items-center justify-center shrink-0">
              <FileText className="w-5.5 h-5.5 text-[#854C4A]" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#221A13]">Daftar Riwayat Analisis</h2>
          </div>
          <span className="text-sm font-bold text-[#854C4A] bg-[#FFF3ED] border border-[#F5E6DE] rounded-full px-4 py-2 shadow-sm">
            {filteredAnalyses.length} Data Ditampilkan
          </span>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#FFF8F4]/40 border-b border-[#EDE0D8]">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-bold text-[#6E5B42] uppercase tracking-wider">User</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-[#6E5B42] uppercase tracking-wider">Hasil Tipe</th>
                <th className="px-8 py-5 text-center text-sm font-bold text-[#6E5B42] uppercase tracking-wider">Confidence</th>
                <th className="px-8 py-5 text-center text-sm font-bold text-[#6E5B42] uppercase tracking-wider">Tanggal Analisis</th>
                <th className="px-8 py-5 text-right text-sm font-bold text-[#6E5B42] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D8]">
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-[#B8A89E] font-medium text-base">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-11 h-11 text-[#C17F7C] opacity-60" />
                      <p>Tidak ada riwayat analisis yang cocok dengan pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredAnalyses.map((item) => {
                    const avatar = getAvatarStyle(item.userId?.name);
                    const confidence = item.confidence || 0;
                    
                    // Styled dynamic badge for confidence
                    let confidenceBadgeClass = "";
                    if (confidence > 80) {
                      confidenceBadgeClass = "bg-[#F1F6F0] text-[#8FAD88] border-[#E2EFE0]";
                    } else if (confidence > 50) {
                      confidenceBadgeClass = "bg-[#FFF3ED] text-[#D4956A] border-[#F5E6DE]";
                    } else {
                      confidenceBadgeClass = "bg-[#F8E3DC] text-[#C17F7C] border-[#F2D7CE]";
                    }

                    return (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-[#FFF8F4]/20 transition-colors group"
                      >
                        {/* User Column */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 ${avatar.bg} ${avatar.text} rounded-full flex items-center justify-center font-bold text-base shadow-sm transition hover:scale-105 shrink-0`}>
                              {item.userId?.name ? item.userId.name.trim().charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-[#221A13] group-hover:text-[#854C4A] transition-colors text-base">{item.userId?.name || "Unknown"}</p>
                              <p className="text-xs text-[#B8A89E] font-semibold mt-1">{item.userId?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Hasil Tipe Column */}
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#221A13] text-base">{item.enneagramType || "-"}</span>
                            <span className="text-xs text-[#6E5B42] font-semibold mt-1">{item.personalityType || "-"}</span>
                          </div>
                        </td>

                        {/* Confidence Level Column */}
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-wider border shadow-sm ${confidenceBadgeClass}`}>
                            {Math.round(confidence)}%
                          </span>
                        </td>

                        {/* Tanggal Column */}
                        <td className="px-8 py-6 text-center text-base text-[#6E5B42] font-semibold">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions Column */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 text-[#B8A89E] hover:text-[#854C4A] hover:bg-[#FFF3ED]"
                              title="Edit Data Hasil"
                            >
                              <Edit3 className="w-5.5 h-5.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 text-[#B8A89E] hover:text-red-500 hover:bg-[#FFF3ED]"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-5.5 h-5.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-[#EDE0D8] flex justify-between items-center bg-[#FFF8F4]/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-3 bg-white border border-[#EDE0D8] text-[#6E5B42] font-semibold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF3ED] transition active:scale-95 shadow-sm"
            >
              Sebelumnya
            </button>
            <span className="text-sm font-bold text-[#6E5B42]">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-5 py-3 bg-white border border-[#EDE0D8] text-[#6E5B42] font-semibold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF3ED] transition active:scale-95 shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Edit Modal Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-[#FDFAF8] border border-[#EDE0D8] rounded-3xl w-full max-w-xl p-8 shadow-2xl relative overflow-hidden z-10"
            >
              <div className="flex justify-between items-center pb-5 border-b border-[#EDE0D8]">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#221A13]">Edit Hasil Analisis</h3>
                  <p className="text-sm text-[#6E5B42] mt-1 font-semibold">User: {editingAnalysis?.userId?.name}</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-[#EDE0D8]/40 text-[#6E5B42] transition-colors"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="mt-6 space-y-6">
                {/* Enneagram Dropdown Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6E5B42]">Tipe Enneagram</label>
                  <select
                    value={editEnneagram}
                    onChange={(e) => setEditEnneagram(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-[#EDE0D8] text-[#221A13] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#854C4A] focus:border-transparent transition-all shadow-inner text-base font-bold"
                  >
                    {ENNEAGRAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Confidence Level Slider & Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6E5B42]">Tingkat Confidence (%)</label>
                    <span className="text-lg font-extrabold text-[#854C4A]">{editConfidence}%</span>
                  </div>
                  
                  <div className="flex gap-5 items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editConfidence}
                      onChange={(e) => setEditConfidence(parseInt(e.target.value))}
                      className="flex-1 accent-[#854C4A] h-2 bg-[#EDE0D8] rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editConfidence}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                        setEditConfidence(val);
                      }}
                      className="w-20 px-3 py-2 text-center bg-white border border-[#EDE0D8] text-[#221A13] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#854C4A] text-sm font-bold shadow-inner"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-5 border-t border-[#EDE0D8] mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-5 py-4 bg-white border border-[#EDE0D8] text-[#6E5B42] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#FFF3ED] transition active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-5 py-4 bg-[#854C4A] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C17F7C] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
