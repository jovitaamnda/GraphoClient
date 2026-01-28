"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Add AnimatePresence
import { Trash2, Search, AlertCircle, FileText, Calendar, CheckCircle, XCircle } from "lucide-react"; // More icons
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/api";
import Swal from 'sweetalert2';

export default function DataAnalisisPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [analyses, setAnalyses] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // Protected Route Check
    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push(user ? "/dashboard" : "/auth/login");
        }
    }, [user, loading, router]);

    const fetchAnalyses = async () => {
        try {
            setLoadingData(true);
            // Assuming new API endpoint supports search, otherwise we filter client-side or ignore search for now
            const res = await adminApi.getAllAnalyses(page, 20); // Limit 20
            setAnalyses(res.analyses);
            setTotalPages(res.pages);
            setLoadingData(false);
        } catch (error) {
            console.error("Failed to fetch analyses:", error);
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchAnalyses();
        }
    }, [user, page]); // Refetch on page change

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data analisis yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await adminApi.deleteAnalysis(id);

                // Remove from local state
                setAnalyses(prev => prev.filter(item => item._id !== id));

                Swal.fire(
                    'Terhapus!',
                    'Data analisis telah dihapus.',
                    'success'
                );
            } catch (error) {
                Swal.fire(
                    'Gagal!',
                    'Terjadi kesalahan saat menghapus data.',
                    'error'
                );
            }
        }
    };

    // Filter logic (Client side simple filter if API doesn't support it yet)
    const filteredAnalyses = analyses.filter(item =>
        item.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.enneagramType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || user.role !== "admin") return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between text-gray-800 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                            Data Analisis
                        </h1>
                        <p className="text-gray-500 mt-1">Kelola seluruh riwayat analisis pengguna</p>
                    </div>
                    {/* Search Bar */}
                    <div className="mt-4 md:mt-0 relative">
                        <input
                            type="text"
                            placeholder="Cari user atau tipe..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                {/* Table Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-8 py-5">User</th>
                                    <th className="px-8 py-5">Tipe Hasil</th>
                                    <th className="px-8 py-5 text-center">Confidence</th>
                                    <th className="px-8 py-5 text-center">Tanggal</th>
                                    <th className="px-8 py-5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {filteredAnalyses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <AlertCircle className="w-10 h-10 text-gray-300" />
                                                    <p>Tidak ada data analisis ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAnalyses.map((item) => (
                                            <motion.tr
                                                key={item._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="hover:bg-indigo-50/30 transition-colors group"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {item.userId?.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{item.userId?.name || "Unknown"}</p>
                                                            <p className="text-xs text-gray-500">{item.userId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-800">{item.enneagramType || "-"}</span>
                                                        <span className="text-xs text-gray-500">{item.personalityType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${(item.confidence || 0) > 80 ? "bg-green-100 text-green-700" :
                                                            (item.confidence || 0) > 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {Math.round(item.confidence || 0)}%
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center text-gray-500 text-sm">
                                                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all tooltip"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
