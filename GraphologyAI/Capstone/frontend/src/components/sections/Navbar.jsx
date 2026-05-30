"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("/profile.jpeg");
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // update avatar
  useEffect(() => {
    if (user?.profilePicture) {
      const imageUrl = user.profilePicture.startsWith('http')
        ? user.profilePicture
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profilePicture}`;
      setImgSrc(imageUrl);
    } else {
      setImgSrc("/profile.jpeg");
    }
  }, [user]);

  // close dropdown
  useEffect(() => {
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleScrollOrNavigate = (page) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "handwriting") {
      router.push("/user/analysis");
    } else if (page === "learn") {
      router.push("/learn-more");
    } else if (page === "login") {
      router.push("/auth/login");
    }
  };

  // Hide Navbar on Admin pages (admin has its own navbar)
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { label: "Beranda", page: "home" },
    { label: "Analisis Tulis Tangan", page: "handwriting" },
    { label: "Pelajari Lebih Lanjut", page: "learn" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FFF8F4]/95 backdrop-blur-md border-b border-[#DBC9C4]/40 transition-all duration-300" suppressHydrationWarning>
      <div className="max-w-full mx-auto px-8 py-6 flex items-center justify-between" suppressHydrationWarning>
        <div onClick={() => handleScrollOrNavigate("home")} className="cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-2xl font-semibold tracking-[0.12em] text-[#854C4A]">Grafologi</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => {
            const active = (item.page === "home" && pathname === "/") ||
              (item.page === "handwriting" && pathname === "/user/homeanalisis") ||
              (item.page === "learn" && pathname === "/learn-more");

            return (
              <button
                key={item.page}
                onClick={() => handleScrollOrNavigate(item.page)}
                className={`relative text-base font-semibold transition-colors ${active ? "text-[#854C4A]" : "text-[#524342] hover:text-[#854C4A]"}`}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#854C4A]" />}
              </button>
            );
          })}

          {isClient && (
            !user ? (
              <button onClick={() => router.push("/auth/login")} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DBC9C4] bg-white text-[#854C4A] shadow-sm transition hover:bg-[#FFF1EB] hover:text-[#524342]">
                <span className="text-lg">👤</span>
              </button>
            ) : (
              <div ref={profileRef} className="relative">
                <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-3 bg-[#854C4A] text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-[#C17F7C] transition-all">
                  <span>Akun</span>
                  <img src={imgSrc} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden animate-fade-in-down">
                    <div className="px-4 py-3 border-b bg-gray-50/50">
                      <div className="font-semibold text-gray-800">{user.name || "User"}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-[#1e3a8a] mt-1 font-medium bg-blue-50 inline-block px-1.5 py-0.5 rounded">Role: {user.role || "user"}</div>
                    </div>
                    {user.role === "admin" && (
                      <button onClick={() => router.push("/admin")} className="block w-full px-4 py-2 text-left hover:bg-gray-50 font-medium text-purple-600 transition-colors">
                        📊 Admin Dashboard
                      </button>
                    )}
                    <button onClick={() => router.push("/profile")} className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors">
                      👤 Profile
                    </button>
                    <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
