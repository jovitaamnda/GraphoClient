"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginRequiredModal({ isOpen, onClose }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(34,26,19,0.25)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-[#FDFAF8] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent border */}
            <div className="h-1 w-full bg-[#854C4A]" />

            <div className="flex flex-col items-center text-center px-10 py-10">
              {/* Lock icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#F8E3DC] flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-[#854C4A]" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[#221A13] mb-3">
                Login Diperlukan
              </h3>

              {/* Description */}
              <p className="text-[#524342] text-sm leading-relaxed mb-8">
                Silakan masuk atau daftar untuk mengakses fitur ini dan menyimpan
                hasil analisis Anda secara permanen di profil Anda.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => {
                  onClose();
                  router.push("/auth/login");
                }}
                className="w-full py-3.5 rounded-xl bg-[#854C4A] text-white font-semibold text-sm tracking-wide shadow-md hover:bg-[#6B3A38] active:scale-[0.98] transition-all duration-200"
              >
                Masuk Sekarang
              </button>

              {/* Dismiss */}
              <button
                onClick={onClose}
                className="mt-4 text-sm text-[#6E5B42] hover:text-[#854C4A] transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
