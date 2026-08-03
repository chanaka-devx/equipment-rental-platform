import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const linkClass = "text-sm text-slate-400 hover:text-[#F97316] transition-colors";

  return (
    <footer className="bg-[#0F172A] text-white w-full mt-auto border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-12">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">

          {/* Brand — spans 4 cols */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logoRF.svg" alt="RentForge Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-white">Rent</span><span className="text-[#F97316]">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing industrial-grade machinery and unwavering support for heavy-duty projects nationwide.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { name: 'Facebook', url: 'https://www.facebook.com', svg: <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/> },
                { name: 'X', url: 'https://x.com', svg: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/> },
                { name: 'YouTube', url: 'https://youtube.com', svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
                { name: 'Instagram', url: 'https://instagram.com', svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
              ].map((icon) => (
                <a key={icon.name} href={icon.url} target="_blank" rel="noopener noreferrer" aria-label={icon.name}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">{icon.svg}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Company Links — 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Company</h3>
            <Link href="/" className={linkClass}>Home</Link>
            <Link href="/category" className={linkClass}>Equipment</Link>
            <Link href="/locations" className={linkClass}>Locations</Link>
            <Link href="/contact" className={linkClass}>Contact Us</Link>
            <Link href="/certifications" className={linkClass}>Certifications</Link>
          </div>

          {/* Support Links — 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Support</h3>
            <Link href="/faq" className={linkClass}>FAQ</Link>
            <Link href="/how-it-works" className={linkClass}>How It Works</Link>
            <Link href="/pricing" className={linkClass}>Pricing</Link>
            <Link href="/contact" className={linkClass}>Help Center</Link>
          </div>

          {/* Legal Links — 3 cols */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Legal & Safety</h3>
            <Link href="/terms" className={linkClass}>Terms of Service</Link>
            <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
            <Link href="/safety" className={`${linkClass} flex items-center gap-1.5`}>
              <span className="material-symbols-outlined text-[14px]">download</span>
              Safety Manuals
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2024 RentForge Industrial. All rights reserved.</p>
          <p className="text-xs text-slate-600">Precision & Reliability.</p>
        </div>

      </div>
    </footer>
  );
}
