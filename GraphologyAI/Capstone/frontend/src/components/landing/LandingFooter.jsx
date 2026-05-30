export default function LandingFooter() {
  return (
    <footer className="bg-[#FFF8F4] text-[#524342]">
      <div className="mx-auto max-w-full w-full px-8 py-8 border-t border-[#DBC9C4]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium">Grafologi © 2026</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="transition hover:text-[#854C4A]">Tentang</a>
            <a href="#" className="transition hover:text-[#854C4A]">Privasi</a>
            <a href="#" className="transition hover:text-[#854C4A]">Bantuan</a>
            <a href="#" className="transition hover:text-[#854C4A]">Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
