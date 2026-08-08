'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Equipment {
  id: string;
  name: string;
  description?: string;
  rentalPrice?: number;
  deposit?: number;
  stockQuantity?: number;
  available?: boolean;
  category?: { name: string };
  images?: string[];
  specifications?: Record<string, any>;
  requiresDocuments?: boolean;
  requiredDocumentTypes?: string[];
}

export default function EquipmentDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToCart } = useCart();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/${id}`);
        setEquipment(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load equipment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#F97316]">progress_activity</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Equipment Not Found</h1>
          <p className="text-slate-500 mb-6">{error || "The equipment you're looking for doesn't exist or is currently unavailable."}</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-lg font-bold hover:bg-[#1E293B] transition-colors">
            Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRent = () => {
    addToCart({
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      rentalPrice: equipment.rentalPrice,
      deposit: equipment.deposit,
      images: equipment.images,
      requiresDocuments: equipment.requiresDocuments,
      requiredDocumentTypes: equipment.requiredDocumentTypes,
    });
  };

  const handleRentNow = () => {
    handleRent();
    router.push('/checkout');
  };

  const hasStock = equipment.available !== false && (equipment.stockQuantity ?? 1) > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          
          {/* Images Section */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 flex flex-col justify-center">
            <div className="aspect-[4/3] max-h-[350px] bg-white rounded-xl border border-slate-200 overflow-hidden relative mb-4">
              {equipment.images && equipment.images[activeImage] ? (
                <img src={equipment.images[activeImage]} alt={equipment.name} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-300 gap-2">
                  <Image src="/logo2.svg" alt="RentForge Logo" width={80} height={80} className="opacity-20" priority />
                  <p className="text-sm font-medium">No Image</p>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {equipment.images && equipment.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {equipment.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden ${activeImage === idx ? 'border-[#F97316]' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              {equipment.category && (
                <span className="inline-block px-3 py-1 bg-orange-50 text-[#F97316] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  {equipment.category.name}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-2">{equipment.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <p className="text-3xl font-bold text-[#F97316]">
                  Rs.{equipment.rentalPrice || 0}
                  <span className="text-lg text-slate-400 font-medium ml-1">/ day</span>
                </p>
                {equipment.deposit ? (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                    + Rs.{equipment.deposit} deposit
                  </span>
                ) : null}
              </div>
            </div>

            <div className="prose prose-sm sm:prose-base text-slate-600 mb-8 max-w-none">
              <p>{equipment.description || 'No detailed description provided for this equipment.'}</p>
            </div>

            {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {Object.entries(equipment.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm capitalize">{key}</span>
                      <span className="text-[#0F172A] font-medium text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-3 h-3 rounded-full ${hasStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-bold ${hasStock ? 'text-green-700' : 'text-red-600'}`}>
                  {hasStock ? `${equipment.stockQuantity} in stock — Ready to rent` : 'Currently out of stock'}
                </span>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleRent}
                  disabled={!hasStock}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    hasStock 
                      ? 'bg-orange-100 hover:bg-orange-200 text-[#F97316] border border-orange-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  Add to Cart
                </button>
                <button
                  onClick={handleRentNow}
                  disabled={!hasStock}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    hasStock 
                      ? 'bg-[#F97316] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                  Rent Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
