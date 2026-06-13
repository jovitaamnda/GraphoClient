"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api";

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      return false;
    }
    if (!email.trim()) {
      setError("Email tidak boleh kosong");
      return false;
    }
    if (!email.includes("@")) {
      setError("Format email tidak valid");
      return false;
    }
    if (!age || age < 12) {
      setError("Umur harus diisi (min 12 tahun)");
      return false;
    }
    if (!gender) {
      setError("Silakan pilih jenis kelamin");
      return false;
    }
    if (!password) {
      setError("Password tidak boleh kosong");
      return false;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = await authApi.register({
        name,
        email,
        password,
        age: parseInt(age),
        gender
      });

      // Register berhasil - login otomatis
      if (data.token) {
        localStorage.setItem("authToken", data.token);

        try {
          const userProfile = await authApi.getProfile();
          const userDataToSave = {
            id: userProfile._id || userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role || "user",
            photo: userProfile.profilePicture,
          };

          login({ ...userDataToSave, token: data.token });
          localStorage.setItem("userData", JSON.stringify(userDataToSave));

        } catch (profileError) {
          console.error("Failed to fetch profile after register:", profileError);
          // Fallback
          login({
            token: data.token,
            ...data
          });
        }
      }

      setLoading(false);
      // Diarahkan ke dashboard user
      router.push("/user/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-live="polite">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#FDF2F2] border border-[#F5C5C5] rounded-2xl text-[#C81E1E]">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Nama */}
      <div className="text-left">
        <label className="block text-[#6E5B42] text-sm font-medium mb-2">Nama Lengkap</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17F7C]" size={20} />
          <Input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-12 pr-4 py-6 text-base bg-[#FFFBF8]/70 border-[#DBC9C4] focus:border-[#854C4A] focus:ring-1 focus:ring-[#854C4A] rounded-2xl transition-all"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="text-left">
        <label className="block text-[#6E5B42] text-sm font-medium mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17F7C]" size={20} />
          <Input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-6 text-base bg-[#FFFBF8]/70 border-[#DBC9C4] focus:border-[#854C4A] focus:ring-1 focus:ring-[#854C4A] rounded-2xl transition-all"
            required
          />
        </div>
      </div>

      {/* Age & Gender Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-left">
          <label className="block text-[#6E5B42] text-sm font-medium mb-2">Umur</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17F7C]" size={20} />
            <Input
              type="number"
              placeholder="Contoh: 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="pl-12 pr-4 py-6 text-base bg-[#FFFBF8]/70 border-[#DBC9C4] focus:border-[#854C4A] focus:ring-1 focus:ring-[#854C4A] rounded-2xl transition-all"
              min="12"
              required
            />
          </div>
        </div>
        <div className="text-left">
          <label className="block text-[#6E5B42] text-sm font-medium mb-2">Jenis Kelamin</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-[#DBC9C4] rounded-2xl px-4 h-[54px] bg-[#FFFBF8]/70 text-[#221A13] focus:outline-none focus:ring-1 focus:ring-[#854C4A] focus:border-[#854C4A] transition-all text-base"
            required
          >
            <option value="" disabled className="text-gray-400">Pilih...</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Password */}
      <div className="text-left">
        <label className="block text-[#6E5B42] text-sm font-medium mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17F7C]" size={20} />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12 pr-12 py-6 text-base bg-[#FFFBF8]/70 border-[#DBC9C4] focus:border-[#854C4A] focus:ring-1 focus:ring-[#854C4A] rounded-2xl transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C17F7C] hover:text-[#854C4A] transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Konfirmasi Password */}
      <div className="text-left">
        <label className="block text-[#6E5B42] text-sm font-medium mb-2">Konfirmasi Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17F7C]" size={20} />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-12 pr-12 py-6 text-base bg-[#FFFBF8]/70 border-[#DBC9C4] focus:border-[#854C4A] focus:ring-1 focus:ring-[#854C4A] rounded-2xl transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C17F7C] hover:text-[#854C4A] transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className={`w-full bg-[#854C4A] hover:bg-[#6B3A38] text-white py-6 text-base font-semibold rounded-2xl shadow-lg transition-all ${
          loading ? "opacity-80 pointer-events-none" : ""
        }`}
      >
        {loading ? "Mendaftar..." : "Daftar Sekarang"}
      </Button>
    </form>
  );
}
