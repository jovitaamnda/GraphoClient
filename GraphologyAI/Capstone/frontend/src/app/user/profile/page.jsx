"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updateUser } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    currentPassword: "",
    newPassword: ""
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fileInputRef = useRef(null);

  // Protected Route Check
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Fetch Data on Load
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          age: data.profile?.age || "",
          gender: data.profile?.gender || "",
          currentPassword: "",
          newPassword: ""
        });

        if (data.profilePicture) {
          const url = data.profilePicture.startsWith('http')
            ? data.profilePicture
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${data.profilePicture}`;
          setAvatarPreview(url);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('name', formData.name);
      dataToSubmit.append('email', formData.email);
      dataToSubmit.append('phoneNumber', formData.phone);
      dataToSubmit.append('age', formData.age);
      dataToSubmit.append('gender', formData.gender);
      if (file) {
        dataToSubmit.append('profilePicture', file);
      }

      // Update Profile
      const updatedUser = await authApi.updateProfile(dataToSubmit);

      // Change Password if requested
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          alert("Please provide current password to set a new one.");
          return;
        }
        await authApi.changePassword(formData.currentPassword, formData.newPassword);
      }

      if (updateUser) updateUser(updatedUser);

      alert("Profil berhasil diperbarui!");
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));

    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row items-stretch gap-8">
          {/* Left purple panel */}
          <div className="md:w-1/3 bg-purple-500 rounded-lg p-10 flex flex-col items-center justify-center text-center text-white">
            {/* Avatar */}
            <div
              className="relative w-40 h-40 rounded-full bg-purple-700 mb-6 overflow-hidden shadow-lg cursor-pointer group border-4 border-white/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={avatarPreview || "/profile.jpeg"}
                alt="avatar"
                fill
                className="object-cover"
                onError={(e) => { e.target.src = "/profile.jpeg" }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <h2 className="text-2xl font-bold mb-1">{formData.name}</h2>
            <p className="text-purple-200">{user.email}</p>
          </div>

          {/* Right white card */}
          <div className="md:w-2/3 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h1 className="text-3xl font-serif mb-1 text-gray-800">Profile Settings</h1>
            <p className="text-sm text-gray-500 mb-8">Manage your personal information</p>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Umur</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Ganti Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="Password Saat Ini" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="Password Baru" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4">
                <button type="button" onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium px-4">
                  Logout
                </button>
                <button type="submit" disabled={saving} className="bg-purple-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition disabled:opacity-70 disabled:cursor-not-allowed font-medium">
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
