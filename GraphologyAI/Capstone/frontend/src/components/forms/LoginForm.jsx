"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email.trim()) { setError("Email tidak boleh kosong"); return false; }
    if (!email.includes("@")) { setError("Format email tidak valid"); return false; }
    if (!password) { setError("Password tidak boleh kosong"); return false; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);

    try {
      const loginResponse = await authApi.login(email, password);

      if (loginResponse.success) {
        try {
          const userProfile = await authApi.getProfile();

          const userDataToSave = {
            id: userProfile._id || userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role || "user",
            photo: userProfile.photo,
          };

          login(userDataToSave);
          localStorage.setItem("userData", JSON.stringify(userDataToSave));

          if (userProfile.role === "admin") {
            document.cookie = "admin_access=true; path=/";
            router.push("/admin");
          } else {
            router.push("/user/dashboard");
          }
        } catch (profileError) {
          throw new Error("Gagal mengambil data profil user.");
        }
      } else {
        throw new Error(loginResponse.message || "Login gagal.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-4 bg-[#FDF2F2] border border-[#F5C5C5] rounded-2xl text-[#C81E1E]">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2 text-left">
        <label className="block text-sm font-semibold text-[#6E5B42] ml-1">Email</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C17F7C] group-focus-within:text-[#854C4A] transition-colors" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            className="w-full pl-12 pr-4 py-4 bg-[#FFFDFB] border border-[#DBC9C4] rounded-2xl text-[#221A13] placeholder-[#B8A89E] text-base focus:outline-none focus:ring-2 focus:ring-[#854C4A]/20 focus:border-[#854C4A] shadow-sm transition-all duration-300"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2 text-left">
        <label className="block text-sm font-semibold text-[#6E5B42] ml-1">Password</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C17F7C] group-focus-within:text-[#854C4A] transition-colors" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 6 karakter"
            autoComplete="current-password"
            className="w-full pl-12 pr-12 py-4 bg-[#FFFDFB] border border-[#DBC9C4] rounded-2xl text-[#221A13] placeholder-[#B8A89E] text-base focus:outline-none focus:ring-2 focus:ring-[#854C4A]/20 focus:border-[#854C4A] shadow-sm transition-all duration-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8A89E] hover:text-[#854C4A] transition-colors p-1 rounded-full"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between text-base">
        <label className="flex items-center gap-2.5 text-[#6E5B42] cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded border-[#DBC9C4] text-[#854C4A] cursor-pointer accent-[#854C4A]"
          />
          Ingat saya
        </label>
        <a
          href="/forgot-password"
          className="text-[#854C4A] hover:text-[#C17F7C] transition-colors font-semibold relative inline-block group"
        >
          Lupa password?
          <span className="absolute bottom-0 left-0 w-full h-[1.2px] bg-[#854C4A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4.5 bg-[#854C4A] hover:bg-[#6B3A38] disabled:bg-[#C17F7C] text-white font-semibold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-[#854C4A]/25 active:scale-[0.98] mt-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}