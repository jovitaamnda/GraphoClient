"use client";

import { useState } from "react";
import { Camera, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { IMAGE_CONFIG, ERROR_MESSAGES } from "@/config/constants";

export default function UploadFoto({ onUploadComplete, onUploadReady }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (uploadedFile) => {
    if (!uploadedFile) return false;

    if (!uploadedFile.type.startsWith("image/")) {
      setError(ERROR_MESSAGES.fileInvalid);
      return false;
    }

    if (uploadedFile.size > IMAGE_CONFIG.maxSizeBytes) {
      setError(ERROR_MESSAGES.fileTooLarge);
      return false;
    }

    return true;
  };

  const resizeImage = (uploadedFile) => {
    if (!validateFile(uploadedFile)) return;

    setError("");
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > IMAGE_CONFIG.maxWidth) {
              height *= IMAGE_CONFIG.maxWidth / width;
              width = IMAGE_CONFIG.maxWidth;
            }
          } else {
            if (height > IMAGE_CONFIG.maxHeight) {
              width *= IMAGE_CONFIG.maxHeight / height;
              height = IMAGE_CONFIG.maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const resizedDataUrl = canvas.toDataURL("image/jpeg", IMAGE_CONFIG.quality);
          setFile(resizedDataUrl);
          setPreview(resizedDataUrl);
          if (uploadedFile?.name && typeof onUploadReady === "function") {
            onUploadReady(resizedDataUrl, uploadedFile.name);
          }
          setIsLoading(false);
        } catch (err) {
          setError(ERROR_MESSAGES.imageProcessFailed);
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        setError(ERROR_MESSAGES.imageProcessFailed);
        setIsLoading(false);
      };
      img.src = event.target.result;
    };

    reader.onerror = () => {
      setError(ERROR_MESSAGES.imageProcessFailed);
      setIsLoading(false);
    };

    reader.readAsDataURL(uploadedFile);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      resizeImage(uploadedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const uploadedFile = e.dataTransfer.files?.[0];
    if (uploadedFile) {
      resizeImage(uploadedFile);
    }
  };

  const handleSubmit = () => {
    if (file) onUploadComplete(file);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 w-full">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`relative w-full border border-dashed rounded-[2rem] transition-all duration-300 cursor-pointer flex items-center justify-center p-12 min-h-[360px] bg-white
          ${dragActive ? "border-[#854C4A] bg-[#FFF7F2]" : "border-[#E7D7D1] hover:border-[#854C4A] hover:bg-[#FFF7F2]"}`}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isLoading} />

        <div className="flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#854C4A] mx-auto" />
              <p className="text-[#854C4A] font-semibold text-sm">Memproses gambar...</p>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-sm border border-[#E7D7D1] max-h-52 max-w-xs mx-auto">
                <img src={preview} alt="Preview" className="object-contain max-h-48 bg-gray-50" />
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-[1.25rem] p-2 shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-sm text-green-700 font-semibold">Siap dianalisis ✓</p>
                <p className="text-xs text-[#6E5B42] mt-1">Gunakan tombol di bawah untuk memulai</p>
              </div>
            </div>
          ) : (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F8F0EC] border border-[#E7D7D1] text-[#854C4A] shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#221A13]">Unggah Tulisan Tangan</h2>
                  <p className="mt-3 text-sm text-[#6E5B42]">
                    Format yang didukung: JPG, PNG, PDF hingga 10MB
                  </p>
                </div>
              </div>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center">
        {!preview ? (
          <div className="relative">
            <input type="file" id="file-btn" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
            <label
              htmlFor="file-btn"
              className="inline-flex items-center justify-center rounded-[1.75rem] bg-[#854C4A] px-10 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#6B3A38] active:scale-95 cursor-pointer"
            >
              Pilih File
            </label>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-xl bg-[#854C4A] px-12 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#6B3A38] active:scale-95"
          >
            Mulai Analisis
          </button>
        )}
      </div>
    </div>
  );
}
