"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function ImageUpload({
  userId,
  onComplete,
  onError,
  setLoading,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) {
      onError("Please select an image first");
      return;
    }

    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token
          },
          body: JSON.stringify({
            imageData: preview, // userId removed, backend gets it from token
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      onComplete(data.analysis);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="border-2 border-gray-300 rounded-2xl p-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 transition"
        >
          <Upload size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-semibold">Click to upload image</p>
          <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-3">
        {preview && (
          <button
            onClick={() => {
              setPreview(null);
              fileInputRef.current.value = "";
            }}
            className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-2xl transition"
          >
            Change Image
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full px-4 py-3 font-semibold rounded-2xl transition ${preview
              ? "bg-gray-100 text-gray-500 cursor-default"
              : "bg-purple-100 hover:bg-purple-200 text-purple-600"
            }`}
        >
          {preview ? "Image Selected" : "Select Image"}
        </button>

        <button
          onClick={handleAnalyze}
          disabled={!preview}
          className={`w-full px-4 py-3 font-semibold rounded-2xl transition ${preview
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Analyze Image
        </button>
      </div>
    </div>
  );
}
