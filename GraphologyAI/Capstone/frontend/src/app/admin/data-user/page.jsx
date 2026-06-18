"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Mail, Clock, Trash2, Users } from "lucide-react";
import { adminApi } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/* ─── Color & Palette Helpers ────────────────────────── */
const TYPE_COLORS = {
  rosewood: "#C17F7C",
  amber: "#D4956A",
  goldenSand: "#C8A87A",
  sageGreen: "#8FAD88",
  steelBlue: "#7A9EAD",
  primaryBrand: "#854C4A",
};

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

export default function DataUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [clock, setClock] = useState("");
  const { user } = useAuth();
  const router = useRouter();

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(page, 10, searchTerm);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Fetch ALL users (limit: 0)
      const data = await adminApi.getUsers(1, 0, searchTerm);
      const allUsers = data.users || [];

      // Build CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "No,Nama Lengkap,Email,Gender,Umur,Role,Tanggal Join\n";

      allUsers.forEach((u, index) => {
        const date = new Date(u.createdAt).toLocaleDateString("id-ID");
        const age = u.profile?.age || "-";
        const gender = u.profile?.gender || "-";
        csvContent += `${index + 1},"${u.name}","${u.email}","${gender}","${age}",${u.role},${date}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `GraphologyAI_Users_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Gagal mengunduh data.");
    }
  };

  const handleDelete = async (userId) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;

    try {
      setDeleteLoading(userId);
      await adminApi.deleteUser(userId);
      fetchUsers(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus pengguna");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  const up = (i) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  });

  return (
    <div className="space-y-6 min-h-[85vh]">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div {...up(0)} className="flex items-end justify-between border-b border-[#EDE0D8] pb-6">
        <div>
          <h1 className="text-5xl font-semibold font-serif text-[#221A13] tracking-tight">Data User</h1>
          <p className="mt-2 text-lg text-[#6E5B42]">
            Mengelola dan memantau seluruh akun pengguna terdaftar di <span className="font-semibold text-[#854C4A]">GraphologyAI</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#854C4A] hover:text-[#C17F7C] bg-white border border-[#EDE0D8] rounded-xl px-4 py-2.5 shadow-sm transition active:scale-95 hover:bg-[#FFF3ED]"
          >
            Refresh Data
          </button>
          <span className="hidden md:flex items-center gap-1.5 text-sm text-[#B8A89E] bg-white border border-[#EDE0D8] rounded-xl px-4 py-2.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            {clock}
          </span>
        </div>
      </motion.div>

      {/* ── Row 1 — Search & Export Actions ────────────────── */}
      <motion.div
        {...up(1)}
        className="bg-white rounded-2xl border border-[#EDE0D8] shadow-sm p-5"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#B8A89E]" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#EDE0D8] text-[#221A13] placeholder-[#B8A89E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#854C4A] focus:border-transparent transition-all shadow-inner text-sm font-medium"
            />
          </div>
          {/* Export Action */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-6 py-3 bg-[#854C4A] text-white rounded-xl font-bold text-sm hover:bg-[#C17F7C] transition flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-98"
            >
              <Download className="w-4 h-4" /> Export Data (CSV)
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Row 2 — User List Table ────────────────────────── */}
      <motion.div
        {...up(2)}
        className="bg-white rounded-2xl border border-[#EDE0D8] shadow-sm overflow-hidden"
      >
        {/* Table Title and Summary Pill */}
        <div className="px-8 py-5 border-b border-[#EDE0D8] flex justify-between items-center bg-[#FFF8F4]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8E3DC] flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-[#854C4A]" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#221A13]">Daftar Pengguna</h2>
          </div>
          <span className="text-xs font-bold text-[#854C4A] bg-[#FFF3ED] border border-[#F5E6DE] rounded-full px-3.5 py-1.5 shadow-sm">
            {totalUsers} Total Pengguna
          </span>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#FFF8F4]/40 border-b border-[#EDE0D8]">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-[#6E5B42] uppercase tracking-wider">User Profile</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-[#6E5B42] uppercase tracking-wider">Contact</th>
                <th className="px-8 py-4 text-center text-xs font-bold text-[#6E5B42] uppercase tracking-wider">Joined Date</th>
                <th className="px-8 py-4 text-center text-xs font-bold text-[#6E5B42] uppercase tracking-wider">Role</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-[#6E5B42] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D8]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-[#6E5B42]">
                    <div className="flex justify-center flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#854C4A] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-semibold">Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-[#B8A89E] font-medium text-sm">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian Anda.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {users.map((u, i) => {
                    const avatar = getAvatarStyle(u.name);
                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-[#FFF8F4]/20 transition-colors group"
                      >
                        {/* User Profile */}
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-4">
                            {/* Colorful Styled Avatar */}
                            <div className={`w-10 h-10 ${avatar.bg} ${avatar.text} rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition hover:scale-105 shrink-0`}>
                              {u.name ? u.name.trim().charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-[#221A13] group-hover:text-[#854C4A] transition-colors text-sm">{u.name}</p>
                              <p className="text-[11px] text-[#B8A89E] font-medium mt-0.5">ID: {u._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-2 text-[#6E5B42] text-sm font-medium">
                            <Mail className="w-4 h-4 text-[#B8A89E]" />
                            {u.email}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-8 py-4.5 text-center text-sm text-[#6E5B42] font-semibold">
                          {new Date(u.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Role */}
                        <td className="px-8 py-4.5 text-center">
                          {u.role === "admin" ? (
                            <span className="px-3.5 py-1 bg-[#854C4A]/10 text-[#854C4A] rounded-full text-xs font-extrabold uppercase tracking-widest border border-[#854C4A]/20 shadow-sm">
                              {u.role}
                            </span>
                          ) : (
                            <span className="px-3.5 py-1 bg-[#FFF3ED] text-[#D4956A] rounded-full text-xs font-extrabold uppercase tracking-widest border border-[#F5E6DE] shadow-sm">
                              {u.role}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-4.5 text-right">
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={deleteLoading === u._id || u.role === "admin"}
                            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                              u.role === "admin"
                                ? "opacity-25 cursor-not-allowed text-[#B8A89E]"
                                : "text-[#B8A89E] hover:text-[#854C4A] hover:bg-[#FFF3ED]"
                            }`}
                            title="Hapus Pengguna"
                          >
                            {deleteLoading === u._id ? (
                              <div className="w-5 h-5 border-2 border-[#854C4A] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4.5 h-4.5" />
                            )}
                          </button>
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
        <div className="px-8 py-5 border-t border-[#EDE0D8] flex justify-between items-center bg-[#FFF8F4]/30">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2.5 bg-white border border-[#EDE0D8] text-[#6E5B42] font-semibold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF3ED] transition active:scale-95 shadow-sm"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-bold text-[#6E5B42]">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2.5 bg-white border border-[#EDE0D8] text-[#6E5B42] font-semibold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF3ED] transition active:scale-95 shadow-sm"
          >
            Selanjutnya
          </button>
        </div>
      </motion.div>
    </div>
  );
}