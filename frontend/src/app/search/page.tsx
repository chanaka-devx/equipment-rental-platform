'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Equipment {
  id: string;
  name: string;
  description?: string;
  rentalPrice?: number;
  images?: string[];
  category?: { name: string };
}

function SearchResults() {
  const router = useRouter();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    api.get(`/equipment?name=${encodeURIComponent(query)}&limit=50`)
      .then(res => setResults(res.data?.items || res.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 md:px-16 py-10">

        {/* Header */}
        <div className="mb-8">
          {query ? (
            <>
              <p className="text-sm text-slate-500 mb-1">Showing results for</p>
              <h1 className="text-2xl font-extrabold text-[#0F172A]">"{query}"</h1>
            </>
          ) : (
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Search Equipment</h1>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-200">search_off</span>
            <p className="text-lg font-bold text-slate-500">No equipment found for "{query}"</p>
            <Link href="/" className="text-sm font-bold text-[#F97316] hover:underline">← Back to all equipment</Link>
          </div>
        )}

        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-200">search</span>
            <p className="text-lg font-bold text-slate-500">Type something to search</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {results.map(item => (
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
                        <Image src="/logo2.svg" alt="RentForge" width={48} height={48} className="opacity-20" />
                      </div>
                    )}
                    {item.category && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-600 rounded-full border border-slate-200">
                        {item.category.name}
                      </span>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
