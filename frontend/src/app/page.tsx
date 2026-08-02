import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACW-cHlcV4OCHkdgUar1cVi0_M7SQFIFpRiYCPTpdSUjUKbbcxMweo0zPMW6FGpy5k2ax5BOjmWGt0v5UFdh2vqUxwsgbs6JlCurOjrDvN_qiTFxlGwMp8zGK5fjlNM7NZ8W67Nmb0V4NE2DCXviACZLCkRrCsTlEkEuE969AjvMjbE2xsjpg_nUo7dGPAPlvNarbhEDgG2kjhtyCEx2j0yuy5ljFUFEkgQA2UM9uVTRZQZUGxDwcq')"
            }}
          ></div>
          <div className="absolute inset-0 bg-[#0F172A] bg-opacity-70 mix-blend-multiply"></div>
          <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto flex flex-col items-start gap-md py-xl">
            <span className="bg-[#F97316] text-white font-label-md text-label-md px-sm py-xs rounded uppercase tracking-wider inline-block">
              Industrial Grade
            </span>
            <h1 className="font-display-lg text-[40px] md:text-display-lg text-white max-w-3xl leading-tight">
              Heavy-Duty Equipment, Ready When You Are.
            </h1>
            <p className="font-body-lg text-body-lg text-gray-200 max-w-2xl">
              Rent the best tools for your next project with flexible terms and nationwide delivery. Built for professionals who demand reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm mt-sm w-full sm:w-auto">
              <Link
                className="inline-flex items-center justify-center bg-[#F97316] text-white font-headline-md text-[16px] md:text-headline-md px-lg py-sm rounded hover:bg-orange-600 transition-colors scale-95 hover:scale-100 duration-200 shadow-sm whitespace-nowrap"
                href="/equipment"
              >
                Browse Equipment
              </Link>
              <Link
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-headline-md text-[16px] md:text-headline-md px-lg py-sm rounded hover:bg-white hover:text-[#0F172A] transition-colors scale-95 hover:scale-100 duration-200 whitespace-nowrap"
                href="/quote"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </section>
        
        {/* Search / Filter Bar (Overlapping) */}
        <section className="w-full px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto -mt-lg relative z-20 pb-16">
          <div className="bg-[#FFFFFF] border border-outline-variant rounded-lg shadow-sm p-sm md:p-md flex flex-col md:flex-row gap-sm items-center">
            <div className="flex-grow w-full relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-gray-500">
                search
              </span>
              <input
                className="w-full pl-lg pr-sm py-sm bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all outline-none font-body-md"
                placeholder="Search equipment by name, category, or brand..."
                type="text"
              />
            </div>
            <div className="flex gap-sm w-full md:w-auto">
              <select className="w-full md:w-48 px-sm py-sm bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none font-body-md appearance-none">
                <option>Any Category</option>
                <option>Earthmoving</option>
                <option>Material Handling</option>
              </select>
              <select className="w-full md:w-48 px-sm py-sm bg-[#FFFFFF] text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none font-body-md appearance-none">
                <option>Any Location</option>
                <option>Texas Hub</option>
                <option>Ohio Hub</option>
              </select>
            </div>
            <button className="w-full md:w-auto bg-[#0F172A] text-white px-lg py-sm rounded font-label-md text-label-md hover:bg-gray-800 transition-colors whitespace-nowrap">
              Find Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
