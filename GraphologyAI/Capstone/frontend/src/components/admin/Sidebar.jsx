"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, BarChart2, Download } from "lucide-react";

const menu = [
  { name: "Dashboard",      href: "/admin",               icon: LayoutDashboard },
  { name: "Data User",      href: "/admin/data-user",     icon: Users },
  { name: "Data Analisis",  href: "/admin/data-analisis", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#FFF8F4] border-r border-[#DBC9C4] min-h-screen fixed top-0 left-0 flex flex-col">
      {/* Brand */}
      <div className="px-8 py-7 border-b border-[#DBC9C4]">
        <span className="text-2xl font-semibold font-serif tracking-[0.1em] text-[#854C4A]">
          Grafologi
        </span>
        <p className="text-xs text-[#6E5B42] mt-1 tracking-widest uppercase font-medium">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#854C4A] text-white shadow-md shadow-[#854C4A]/20"
                  : "text-[#6E5B42] hover:bg-[#F8E3DC] hover:text-[#854C4A]"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-white" : "text-[#C17F7C]"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-[#DBC9C4]">
        <p className="text-xs text-[#B8A89E]">© 2026 Grafologi</p>
      </div>
    </aside>
  );
}
