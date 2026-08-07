'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextImage from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Category {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  rentalPrice?: number;
  categoryId?: string;
  images?: string[];
}

const heroImages = [
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/drone%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/Photo%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/construction%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png',
  'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/events.png',
];

export default function LandingPage() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    api.get('/categories')
       .then(res => setCategories(res.data || []))
       .catch(console.error);
    
    api.get('/equipment?limit=200')
       .then(res => {
         const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
         setEquipment(items);
       })
       .catch(console.error);
  }, []);

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

        {/* Equipment Categories */}
        <section className="w-full px-6 md:px-16 max-w-[1200px] mx-auto py-16 space-y-16">
          {categories.map(category => {
            const catItems = equipment.filter(e => e.categoryId === category.id).slice(0, 4);
            if (catItems.length === 0) return null; // Don't show empty categories
            return (
              <div key={category.id} className="w-full">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-[#0F172A] whitespace-nowrap">{category.name}</h2>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {catItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => router.push(`/equipment/${item.id}`)}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="aspect-square bg-slate-100 relative">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-400">
                            <span className="material-symbols-outlined text-4xl">
                              <NextImage
                                src="/logo2.svg"
                                alt="RentForge Logo"
                                width={48}
                                height={48}
                                className="h-10 w-auto"
                                priority
                              />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-[#0F172A] mb-1 line-clamp-1 group-hover:text-[#F97316] transition-colors">{item.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{item.description || 'No description available.'}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <p className="font-bold text-[#F97316]">Rs.{item.rentalPrice || 0}/day</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                rentalPrice: item.rentalPrice,
                                deposit: item.deposit,
                                images: item.images,
                              });
                            }}
                            className="text-xs font-bold text-slate-700 hover:text-[#F97316] transition-colors focus:outline-none flex items-center gap-1 relative z-10"
                          >
                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            Rent
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Link */}
                <div className="mt-8 text-center">
                  <Link href={`/category?name=${encodeURIComponent(category.name)}`} className="inline-block text-sm font-bold text-[#0F172A] border-b border-transparent hover:border-[#0F172A] transition-colors">
                    View All
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
        
      </main>

      <Footer />
    </>
  );
}
