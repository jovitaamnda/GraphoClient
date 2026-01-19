"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadFoto from "@/components/homeanalisis/UploadFoto";
import HandwritingCanvas from "@/components/homeanalisis/HandwritingCanvas";
import HasilAnalisis from "@/components/homeanalisis/HasilAnalisis";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";
import LoadingModal from "@/components/modals/LoadingModal";
import { Upload, Sparkles, Check } from "lucide-react";
import { Lightbulb, Sun, Ruler, Smartphone, Camera, Pencil } from "lucide-react";
import { analysisApi } from "@/api";

export default function HomeAnalisis() {
  const router = useRouter();
  const [step, setStep] = useState("upload");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const steps = [
    { id: "upload", name: "Upload Tulisan", icon: Upload },
    { id: "hasil", name: "Hasil Analisis", icon: Sparkles },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const handleUploadComplete = async (imageData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call API - userId will be extracted from JWT token by backend
      const data = await analysisApi.uploadImage(imageData);
      setAnalysisResult(data.analysis);
      setStep("hasil");
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message);

      // Check if it's an authentication error
      if (err.message.includes("authorized") || err.message.includes("token")) {
        setShowLoginModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20 px-6 text-center shadow-lg pt-32">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">Analisis Tulisan Tangan AI</h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">Ungkap karakteristik kepribadian Anda melalui tulisan tangan dengan teknologi AI yang canggih untuk insight mendalam.</p>
      </section>

      {/* Progress Stepper */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-indigo-600 text-white shadow-lg scale-110" : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {isCompleted ? <Check className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                  </div>
                  <p className={`mt-3 text-sm font-medium transition-colors ${isActive ? "text-indigo-600" : "text-gray-500"}`}>{s.name}</p>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition-all duration-700 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />}
              </div>
            );
          })}
        </div>

        {/* Main Content Card - lebih lebar */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 md:p-20 transition-all duration-700 max-w-7xl mx-auto">
          {step === "upload" && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-center mb-16 text-indigo-700">Pilih Cara Input Tulisan Tangan</h2>

              {/* Grid dengan kotak lebih lebar */}
              <div className="grid md:grid-cols-2 gap-16 mb-20">
                <div className="w-full">
                  <UploadFoto onUploadComplete={handleUploadComplete} />
                </div>
                <div className="w-full">
                  <HandwritingCanvas onUploadComplete={handleUploadComplete} />
                </div>
              </div>

              {/* Tips Foto Tulisan Tangan */}
              <div className="mt-20 pt-10 border-t-2 border-indigo-200">
                <div className="flex items-center justify-center gap-3 mb-10">
                  <Lightbulb className="w-9 h-9 text-yellow-500" />
                  <h3 className="text-3xl font-bold text-indigo-700">Tips Foto Tulisan Tangan Terbaik untuk Analisis Akurat</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-16 mb-16">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-3xl p-8 shadow-xl">
                      <img src="https://qph.cf2.quoracdn.net/main-qimg-9566da9f8272b4ba9de140d702d87da8-pjlq" alt="Contoh BAIK: tulisan jelas, pencahayaan merata" className="rounded-2xl shadow-2xl mx-auto max-h-80 object-contain" />
                    </div>
                    <p className="mt-8 text-green-700 font-bold text-2xl">✅ Contoh BAIK</p>
                    <p className="text-lg text-gray-600">Jelas, rata, terang, tanpa bayangan</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-red-100 rounded-3xl p-8 shadow-xl">
                      <img
                        src="https://media.springernature.com/lw685/springer-static/image/art%3A10.1186%2Fs13640-018-0297-3/MediaObjects/13640_2018_297_Fig3_HTML.png"
                        alt="Contoh BURUK: buram, miring, gelap"
                        className="rounded-2xl shadow-2xl mx-auto max-h-80 object-contain"
                      />
                    </div>
                    <p className="mt-8 text-red-700 font-bold text-2xl">❌ Contoh BURUK</p>
                    <p className="text-lg text-gray-600">Buram, miring, gelap, ada bayangan</p>
                  </div>
                </div>

                <ul className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  <li className="flex items-start gap-5 bg-indigo-50 p-6 rounded-2xl">
                    <Sun className="w-10 h-10 text-yellow-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Pencahayaan terang & merata</strong>
                      <p className="text-gray-600 mt-1">Hindari bayangan atau cahaya langsung dari atas</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-indigo-50 p-6 rounded-2xl">
                    <Ruler className="w-10 h-10 text-indigo-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Letakkan kertas rata di meja</strong>
                      <p className="text-gray-600 mt-1">Foto dari atas tegak lurus, jangan miring</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-indigo-50 p-6 rounded-2xl">
                    <Smartphone className="w-10 h-10 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Tulis 3-5 baris kalimat lengkap</strong>
                      <p className="text-gray-600 mt-1">Gunakan pulpen hitam/biru, bukan pensil</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-indigo-50 p-6 rounded-2xl">
                    <Camera className="w-10 h-10 text-purple-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Pastikan tulisan jelas & tidak terpotong</strong>
                      <p className="text-gray-600 mt-1">Fokus tajam, tidak buram</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Tips Tulis Langsung */}
              <div className="mt-20 pt-10 border-t-2 border-purple-200">
                <div className="flex items-center justify-center gap-3 mb-10">
                  <Lightbulb className="w-9 h-9 text-yellow-500" />
                  <h3 className="text-3xl font-bold text-indigo-700">Tips Menulis Langsung di Layar (Tablet/HP)</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-16 mb-16 max-w-5xl mx-auto">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-3xl p-8 shadow-xl">
                      <img
                        src="https://images.pexels.com/photos/33342584/pexels-photo-33342584/free-photo-of-digital-planning-on-tablet-with-stylus-pen.jpeg"
                        alt="Dengan Stylus: natural & presisi"
                        className="rounded-2xl shadow-2xl mx-auto max-h-80 object-contain"
                      />
                    </div>
                    <p className="mt-8 text-green-700 font-bold text-2xl">✅ Dengan Stylus (Direkomendasikan)</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-blue-100 rounded-3xl p-8 shadow-xl">
                      <img
                        src="https://c8.alamy.com/comp/2R41732/digital-signature-on-smartphone-screen-with-woman-hand-a-close-up-of-a-person-writing-on-a-cell-phone-2R41732.jpg"
                        alt="Dengan Jari: tetap bisa"
                        className="rounded-2xl shadow-2xl mx-auto max-h-80 object-contain"
                      />
                    </div>
                    <p className="mt-8 text-blue-700 font-bold text-2xl">✅ Dengan Jari</p>
                  </div>
                </div>

                <ul className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  <li className="flex items-start gap-5 bg-purple-50 p-6 rounded-2xl">
                    <Pencil className="w-10 h-10 text-purple-600 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Tulis dengan ukuran & tekanan bervariasi</strong>
                      <p className="text-gray-600 mt-1">Seperti menulis biasa di kertas</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-purple-50 p-6 rounded-2xl">
                    <Ruler className="w-10 h-10 text-indigo-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Buat minimal 3-5 baris kalimat lengkap</strong>
                      <p className="text-gray-600 mt-1">Agar analisis lebih akurat</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-purple-50 p-6 rounded-2xl">
                    <Smartphone className="w-10 h-10 text-green-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Gunakan stylus jika ada</strong>
                      <p className="text-gray-600 mt-1">Hasil lebih natural dan presisi</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5 bg-purple-50 p-6 rounded-2xl">
                    <Sun className="w-10 h-10 text-yellow-500 flex-shrink-0" />
                    <div>
                      <strong className="text-lg">Pilih ukuran pena yang nyaman</strong>
                      <p className="text-gray-600 mt-1">Klik ikon pensil untuk mengatur</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === "hasil" && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-center mb-10 text-indigo-700">Hasil Analisis Lengkap</h2>
              <HasilAnalisis analysis={analysisResult} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      {/* Login Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Analysis Loading Modal */}
      <LoadingModal isOpen={isLoading} />
    </div>
  );
}
