"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginRequiredModal from "@/components/modals/LoginRequiredModal";
import { User } from "lucide-react";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("/profile.jpeg");
  const [isClient, setIsClient] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      router.push(user ? "/user/dashboard" : "/");
    } else if (page === "handwriting") {
      if (user) {
        router.push("/user/analysis");
      } else {
        setShowLoginModal(true);
      }
    } else if (page === "learn") {
      if (user) {
        router.push("/learn-more");
      } else {
        setShowLoginModal(true);
      }
    } else if (page === "profile") {
      router.push("/user/profile");
    } else if (page === "login") {
      router.push("/auth/login");
    }
  };

  // Hide Navbar on Admin pages (admin has its own navbar)
  if (pathname.startsWith("/admin")) return null;

  // Prevent hydration mismatch by rendering only on the client
  if (!isClient) return null;

  const navItems = [
    { label: "Beranda", page: "home" },
    { label: "Analisis Tulisan Tangan", page: "handwriting" },
    { label: "Pelajari Lebih Lanjut", page: "learn" },
    ...(user ? [{ label: "Akun", page: "profile" }] : []),
  ];

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-[#FFF8F4]/95 backdrop-blur-md border-b border-[#DBC9C4]/40 transition-all duration-300" suppressHydrationWarning>
      <div className="max-w-full mx-auto px-8 py-6 flex items-center justify-between" suppressHydrationWarning>
        <div onClick={() => handleScrollOrNavigate("home")} className="cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-2xl font-semibold tracking-[0.12em] text-[#854C4A]">Grafologi</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => {
            const active = (item.page === "home" && (pathname === "/" || pathname === "/user/dashboard")) ||
              (item.page === "handwriting" && pathname === "/user/analysis") ||
              (item.page === "learn" && pathname === "/learn-more") ||
              (item.page === "profile" && pathname === "/user/profile");

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
              /* ── Tamu: tampilkan "Login" sebagai teks nav ── */
              <button
                onClick={() => router.push("/auth/login")}
                className="relative text-base font-semibold text-[#524342] hover:text-[#854C4A] transition-colors"
              >
                Login
              </button>
            ) : (
              /* ── User login: dropdown Akun ── */
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="w-10 h-10 rounded-full border border-[#DBC9C4] flex items-center justify-center text-[#854C4A] hover:bg-[#854C4A]/5 transition-all"
                >
                  <User className="w-5 h-5 text-[#524342]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-2xl border border-[#EDE0D8] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F0E6E0]">
                      <div className="font-semibold text-[#221A13] text-sm">{user.name || "User"}</div>
                      <div className="text-xs text-[#6E5B42] mt-0.5 truncate">{user.email}</div>
                    </div>
                    {user.role === "admin" && (
                      <button
                        onClick={() => router.push("/admin")}
                        className="block w-full px-4 py-2.5 text-left text-sm text-[#854C4A] font-semibold hover:bg-[#FFF8F4] transition-colors"
                      >
                        📊 Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => router.push("/user/dashboard")}
                      className="block w-full px-4 py-2.5 text-left text-sm text-[#524342] hover:bg-[#FFF8F4] transition-colors"
                    >
                      🏠 Dashboard
                    </button>
                    <button
                      onClick={() => router.push("/user/profile")}
                      className="block w-full px-4 py-2.5 text-left text-sm text-[#524342] hover:bg-[#FFF8F4] transition-colors"
                    >
                      👤 Profil Saya
                    </button>
                    <div className="border-t border-[#F0E6E0]">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        🚪 Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </nav>

    <LoginRequiredModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
    />
  </>
  );
}
