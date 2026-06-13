"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, ArrowLeft } from "lucide-react";
import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4] px-4 py-12 relative overflow-hidden">
      {/* ── Beautiful Animated Blurred Aurora / Mesh Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Glow Orb 1 - Dusty Pink (Top Left) */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-[#E8C5C8] blur-[100px] opacity-60"
        />

        {/* Glow Orb 2 - Warm Apricot/Peach (Bottom Right) */}
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#F5D6C6] blur-[120px] opacity-75"
        />

        {/* Glow Orb 3 - Warm Sandstone (Center Left) */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -left-10 w-[350px] h-[350px] rounded-full bg-[#D7BEB5] blur-[90px] opacity-50"
        />
      </div>

      {/* ── Content Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Back Link */}
        <div className="mb-6 flex justify-start">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6E5B42] hover:text-[#854C4A] transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
        </div>

        {/* Logo and Headings */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-4xl font-bold font-serif tracking-[0.06em] text-[#854C4A]">
              Grafologi
            </span>
          </Link>
          <h1 className="text-4xl font-bold font-serif text-[#221A13] tracking-tight mt-4">
            Mulai Perjalananmu
          </h1>
          <p className="mt-3 text-[#6E5B42] text-sm">
            Buat akun untuk memulai analisis tulisan tangan pertamamu
          </p>
        </div>

        {/* Premium Glassmorphic Card - Unified Size */}
        <div className="bg-white/45 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 p-10 sm:p-12">
          <h2 className="text-xl font-medium text-[#221A13] mb-6 text-center">
            Buat Akun Baru
          </h2>

          {/* Form */}
          <RegisterForm />

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-[#6E5B42]">
            Sudah memiliki akun?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#854C4A] hover:text-[#C17F7C] transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
