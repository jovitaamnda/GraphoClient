import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF8F4]">
      <AdminNavbar />
      <main className="pt-24 px-8 pb-12">
        {children}
      </main>
    </div>
  );
}
