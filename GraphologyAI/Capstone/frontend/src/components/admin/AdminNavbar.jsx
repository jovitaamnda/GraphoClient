"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Bell, User, LogOut, ChevronDown, Menu, X, LayoutDashboard, Users, FileText, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard",       href: "/admin",               icon: LayoutDashboard },
  { label: "Data User",       href: "/admin/data-user",     icon: Users },
  { label: "Data Analisis",   href: "/admin/data-analisis", icon: FileText },
];

const mockNotifications = [
  { id: 1, text: "User baru 'Chandra Wijaya' mendaftar hari ini", time: "5 menit yang lalu", unread: true },
  { id: 2, text: "Analisis tulisan tangan ID #TRX902 selesai diproses", time: "1 jam yang lalu", unread: true },
  { id: 3, text: "Sistem berhasil memperbarui basis data grafologi", time: "4 jam yang lalu", unread: false },
];

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => { 
    setIsClient(true); 
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const hasUnread = notifications.some(n => n.unread);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isClient) return null;

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#FFF8F4]/90 backdrop-blur-md border-b border-[#EDE0D8] py-3.5 shadow-sm" 
          : "bg-[#FFF8F4]/95 backdrop-blur-sm border-b border-[#EDE0D8]/60 py-5"
      }`}
    >
      <div className="max-w-full mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* Left: Brand */}
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#854C4A] flex items-center justify-center shadow-md shadow-[#854C4A]/20">
            <span className="text-white font-serif font-bold text-lg">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-serif tracking-[0.08em] text-[#854C4A] leading-tight">Grafologi</span>
            <span className="text-[10px] font-extrabold text-[#B8A89E] uppercase tracking-widest leading-none mt-0.5">Admin Portal</span>
          </div>
        </Link>

        {/* Center: Nav Items (Desktop) */}
        <div className="hidden md:flex items-center bg-[#EDE0D8]/45 p-1.5 rounded-full border border-[#EDE0D8]/80">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 rounded-full shrink-0 flex items-center gap-2 ${
                  active ? "text-[#854C4A]" : "text-[#6E5B42] hover:text-[#854C4A]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-active-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-[#EDE0D8]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2.5 rounded-full border transition-all duration-300 ${
                isNotifOpen 
                  ? "bg-[#854C4A]/10 border-[#854C4A]/30 text-[#854C4A]" 
                  : "bg-white border-[#EDE0D8] text-[#C17F7C] hover:text-[#854C4A] hover:bg-[#FFF3ED] hover:scale-[1.02]"
              }`}
            >
              <Bell className="w-4.5 h-4.5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#854C4A] rounded-full border border-[#FFF8F4] animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#FDFAF8] shadow-xl rounded-2xl border border-[#EDE0D8] overflow-hidden z-50"
                >
                  <div className="px-5 py-4 border-b border-[#EDE0D8] bg-[#FFF8F4]/80 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-[#221A13] font-serif">Notifikasi</h3>
                      <p className="text-xs text-[#6E5B42] mt-0.5">Aktivitas admin terbaru</p>
                    </div>
                    {hasUnread && (
                      <button 
                        onClick={markAllRead}
                        className="text-[11px] font-extrabold text-[#854C4A] hover:text-[#C17F7C] transition flex items-center gap-1 bg-white border border-[#EDE0D8] px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <Check className="w-3 h-3" /> Tandai Semua Dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EDE0D8]">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 transition hover:bg-[#FFF8F4]/40 flex gap-3 ${n.unread ? "bg-[#854C4A]/5" : ""}`}
                      >
                        <div className="mt-1 shrink-0">
                          <span className={`w-2 h-2 rounded-full block ${n.unread ? "bg-[#854C4A]" : "bg-transparent"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#221A13] leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-[#B8A89E] font-medium mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
                isDropdownOpen 
                  ? "bg-[#854C4A] text-white border-transparent shadow-md shadow-[#854C4A]/20" 
                  : "bg-white border-[#EDE0D8] text-[#221A13] hover:border-[#854C4A]/40 hover:scale-[1.02] shadow-sm"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#EDE0D8] overflow-hidden border border-white/60 relative shrink-0">
                <Image
                  src={
                    user?.profilePicture
                      ? (user.profilePicture.startsWith("http")
                          ? user.profilePicture
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.profilePicture}`)
                      : "/profile.jpeg"
                  }
                  alt="Profile"
                  fill
                  className="object-cover"
                  onError={(e) => { e.target.src = "/profile.jpeg"; }}
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{user?.name?.split(" ")[0] || "Admin"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-[#FDFAF8] shadow-xl rounded-2xl border border-[#EDE0D8] overflow-hidden z-50"
                >
                  <div className="px-5 py-4 border-b border-[#EDE0D8] bg-[#FFF8F4]/80">
                    <p className="text-[10px] font-extrabold text-[#854C4A] uppercase tracking-widest">Administrator</p>
                    <p className="text-xs text-[#221A13] font-bold truncate mt-1">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setIsDropdownOpen(false); router.push("/admin/profile"); }}
                      className="flex w-full items-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#6E5B42] hover:bg-[#FFF8F4] hover:text-[#854C4A] transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-[#C17F7C]" />
                      Kelola Profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors border-t border-[#EDE0D8]/40"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Keluar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Menu Trigger (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full border border-[#EDE0D8] bg-white text-[#854C4A] hover:bg-[#FFF3ED] transition-colors shadow-sm"
          >
            {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#FFF8F4] border-l border-[#EDE0D8] z-50 p-6 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-6 border-b border-[#EDE0D8]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#854C4A] flex items-center justify-center">
                      <span className="text-white font-serif font-bold text-sm">G</span>
                    </div>
                    <span className="text-md font-bold font-serif text-[#854C4A] tracking-wider">Grafologi</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-[#EDE0D8]/40 text-[#6E5B42] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Items */}
                <div className="mt-8 flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        href={item.href}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                          active
                            ? "bg-[#854C4A] text-white shadow-sm"
                            : "text-[#6E5B42] hover:bg-[#FFF3ED] hover:text-[#854C4A]"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile User Context & Logout */}
              <div className="pt-6 border-t border-[#EDE0D8]">
                <div className="flex items-center gap-3 mb-5 px-2">
                  <div className="w-9 h-9 rounded-full bg-[#EDE0D8] overflow-hidden border border-[#854C4A]/10 relative shrink-0">
                    <Image
                      src={
                        user?.profilePicture
                          ? (user.profilePicture.startsWith("http")
                              ? user.profilePicture
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${user.profilePicture}`)
                          : "/profile.jpeg"
                      }
                      alt="Profile"
                      fill
                      className="object-cover"
                      onError={(e) => { e.target.src = "/profile.jpeg"; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#221A13] truncate uppercase tracking-wider">{user?.name || "Admin"}</p>
                    <p className="text-[10px] text-[#B8A89E] font-medium truncate mt-0.5">{user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => { setIsMobileMenuOpen(false); router.push("/admin/profile"); }}
                  className="flex w-full items-center px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#6E5B42] hover:bg-[#FFF3ED] hover:text-[#854C4A] transition-all mb-2"
                >
                  <User className="w-4 h-4 mr-3 text-[#C17F7C]" />
                  Kelola Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Keluar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
