'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import NextImage from 'next/image';
import { useCart } from '@/context/CartContext';

function CategoryContent() {
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryName = searchParams.get('name') || '';

  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    api.get('/equipment?limit=200')
      .then(res => {
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        // Filter by category name (case-insensitive)
        const filtered = items.filter((item: any) => 
          item.category?.name?.toLowerCase() === categoryName.toLowerCase()
        );
        setEquipment(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryName]);

  return (
    <main className="flex-grow flex flex-col bg-[#F8FAFC]">
      <section className="text-black pt-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16">
          <h1 className="text-xl md:text-2xl font-bold text-[#0F172A]">{categoryName || 'Category'}</h1>
          <p className="text-slate-500 text-xs md:text-sm">Explore our collection of {categoryName?.toLowerCase() || 'equipment'}.</p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-12 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-[#F97316]">progress_activity</span>
            <p className="mt-4 text-slate-500 font-medium">Loading equipment...</p>
          </div>
        ) : !categoryName ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">category</span>
            <h2 className="text-xl font-bold text-slate-700 mt-4">No Category Selected</h2>
            <Link href="/" className="mt-6 inline-block bg-[#F97316] text-white px-6 py-2.5 rounded font-bold hover:bg-orange-600 transition-colors">
              Back to Home
            </Link>
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">inventory_2</span>
            <h2 className="text-xl font-bold text-slate-700 mt-4">No equipment found</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">We couldn't find any equipment in this category.</p>
            <Link href="/" className="mt-6 inline-block bg-[#F97316] text-white px-6 py-2.5 rounded font-bold hover:bg-orange-600 transition-colors">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {equipment.map(item => (
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
        )}
      </section>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center bg-[#F8FAFC]">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#F97316]">progress_activity</span>
        </div>
      }>
        <CategoryContent />
      </Suspense>
      <Footer />
    </div>
  );
}
