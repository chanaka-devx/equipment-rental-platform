'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect, useCallback } from 'react';

const heroImages = [
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/drone%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/Photo%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/construction%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/events.png',
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Carousel */}
        <section className="relative w-full h-[500px] overflow-hidden bg-[#0F172A]">

          {/* Images — z-0, stacked, only active visible */}
          {heroImages.map((img, index) => (
            <img
              key={img}
              src={img}
              alt={`Hero slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ zIndex: 0 }}
            />
          ))}

          {/* Hero Text Content — z-10, pointer-events-none to pass through to arrows */}
          <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
            <div className="w-full px-6 md:px-16 max-w-[1200px] mx-auto flex flex-col items-start gap-5">
              <span className="pointer-events-auto bg-[#F97316] text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest shadow-md">
                Industrial Grade
              </span>
              <h1 className="text-4xl md:text-5xl text-white font-extrabold max-w-3xl leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Rent the Gear<br/>Get the Job Done.
              </h1>
              <p className="text-base md:text-lg text-white font-medium max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Rent the best tools for your next project with flexible terms and nationwide delivery. Built for professionals who demand reliability.
              </p>
              
            </div>
          </div>

          {/* Left Arrow — z-20, always visible */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#F97316] text-white flex items-center justify-center transition-all shadow-lg"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', lineHeight: 1 }}>chevron_left</span>
          </button>

          {/* Right Arrow — z-20, always visible */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#F97316] text-white flex items-center justify-center transition-all shadow-lg"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', lineHeight: 1 }}>chevron_right</span>
          </button>

          {/* Indicator Dots — z-20 */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroImages.map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-[#F97316]' : 'w-2.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Search / Filter Bar */}
        <section className="w-full px-6 md:px-16 max-w-[1200px] mx-auto -mt-8 relative z-20 pb-16">
          <div className="bg-white border border-slate-200 rounded-lg shadow-md p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow w-full relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '20px' }}>
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all outline-none text-sm"
                placeholder="Search equipment by name, category, or brand..."
                type="text"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select className="w-full md:w-44 px-3 py-2.5 bg-white text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] outline-none text-sm appearance-none">
                <option>Any Category</option>
                <option>Earthmoving</option>
                <option>Material Handling</option>
              </select>
              <select className="w-full md:w-44 px-3 py-2.5 bg-white text-[#1E293B] border border-gray-300 rounded focus:border-[#F97316] outline-none text-sm appearance-none">
                <option>Any Location</option>
                <option>Texas Hub</option>
                <option>Ohio Hub</option>
              </select>
            </div>
            <button className="w-full md:w-auto bg-[#0F172A] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-slate-700 transition-colors whitespace-nowrap">
              Find Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
