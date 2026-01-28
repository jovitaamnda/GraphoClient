import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0a0a0a] text-white pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Background Pattern - Grid for 'Graphology' feel */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Top Glow/Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 mb-16 relative z-10">
        {/* Brand Section & Newsletter (Wider) */}
        <div className="md:col-span-5 space-y-6">
          <div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-indigo-100 to-gray-400 bg-clip-text text-transparent inline-block">
              Grapholyze
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm max-w-md">
              Platform AI terdepan untuk analisis tulisan tangan. Gabungan psikologi mendalam dan kecerdasan buatan untuk mengungkap potensi tersembunyi Anda.
            </p>
          </div>

          {/* New Feature: Newsletter Input */}
          <div className="max-w-sm">
            <h4 className="text-sm font-semibold text-indigo-200 mb-2">Dapatkan Update Terbaru</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder:text-gray-600"
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="md:col-span-2 md:col-start-7">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Menu</h3>
          <ul className="space-y-4 text-gray-400">
            <FooterLink>Handwriting Analysis</FooterLink>
            <FooterLink>Personality Report</FooterLink>
            <FooterLink>API Integration</FooterLink>
            <FooterLink>Pricing</FooterLink>
          </ul>
        </div>

        {/* Support */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Bantuan</h3>
          <ul className="space-y-4 text-gray-400">
            <FooterLink>FAQ</FooterLink>
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Terms of Service</FooterLink>
            <FooterLink>Hubungi Kami</FooterLink>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="md:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Hubungi Kami</h3>
          <ul className="space-y-5 text-gray-400">
            <li className="flex items-start gap-4 group cursor-pointer hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm mt-1.5">grapholyze.ai@gmail.com</span>
            </li>
            <li className="flex items-start gap-4 group cursor-pointer hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm mt-1.5">+62 812 3456 7890</span>
            </li>
            <li className="flex items-start gap-4 group cursor-pointer hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm mt-1.5">Jakarta, Indonesia</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
        <p>&copy; 2026 Grapholyze. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <span className="text-red-500 animate-pulse">❤</span> by GraphologyAI Team
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ children }) {
  return (
    <li>
      <a href="#" className="hover:text-white transition-colors duration-200 flex items-center gap-2 group text-sm">
        <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all"></span>
        {children}
      </a>
    </li>
  );
}
