"use client";

import { motion } from "framer-motion";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4] px-4 py-16 relative overflow-hidden">
      {/* ── 1. High-End Grain/Noise Texture Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── 2. Masterclass Aurora Glow Background (Mesh Gradient) ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Glow Orb 1 - Silk Dusty Rose */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#E8C5C8] blur-[120px] opacity-[0.65]"
        />

        {/* Glow Orb 2 - Creamy Warm Apricot */}
        <motion.div
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -60, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#F5D6C6] blur-[140px] opacity-80"
        />

        {/* Glow Orb 3 - Warm Sandstone */}
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, 60, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[25%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#D7BEB5] blur-[100px] opacity-60"
        />

        {/* Glow Orb 4 - Soft Honey Glow (Center Right) */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, -30, -50, 0],
            scale: [0.9, 1.05, 0.95, 0.9],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#EAA28A] blur-[110px] opacity-[0.35]"
        />
      </div>

      {/* Custom Styles for Autofill & Smooth Animation */}
      <style jsx global>{`
        /* Override Chrome Autofill Blue Background completely */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #221A13 !important;
          -webkit-box-shadow: 0 0 0px 1000px #FFFDFB inset !important;
          box-shadow: 0 0 0px 1000px #FFFDFB inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* ── 3. Content Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Luxury Brand Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-semibold font-serif tracking-[0.14em] text-[#854C4A] hover:opacity-90 transition-opacity">
              Grafologi
            </span>
          </Link>
          <div className="w-12 h-[2px] bg-[#854C4A]/30 mx-auto mt-4 mb-5 rounded-full" />
          <h1 className="text-4xl font-semibold font-serif text-[#221A13] tracking-tight">
            Selamat Datang
          </h1>
          <p className="mt-3 text-[#6E5B42]/90 text-base font-light">
            Masuk untuk melanjutkan perjalananmu
          </p>
        </div>

        {/* State-of-the-Art Glassmorphic Card */}
        <div className="bg-white/50 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_32px_64px_-16px_rgba(133,76,74,0.12)] border border-white/80 p-10 sm:p-12 relative overflow-hidden">
          {/* Subtle glossy light reflection overlay inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

          {/* Form */}
          <LoginForm />

          {/* Elegant Footnote / Register Link */}
          <div className="mt-10 pt-8 border-t border-[#DBC9C4]/40 text-center">
            <p className="text-sm text-[#6E5B42]">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-[#854C4A] hover:text-[#C17F7C] transition-colors relative inline-block group"
              >
                Daftar di sini
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#854C4A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
