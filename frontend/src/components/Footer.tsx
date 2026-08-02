import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white w-full mt-auto">
      <div className="w-full py-xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Brand Column */}
        <div className="flex flex-col gap-sm">
          <Link className="font-headline-md text-headline-md font-bold text-white flex items-center gap-2" href="/">
            <span className="material-symbols-outlined text-[#F97316]" style={{ fontVariationSettings: "'FILL' 1" }}>
              precision_manufacturing
            </span>
            RentForge
          </Link>
          <p className="font-body-sm text-body-sm text-gray-300 max-w-xs mt-xs">
            Providing industrial-grade machinery and unwavering support for heavy-duty projects nationwide.
          </p>
          <p className="font-body-sm text-body-sm text-gray-400 mt-auto pt-4">
            © 2024 RentForge Industrial. All rights reserved. Precision &amp; Reliability.
          </p>
        </div>
        {/* Links Column */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-label-md text-label-md text-gray-400 uppercase tracking-wider mb-xs">
            Company
          </h3>
          <nav className="flex flex-col gap-xs">
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit" href="/locations">
              Locations
            </Link>
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit" href="/contact">
              Contact Us
            </Link>
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit" href="/certifications">
              Certifications
            </Link>
          </nav>
        </div>
        {/* Legal Column */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-label-md text-label-md text-gray-400 uppercase tracking-wider mb-xs">
            Legal &amp; Safety
          </h3>
          <nav className="flex flex-col gap-xs">
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit" href="/terms">
              Terms of Service
            </Link>
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="font-body-sm text-body-sm text-white hover:text-[#F97316] transition-all opacity-80 hover:opacity-100 inline-block w-fit flex items-center gap-1" href="/safety">
              <span className="material-symbols-outlined text-[16px]">download</span> Safety Manuals
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
